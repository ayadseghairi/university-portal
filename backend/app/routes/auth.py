from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import (
    create_access_token, create_refresh_token, jwt_required, 
    get_jwt_identity, get_jwt, set_access_cookies, set_refresh_cookies,
    unset_jwt_cookies
)
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import bcrypt
from datetime import datetime, timedelta
from ..database import get_db_connection, hash_password, verify_password, log_activity
from ..utils.validators import validate_email, validate_password
from ..utils.permissions import check_permission

auth_bp = Blueprint('auth', __name__)

# Rate limiting for auth endpoints
limiter = Limiter(key_func=get_remote_address)

@auth_bp.route('/login', methods=['POST'])
@limiter.limit("5 per minute")
def login():
    """User login with enhanced security"""
    try:
        data = request.get_json()
        username = data.get('username', '').strip()
        password = data.get('password', '')
        
        if not username or not password:
            return jsonify({'error': 'Username and password are required'}), 400
        
        with get_db_connection() as conn:
            user = conn.execute('''
                SELECT u.*, c.name as college_name, f.name as faculty_name 
                FROM users u
                LEFT JOIN colleges c ON u.college_id = c.id
                LEFT JOIN faculties f ON u.faculty_id = f.id
                WHERE (u.username = ? OR u.email = ?) AND u.is_active = 1
            ''', (username, username)).fetchone()
            
            if not user or not verify_password(password, user['password_hash']):
                # Log failed login attempt
                log_activity(
                    user_id=user['id'] if user else None,
                    action='login_failed',
                    details=f'Failed login attempt for username: {username}',
                    ip_address=request.remote_addr,
                    user_agent=request.headers.get('User-Agent')
                )
                return jsonify({'error': 'Invalid credentials'}), 401
            
            # Update last login
            conn.execute(
                'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
                (user['id'],)
            )
            
            # Create tokens
            access_token = create_access_token(
                identity=user['id'],
                additional_claims={
                    'role': user['role'],
                    'college_id': user['college_id'],
                    'faculty_id': user['faculty_id']
                }
            )
            refresh_token = create_refresh_token(identity=user['id'])
            
            # Log successful login
            log_activity(
                user_id=user['id'],
                action='login_success',
                details='User logged in successfully',
                ip_address=request.remote_addr,
                user_agent=request.headers.get('User-Agent')
            )
            
            response = jsonify({
                'message': 'Login successful',
                'user': {
                    'id': user['id'],
                    'username': user['username'],
                    'name': user['name'],
                    'email': user['email'],
                    'role': user['role'],
                    'college_id': user['college_id'],
                    'faculty_id': user['faculty_id'],
                    'college_name': user['college_name'],
                    'faculty_name': user['faculty_name']
                }
            })
            
            # Set secure cookies
            set_access_cookies(response, access_token)
            set_refresh_cookies(response, refresh_token)
            
            return response
            
    except Exception as e:
        current_app.logger.error(f'Login error: {str(e)}')
        return jsonify({'error': 'Login failed'}), 500

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """User logout"""
    try:
        user_id = get_jwt_identity()
        
        # Log logout
        log_activity(
            user_id=user_id,
            action='logout',
            details='User logged out',
            ip_address=request.remote_addr,
            user_agent=request.headers.get('User-Agent')
        )
        
        response = jsonify({'message': 'Logout successful'})
        unset_jwt_cookies(response)
        return response
        
    except Exception as e:
        current_app.logger.error(f'Logout error: {str(e)}')
        return jsonify({'error': 'Logout failed'}), 500

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """Refresh access token"""
    try:
        user_id = get_jwt_identity()
        
        with get_db_connection() as conn:
            user = conn.execute(
                'SELECT * FROM users WHERE id = ? AND is_active = 1',
                (user_id,)
            ).fetchone()
            
            if not user:
                return jsonify({'error': 'User not found'}), 404
            
            # Create new access token
            access_token = create_access_token(
                identity=user['id'],
                additional_claims={
                    'role': user['role'],
                    'college_id': user['college_id'],
                    'faculty_id': user['faculty_id']
                }
            )
            
            response = jsonify({'message': 'Token refreshed'})
            set_access_cookies(response, access_token)
            return response
            
    except Exception as e:
        current_app.logger.error(f'Token refresh error: {str(e)}')
        return jsonify({'error': 'Token refresh failed'}), 500

@auth_bp.route('/verify', methods=['GET'])
@jwt_required()
def verify_token():
    """Verify JWT token and return user info"""
    try:
        user_id = get_jwt_identity()
        
        with get_db_connection() as conn:
            user = conn.execute('''
                SELECT u.*, c.name as college_name, f.name as faculty_name 
                FROM users u
                LEFT JOIN colleges c ON u.college_id = c.id
                LEFT JOIN faculties f ON u.faculty_id = f.id
                WHERE u.id = ? AND u.is_active = 1
            ''', (user_id,)).fetchone()
            
            if not user:
                return jsonify({'error': 'User not found'}), 404
            
            return jsonify({
                'id': user['id'],
                'username': user['username'],
                'name': user['name'],
                'email': user['email'],
                'role': user['role'],
                'college_id': user['college_id'],
                'faculty_id': user['faculty_id'],
                'college_name': user['college_name'],
                'faculty_name': user['faculty_name'],
                'last_login': user['last_login']
            })
            
    except Exception as e:
        current_app.logger.error(f'Token verification error: {str(e)}')
        return jsonify({'error': 'Token verification failed'}), 500

@auth_bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    """Change user password"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        current_password = data.get('current_password', '')
        new_password = data.get('new_password', '')
        
        if not current_password or not new_password:
            return jsonify({'error': 'Current and new passwords are required'}), 400
        
        # Validate new password
        if not validate_password(new_password):
            return jsonify({'error': 'Password must be at least 8 characters long and contain uppercase, lowercase, number and special character'}), 400
        
        with get_db_connection() as conn:
            user = conn.execute(
                'SELECT * FROM users WHERE id = ? AND is_active = 1',
                (user_id,)
            ).fetchone()
            
            if not user or not verify_password(current_password, user['password_hash']):
                return jsonify({'error': 'Current password is incorrect'}), 400
            
            # Update password
            new_password_hash = hash_password(new_password)
            conn.execute(
                'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                (new_password_hash, user_id)
            )
            
            # Log password change
            log_activity(
                user_id=user_id,
                action='password_changed',
                details='User changed password',
                ip_address=request.remote_addr,
                user_agent=request.headers.get('User-Agent')
            )
            
            conn.commit()
            
            return jsonify({'message': 'Password changed successfully'})
            
    except Exception as e:
        current_app.logger.error(f'Password change error: {str(e)}')
        return jsonify({'error': 'Password change failed'}), 500

@auth_bp.route('/profile', methods=['GET', 'PUT'])
@jwt_required()
def profile():
    """Get or update user profile"""
    user_id = get_jwt_identity()
    
    if request.method == 'GET':
        try:
            with get_db_connection() as conn:
                user = conn.execute('''
                    SELECT u.*, c.name as college_name, f.name as faculty_name 
                    FROM users u
                    LEFT JOIN colleges c ON u.college_id = c.id
                    LEFT JOIN faculties f ON u.faculty_id = f.id
                    WHERE u.id = ? AND u.is_active = 1
                ''', (user_id,)).fetchone()
                
                if not user:
                    return jsonify({'error': 'User not found'}), 404
                
                return jsonify({
                    'id': user['id'],
                    'username': user['username'],
                    'name': user['name'],
                    'email': user['email'],
                    'role': user['role'],
                    'college_id': user['college_id'],
                    'faculty_id': user['faculty_id'],
                    'college_name': user['college_name'],
                    'faculty_name': user['faculty_name'],
                    'created_at': user['created_at'],
                    'last_login': user['last_login']
                })
                
        except Exception as e:
            current_app.logger.error(f'Profile fetch error: {str(e)}')
            return jsonify({'error': 'Failed to fetch profile'}), 500
    
    elif request.method == 'PUT':
        try:
            data = request.get_json()
            name = data.get('name', '').strip()
            email = data.get('email', '').strip()
            
            if not name:
                return jsonify({'error': 'Name is required'}), 400
            
            if not email or not validate_email(email):
                return jsonify({'error': 'Valid email is required'}), 400
            
            with get_db_connection() as conn:
                # Check if email is already taken by another user
                existing_user = conn.execute(
                    'SELECT id FROM users WHERE email = ? AND id != ?',
                    (email, user_id)
                ).fetchone()
                
                if existing_user:
                    return jsonify({'error': 'Email is already taken'}), 400
                
                # Update profile
                conn.execute('''
                    UPDATE users SET name = ?, email = ?, updated_at = CURRENT_TIMESTAMP 
                    WHERE id = ?
                ''', (name, email, user_id))
                
                # Log profile update
                log_activity(
                    user_id=user_id,
                    action='profile_updated',
                    details='User updated profile information',
                    ip_address=request.remote_addr,
                    user_agent=request.headers.get('User-Agent')
                )
                
                conn.commit()
                
                return jsonify({'message': 'Profile updated successfully'})
                
        except Exception as e:
            current_app.logger.error(f'Profile update error: {str(e)}')
            return jsonify({'error': 'Failed to update profile'}), 500

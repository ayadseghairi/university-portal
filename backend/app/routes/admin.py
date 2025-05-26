from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import sqlite3
import os
from datetime import datetime, timedelta
from ..utils.permissions import admin_required
from werkzeug.security import generate_password_hash

admin_bp = Blueprint('admin', __name__)

def get_db_connection():
    """Get database connection"""
    db_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'university.db')
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

@admin_bp.route('/dashboard', methods=['GET'])
@jwt_required()
@admin_required
def get_dashboard_stats():
    """Get admin dashboard statistics"""
    try:
        conn = get_db_connection()
        
        # Get user statistics
        total_users = conn.execute("SELECT COUNT(*) as count FROM users").fetchone()['count']
        active_users = conn.execute("SELECT COUNT(*) as count FROM users WHERE active = 1").fetchone()['count']
        new_users_today = conn.execute("""
            SELECT COUNT(*) as count FROM users 
            WHERE date(created_at) = date('now')
        """).fetchone()['count']
        
        # Get content statistics
        total_news = conn.execute("SELECT COUNT(*) as count FROM news").fetchone()['count']
        published_news = conn.execute("SELECT COUNT(*) as count FROM news WHERE published = 1").fetchone()['count']
        
        total_faculties = conn.execute("SELECT COUNT(*) as count FROM faculties WHERE active = 1").fetchone()['count']
        total_departments = conn.execute("SELECT COUNT(*) as count FROM departments WHERE active = 1").fetchone()['count']
        
        # Get AI House statistics
        ai_projects = conn.execute("SELECT COUNT(*) as count FROM ai_projects WHERE active = 1").fetchone()['count']
        ai_events = conn.execute("SELECT COUNT(*) as count FROM ai_events WHERE active = 1").fetchone()['count']
        
        # Get Incubator statistics
        startups = conn.execute("SELECT COUNT(*) as count FROM startups WHERE active = 1").fetchone()['count']
        incubator_programs = conn.execute("SELECT COUNT(*) as count FROM incubator_programs WHERE active = 1").fetchone()['count']
        
        # Get upload statistics
        total_uploads = conn.execute("SELECT COUNT(*) as count FROM uploads").fetchone()['count']
        total_upload_size = conn.execute("SELECT SUM(file_size) as size FROM uploads").fetchone()['size'] or 0
        
        # Get recent activity
        recent_users = conn.execute("""
            SELECT username, email, created_at FROM users 
            ORDER BY created_at DESC LIMIT 5
        """).fetchall()
        
        recent_news = conn.execute("""
            SELECT title, created_at FROM news 
            ORDER BY created_at DESC LIMIT 5
        """).fetchall()
        
        conn.close()
        
        return jsonify({
            'users': {
                'total': total_users,
                'active': active_users,
                'new_today': new_users_today
            },
            'content': {
                'total_news': total_news,
                'published_news': published_news,
                'faculties': total_faculties,
                'departments': total_departments
            },
            'ai_house': {
                'projects': ai_projects,
                'events': ai_events
            },
            'incubator': {
                'startups': startups,
                'programs': incubator_programs
            },
            'uploads': {
                'total_files': total_uploads,
                'total_size': total_upload_size
            },
            'recent_activity': {
                'users': [dict(user) for user in recent_users],
                'news': [dict(article) for article in recent_news]
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/users', methods=['GET'])
@jwt_required()
@admin_required
def get_users():
    """Get all users with pagination"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 20, type=int), 50)
        search = request.args.get('search')
        role = request.args.get('role')
        active = request.args.get('active')
        
        conn = get_db_connection()
        
        # Build query
        query = "SELECT id, username, email, role, active, created_at, last_login FROM users WHERE 1=1"
        params = []
        
        if search:
            query += " AND (username LIKE ? OR email LIKE ?)"
            params.extend([f'%{search}%', f'%{search}%'])
        
        if role:
            query += " AND role = ?"
            params.append(role)
        
        if active is not None:
            query += " AND active = ?"
            params.append(1 if active.lower() == 'true' else 0)
        
        query += " ORDER BY created_at DESC LIMIT ? OFFSET ?"
        params.extend([per_page, (page - 1) * per_page])
        
        users = conn.execute(query, params).fetchall()
        
        # Get total count
        count_query = "SELECT COUNT(*) FROM users WHERE 1=1"
        count_params = []
        
        if search:
            count_query += " AND (username LIKE ? OR email LIKE ?)"
            count_params.extend([f'%{search}%', f'%{search}%'])
        
        if role:
            count_query += " AND role = ?"
            count_params.append(role)
        
        if active is not None:
            count_query += " AND active = ?"
            count_params.append(1 if active.lower() == 'true' else 0)
        
        total = conn.execute(count_query, count_params).fetchone()[0]
        conn.close()
        
        return jsonify({
            'users': [dict(user) for user in users],
            'total': total,
            'page': page,
            'per_page': per_page,
            'pages': (total + per_page - 1) // per_page
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/users/<int:user_id>', methods=['GET'])
@jwt_required()
@admin_required
def get_user(user_id):
    """Get a specific user"""
    try:
        conn = get_db_connection()
        user = conn.execute("""
            SELECT id, username, email, role, active, created_at, last_login, avatar_url
            FROM users WHERE id = ?
        """, (user_id,)).fetchone()
        
        if not user:
            conn.close()
            return jsonify({'error': 'User not found'}), 404
        
        # Get user's activity
        user_news = conn.execute("""
            SELECT COUNT(*) as count FROM news WHERE author_id = ?
        """, (user_id,)).fetchone()['count']
        
        user_uploads = conn.execute("""
            SELECT COUNT(*) as count FROM uploads WHERE uploaded_by = ?
        """, (user_id,)).fetchone()['count']
        
        conn.close()
        
        user_dict = dict(user)
        user_dict['activity'] = {
            'news_articles': user_news,
            'uploads': user_uploads
        }
        
        return jsonify(user_dict)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/users', methods=['POST'])
@jwt_required()
@admin_required
def create_user():
    """Create a new user"""
    try:
        data = request.get_json()
        
        required_fields = ['username', 'email', 'password']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        conn = get_db_connection()
        
        # Check if username or email already exists
        existing = conn.execute("""
            SELECT id FROM users WHERE username = ? OR email = ?
        """, (data['username'], data['email'])).fetchone()
        
        if existing:
            conn.close()
            return jsonify({'error': 'Username or email already exists'}), 400
        
        # Hash password
        password_hash = generate_password_hash(data['password'])
        
        cursor = conn.execute("""
            INSERT INTO users (username, email, password_hash, role, active)
            VALUES (?, ?, ?, ?, ?)
        """, (
            data['username'],
            data['email'],
            password_hash,
            data.get('role', 'user'),
            data.get('active', True)
        ))
        
        user_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return jsonify({'message': 'User created successfully', 'id': user_id}), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/users/<int:user_id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_user(user_id):
    """Update a user"""
    try:
        data = request.get_json()
        current_user_id = get_jwt_identity()
        
        # Prevent admin from deactivating themselves
        if user_id == current_user_id and data.get('active') is False:
            return jsonify({'error': 'Cannot deactivate your own account'}), 400
        
        conn = get_db_connection()
        
        # Check if user exists
        existing = conn.execute("SELECT id FROM users WHERE id = ?", (user_id,)).fetchone()
        if not existing:
            conn.close()
            return jsonify({'error': 'User not found'}), 404
        
        # Build update query
        update_fields = []
        params = []
        
        if 'username' in data:
            update_fields.append('username = ?')
            params.append(data['username'])
        
        if 'email' in data:
            update_fields.append('email = ?')
            params.append(data['email'])
        
        if 'role' in data:
            update_fields.append('role = ?')
            params.append(data['role'])
        
        if 'active' in data:
            update_fields.append('active = ?')
            params.append(data['active'])
        
        if 'password' in data and data['password']:
            update_fields.append('password_hash = ?')
            params.append(generate_password_hash(data['password']))
        
        if not update_fields:
            conn.close()
            return jsonify({'error': 'No fields to update'}), 400
        
        update_fields.append('updated_at = CURRENT_TIMESTAMP')
        params.append(user_id)
        
        query = f"UPDATE users SET {', '.join(update_fields)} WHERE id = ?"
        conn.execute(query, params)
        conn.commit()
        conn.close()
        
        return jsonify({'message': 'User updated successfully'})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_user(user_id):
    """Delete a user"""
    try:
        current_user_id = get_jwt_identity()
        
        # Prevent admin from deleting themselves
        if user_id == current_user_id:
            return jsonify({'error': 'Cannot delete your own account'}), 400
        
        conn = get_db_connection()
        
        # Check if user exists
        existing = conn.execute("SELECT id FROM users WHERE id = ?", (user_id,)).fetchone()
        if not existing:
            conn.close()
            return jsonify({'error': 'User not found'}), 404
        
        # Soft delete - deactivate user instead of deleting
        conn.execute("UPDATE users SET active = 0 WHERE id = ?", (user_id,))
        conn.commit()
        conn.close()
        
        return jsonify({'message': 'User deactivated successfully'})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/analytics', methods=['GET'])
@jwt_required()
@admin_required
def get_analytics():
    """Get analytics data"""
    try:
        days = request.args.get('days', 30, type=int)
        
        conn = get_db_connection()
        
        # User registration trends
        user_registrations = conn.execute("""
            SELECT date(created_at) as date, COUNT(*) as count
            FROM users 
            WHERE created_at >= date('now', '-{} days')
            GROUP BY date(created_at)
            ORDER BY date
        """.format(days)).fetchall()
        
        # News publication trends
        news_publications = conn.execute("""
            SELECT date(created_at) as date, COUNT(*) as count
            FROM news 
            WHERE created_at >= date('now', '-{} days') AND published = 1
            GROUP BY date(created_at)
            ORDER BY date
        """.format(days)).fetchall()
        
        # Upload trends
        upload_trends = conn.execute("""
            SELECT date(created_at) as date, COUNT(*) as count, SUM(file_size) as total_size
            FROM uploads 
            WHERE created_at >= date('now', '-{} days')
            GROUP BY date(created_at)
            ORDER BY date
        """.format(days)).fetchall()
        
        # Most popular news categories
        popular_categories = conn.execute("""
            SELECT category, COUNT(*) as count
            FROM news 
            WHERE published = 1
            GROUP BY category
            ORDER BY count DESC
            LIMIT 10
        """).fetchall()
        
        # User role distribution
        user_roles = conn.execute("""
            SELECT role, COUNT(*) as count
            FROM users 
            WHERE active = 1
            GROUP BY role
        """).fetchall()
        
        conn.close()
        
        return jsonify({
            'user_registrations': [dict(row) for row in user_registrations],
            'news_publications': [dict(row) for row in news_publications],
            'upload_trends': [dict(row) for row in upload_trends],
            'popular_categories': [dict(row) for row in popular_categories],
            'user_roles': [dict(row) for row in user_roles]
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/settings', methods=['GET'])
@jwt_required()
@admin_required
def get_settings():
    """Get system settings"""
    try:
        conn = get_db_connection()
        settings = conn.execute("SELECT * FROM settings").fetchall()
        conn.close()
        
        settings_dict = {}
        for setting in settings:
            settings_dict[setting['key']] = setting['value']
        
        return jsonify(settings_dict)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/settings', methods=['PUT'])
@jwt_required()
@admin_required
def update_settings():
    """Update system settings"""
    try:
        data = request.get_json()
        
        conn = get_db_connection()
        
        for key, value in data.items():
            # Check if setting exists
            existing = conn.execute("SELECT id FROM settings WHERE key = ?", (key,)).fetchone()
            
            if existing:
                conn.execute("UPDATE settings SET value = ? WHERE key = ?", (str(value), key))
            else:
                conn.execute("INSERT INTO settings (key, value) VALUES (?, ?)", (key, str(value)))
        
        conn.commit()
        conn.close()
        
        return jsonify({'message': 'Settings updated successfully'})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/logs', methods=['GET'])
@jwt_required()
@admin_required
def get_logs():
    """Get system logs"""
    try:
        lines = request.args.get('lines', 100, type=int)
        log_file = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'logs', 'university_portal.log')
        
        if not os.path.exists(log_file):
            return jsonify({'logs': []})
        
        with open(log_file, 'r') as f:
            log_lines = f.readlines()
        
        # Get last N lines
        recent_logs = log_lines[-lines:] if len(log_lines) > lines else log_lines
        
        return jsonify({'logs': [line.strip() for line in recent_logs]})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/backup', methods=['POST'])
@jwt_required()
@admin_required
def create_backup():
    """Create database backup"""
    try:
        import shutil
        from datetime import datetime
        
        # Create backup filename with timestamp
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        backup_filename = f'university_backup_{timestamp}.db'
        
        # Source and destination paths
        source_db = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'university.db')
        backup_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'backups')
        
        # Create backup directory if it doesn't exist
        os.makedirs(backup_dir, exist_ok=True)
        
        backup_path = os.path.join(backup_dir, backup_filename)
        
        # Copy database file
        shutil.copy2(source_db, backup_path)
        
        return jsonify({
            'message': 'Backup created successfully',
            'filename': backup_filename,
            'path': backup_path
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

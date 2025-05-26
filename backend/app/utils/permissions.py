from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt_identity, get_jwt
from ..database import get_db_connection

def admin_required(f):
    """Decorator to require admin privileges"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user_id = get_jwt_identity()
        claims = get_jwt()
        user_role = claims.get('role')
        
        # Check if user has admin role
        if user_role not in ['super_admin', 'college_admin', 'faculty_admin', 'department_admin', 'ai_house_admin', 'incubator_admin']:
            return jsonify({'error': 'Admin privileges required'}), 403
        
        return f(*args, **kwargs)
    return decorated_function

def check_permission(required_permission, resource_type=None, resource_id=None):
    """Decorator to check user permissions"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            user_id = get_jwt_identity()
            claims = get_jwt()
            user_role = claims.get('role')
            
            # Super admin has all permissions
            if user_role == 'super_admin':
                return f(*args, **kwargs)
            
            # Check specific permissions
            if not has_permission(user_id, required_permission, resource_type, resource_id):
                return jsonify({'error': 'Insufficient permissions'}), 403
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def has_permission(user_id, permission, resource_type=None, resource_id=None):
    """Check if user has specific permission"""
    with get_db_connection() as conn:
        # Get user info
        user = conn.execute('SELECT * FROM users WHERE id = ?', (user_id,)).fetchone()
        if not user or not user['is_active']:
            return False
        
        # Super admin has all permissions
        if user['role'] == 'super_admin':
            return True
        
        # Check role-based permissions
        role_permissions = get_role_permissions(user['role'])
        if permission in role_permissions or 'all' in role_permissions:
            return True
        
        # Check specific user permissions
        if resource_type and resource_id:
            user_permission = conn.execute('''
                SELECT * FROM user_permissions 
                WHERE user_id = ? AND resource_type = ? AND resource_id = ? AND permission = ?
            ''', (user_id, resource_type, resource_id, permission)).fetchone()
            
            if user_permission:
                return True
        
        # Check college/faculty level permissions
        if user['college_id'] and resource_type in ['college', 'faculty', 'department']:
            if check_hierarchical_permission(user, permission, resource_type, resource_id):
                return True
        
        return False

def get_role_permissions(role):
    """Get permissions for a specific role"""
    role_permissions = {
        'super_admin': ['all'],
        'college_admin': [
            'college_manage', 'faculty_manage', 'department_manage', 
            'user_manage', 'news_manage', 'files_manage'
        ],
        'faculty_admin': [
            'faculty_read', 'faculty_edit', 'department_manage', 
            'news_manage', 'files_manage'
        ],
        'department_admin': [
            'department_read', 'department_edit', 'news_create', 
            'news_edit', 'files_manage'
        ],
        'ai_house_admin': [
            'ai_house_manage', 'projects_manage', 'events_manage'
        ],
        'incubator_admin': [
            'incubator_manage', 'startups_manage', 'programs_manage'
        ],
        'editor': ['news_create', 'news_edit', 'files_upload'],
        'viewer': ['read_only']
    }
    
    return role_permissions.get(role, [])

def check_hierarchical_permission(user, permission, resource_type, resource_id):
    """Check permissions based on organizational hierarchy"""
    with get_db_connection() as conn:
        if resource_type == 'college':
            # User can manage their own college
            return user['college_id'] == resource_id and user['role'] in ['college_admin', 'faculty_admin']
        
        elif resource_type == 'faculty':
            # Get faculty's college
            faculty = conn.execute('SELECT college_id FROM faculties WHERE id = ?', (resource_id,)).fetchone()
            if faculty:
                # User can manage faculty in their college
                if user['college_id'] == faculty['college_id'] and user['role'] == 'college_admin':
                    return True
                # User can manage their own faculty
                if user['faculty_id'] == resource_id and user['role'] == 'faculty_admin':
                    return True
        
        elif resource_type == 'department':
            # Get department's faculty and college
            department = conn.execute('''
                SELECT d.faculty_id, f.college_id 
                FROM departments d 
                JOIN faculties f ON d.faculty_id = f.id 
                WHERE d.id = ?
            ''', (resource_id,)).fetchone()
            
            if department:
                # User can manage department in their college
                if user['college_id'] == department['college_id'] and user['role'] == 'college_admin':
                    return True
                # User can manage department in their faculty
                if user['faculty_id'] == department['faculty_id'] and user['role'] == 'faculty_admin':
                    return True
                # User can manage their own department
                if user['department_id'] == resource_id and user['role'] == 'department_admin':
                    return True
    
    return False

def can_manage_user(manager_id, target_user_id):
    """Check if manager can manage target user"""
    with get_db_connection() as conn:
        manager = conn.execute('SELECT * FROM users WHERE id = ?', (manager_id,)).fetchone()
        target = conn.execute('SELECT * FROM users WHERE id = ?', (target_user_id,)).fetchone()
        
        if not manager or not target:
            return False
        
        # Super admin can manage anyone
        if manager['role'] == 'super_admin':
            return True
        
        # College admin can manage users in their college
        if manager['role'] == 'college_admin' and manager['college_id'] == target['college_id']:
            return True
        
        # Faculty admin can manage users in their faculty
        if manager['role'] == 'faculty_admin' and manager['faculty_id'] == target['faculty_id']:
            return True
        
        return False

def get_accessible_resources(user_id, resource_type):
    """Get list of resources user can access"""
    with get_db_connection() as conn:
        user = conn.execute('SELECT * FROM users WHERE id = ?', (user_id,)).fetchone()
        
        if not user:
            return []
        
        # Super admin can access everything
        if user['role'] == 'super_admin':
            if resource_type == 'colleges':
                return [row['id'] for row in conn.execute('SELECT id FROM colleges WHERE is_active = 1').fetchall()]
            elif resource_type == 'faculties':
                return [row['id'] for row in conn.execute('SELECT id FROM faculties WHERE is_active = 1').fetchall()]
            elif resource_type == 'departments':
                return [row['id'] for row in conn.execute('SELECT id FROM departments').fetchall()]
        
        # College admin can access their college and its faculties/departments
        elif user['role'] == 'college_admin' and user['college_id']:
            if resource_type == 'colleges':
                return [user['college_id']]
            elif resource_type == 'faculties':
                return [row['id'] for row in conn.execute('SELECT id FROM faculties WHERE college_id = ?', (user['college_id'],)).fetchall()]
            elif resource_type == 'departments':
                return [row['id'] for row in conn.execute('''
                    SELECT d.id FROM departments d 
                    JOIN faculties f ON d.faculty_id = f.id 
                    WHERE f.college_id = ?
                ''', (user['college_id'],)).fetchall()]
        
        # Faculty admin can access their faculty and its departments
        elif user['role'] == 'faculty_admin' and user['faculty_id']:
            if resource_type == 'faculties':
                return [user['faculty_id']]
            elif resource_type == 'departments':
                return [row['id'] for row in conn.execute('SELECT id FROM departments WHERE faculty_id = ?', (user['faculty_id'],)).fetchall()]
        
        # Department admin can access their department
        elif user['role'] == 'department_admin' and user['department_id']:
            if resource_type == 'departments':
                return [user['department_id']]
        
        return []

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import sqlite3
import os
from ..utils.permissions import admin_required
from ..utils.validators import validate_faculty_data

faculties_bp = Blueprint('faculties', __name__)

def get_db_connection():
    """Get database connection"""
    db_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'university.db')
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

@faculties_bp.route('/', methods=['GET'])
def get_faculties():
    """Get all faculties"""
    try:
        conn = get_db_connection()
        faculties = conn.execute("""
            SELECT f.*, COUNT(d.id) as department_count
            FROM faculties f
            LEFT JOIN departments d ON f.id = d.faculty_id
            WHERE f.active = 1
            GROUP BY f.id
            ORDER BY f.name
        """).fetchall()
        conn.close()
        
        return jsonify([dict(faculty) for faculty in faculties])
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@faculties_bp.route('/<int:faculty_id>', methods=['GET'])
def get_faculty(faculty_id):
    """Get a specific faculty with its departments"""
    try:
        conn = get_db_connection()
        
        faculty = conn.execute("""
            SELECT * FROM faculties WHERE id = ? AND active = 1
        """, (faculty_id,)).fetchone()
        
        if not faculty:
            conn.close()
            return jsonify({'error': 'Faculty not found'}), 404
        
        departments = conn.execute("""
            SELECT * FROM departments WHERE faculty_id = ? AND active = 1 ORDER BY name
        """, (faculty_id,)).fetchall()
        
        conn.close()
        
        faculty_dict = dict(faculty)
        faculty_dict['departments'] = [dict(dept) for dept in departments]
        
        return jsonify(faculty_dict)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@faculties_bp.route('/<int:faculty_id>/departments', methods=['GET'])
def get_faculty_departments(faculty_id):
    """Get all departments for a specific faculty"""
    try:
        conn = get_db_connection()
        
        # Check if faculty exists
        faculty = conn.execute("SELECT id FROM faculties WHERE id = ? AND active = 1", (faculty_id,)).fetchone()
        if not faculty:
            conn.close()
            return jsonify({'error': 'Faculty not found'}), 404
        
        departments = conn.execute("""
            SELECT d.*, COUNT(p.id) as program_count
            FROM departments d
            LEFT JOIN programs p ON d.id = p.department_id
            WHERE d.faculty_id = ? AND d.active = 1
            GROUP BY d.id
            ORDER BY d.name
        """, (faculty_id,)).fetchall()
        
        conn.close()
        
        return jsonify([dict(dept) for dept in departments])
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@faculties_bp.route('/departments/<int:department_id>', methods=['GET'])
def get_department(department_id):
    """Get a specific department with its programs"""
    try:
        conn = get_db_connection()
        
        department = conn.execute("""
            SELECT d.*, f.name as faculty_name
            FROM departments d
            JOIN faculties f ON d.faculty_id = f.id
            WHERE d.id = ? AND d.active = 1
        """, (department_id,)).fetchone()
        
        if not department:
            conn.close()
            return jsonify({'error': 'Department not found'}), 404
        
        programs = conn.execute("""
            SELECT * FROM programs WHERE department_id = ? AND active = 1 ORDER BY name
        """, (department_id,)).fetchall()
        
        conn.close()
        
        department_dict = dict(department)
        department_dict['programs'] = [dict(program) for program in programs]
        
        return jsonify(department_dict)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@faculties_bp.route('/', methods=['POST'])
@jwt_required()
@admin_required
def create_faculty():
    """Create a new faculty (admin only)"""
    try:
        data = request.get_json()
        
        # Validate data
        validation_error = validate_faculty_data(data)
        if validation_error:
            return jsonify({'error': validation_error}), 400
        
        conn = get_db_connection()
        cursor = conn.execute("""
            INSERT INTO faculties (name, description, dean, email, phone, website, image_url, active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            data['name'],
            data.get('description', ''),
            data.get('dean', ''),
            data.get('email', ''),
            data.get('phone', ''),
            data.get('website', ''),
            data.get('image_url', ''),
            data.get('active', True)
        ))
        
        faculty_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return jsonify({'message': 'Faculty created successfully', 'id': faculty_id}), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@faculties_bp.route('/<int:faculty_id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_faculty(faculty_id):
    """Update a faculty (admin only)"""
    try:
        data = request.get_json()
        
        # Validate data
        validation_error = validate_faculty_data(data)
        if validation_error:
            return jsonify({'error': validation_error}), 400
        
        conn = get_db_connection()
        
        # Check if faculty exists
        existing = conn.execute("SELECT id FROM faculties WHERE id = ?", (faculty_id,)).fetchone()
        if not existing:
            conn.close()
            return jsonify({'error': 'Faculty not found'}), 404
        
        conn.execute("""
            UPDATE faculties 
            SET name = ?, description = ?, dean = ?, email = ?, phone = ?, 
                website = ?, image_url = ?, active = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        """, (
            data['name'],
            data.get('description', ''),
            data.get('dean', ''),
            data.get('email', ''),
            data.get('phone', ''),
            data.get('website', ''),
            data.get('image_url', ''),
            data.get('active', True),
            faculty_id
        ))
        
        conn.commit()
        conn.close()
        
        return jsonify({'message': 'Faculty updated successfully'})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@faculties_bp.route('/<int:faculty_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_faculty(faculty_id):
    """Delete a faculty (admin only)"""
    try:
        conn = get_db_connection()
        
        # Check if faculty exists
        existing = conn.execute("SELECT id FROM faculties WHERE id = ?", (faculty_id,)).fetchone()
        if not existing:
            conn.close()
            return jsonify({'error': 'Faculty not found'}), 404
        
        # Soft delete - set active to false
        conn.execute("UPDATE faculties SET active = 0 WHERE id = ?", (faculty_id,))
        conn.commit()
        conn.close()
        
        return jsonify({'message': 'Faculty deleted successfully'})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@faculties_bp.route('/<int:faculty_id>/departments', methods=['POST'])
@jwt_required()
@admin_required
def create_department(faculty_id):
    """Create a new department in a faculty (admin only)"""
    try:
        data = request.get_json()
        
        if not data.get('name'):
            return jsonify({'error': 'Department name is required'}), 400
        
        conn = get_db_connection()
        
        # Check if faculty exists
        faculty = conn.execute("SELECT id FROM faculties WHERE id = ? AND active = 1", (faculty_id,)).fetchone()
        if not faculty:
            conn.close()
            return jsonify({'error': 'Faculty not found'}), 404
        
        cursor = conn.execute("""
            INSERT INTO departments (name, description, head, email, phone, faculty_id, active)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            data['name'],
            data.get('description', ''),
            data.get('head', ''),
            data.get('email', ''),
            data.get('phone', ''),
            faculty_id,
            data.get('active', True)
        ))
        
        department_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return jsonify({'message': 'Department created successfully', 'id': department_id}), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@faculties_bp.route('/departments/<int:department_id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_department(department_id):
    """Update a department (admin only)"""
    try:
        data = request.get_json()
        
        if not data.get('name'):
            return jsonify({'error': 'Department name is required'}), 400
        
        conn = get_db_connection()
        
        # Check if department exists
        existing = conn.execute("SELECT id FROM departments WHERE id = ?", (department_id,)).fetchone()
        if not existing:
            conn.close()
            return jsonify({'error': 'Department not found'}), 404
        
        conn.execute("""
            UPDATE departments 
            SET name = ?, description = ?, head = ?, email = ?, phone = ?, 
                active = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        """, (
            data['name'],
            data.get('description', ''),
            data.get('head', ''),
            data.get('email', ''),
            data.get('phone', ''),
            data.get('active', True),
            department_id
        ))
        
        conn.commit()
        conn.close()
        
        return jsonify({'message': 'Department updated successfully'})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@faculties_bp.route('/departments/<int:department_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_department(department_id):
    """Delete a department (admin only)"""
    try:
        conn = get_db_connection()
        
        # Check if department exists
        existing = conn.execute("SELECT id FROM departments WHERE id = ?", (department_id,)).fetchone()
        if not existing:
            conn.close()
            return jsonify({'error': 'Department not found'}), 404
        
        # Soft delete - set active to false
        conn.execute("UPDATE departments SET active = 0 WHERE id = ?", (department_id,))
        conn.commit()
        conn.close()
        
        return jsonify({'message': 'Department deleted successfully'})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

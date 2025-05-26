from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import sqlite3
import os
from datetime import datetime
from ..utils.permissions import admin_required
from ..utils.validators import validate_ai_project_data

ai_house_bp = Blueprint('ai_house', __name__)

def get_db_connection():
    """Get database connection"""
    db_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'university.db')
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

@ai_house_bp.route('/projects', methods=['GET'])
def get_projects():
    """Get all AI House projects"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 10, type=int), 50)
        category = request.args.get('category')
        status = request.args.get('status')
        
        conn = get_db_connection()
        
        # Build query
        query = """
            SELECT p.*, u.username as creator_name 
            FROM ai_projects p 
            LEFT JOIN users u ON p.creator_id = u.id 
            WHERE p.active = 1
        """
        params = []
        
        if category:
            query += " AND p.category = ?"
            params.append(category)
            
        if status:
            query += " AND p.status = ?"
            params.append(status)
        
        query += " ORDER BY p.created_at DESC LIMIT ? OFFSET ?"
        params.extend([per_page, (page - 1) * per_page])
        
        projects = conn.execute(query, params).fetchall()
        
        # Get total count
        count_query = "SELECT COUNT(*) FROM ai_projects WHERE active = 1"
        count_params = []
        
        if category:
            count_query += " AND category = ?"
            count_params.append(category)
            
        if status:
            count_query += " AND status = ?"
            count_params.append(status)
        
        total = conn.execute(count_query, count_params).fetchone()[0]
        conn.close()
        
        return jsonify({
            'projects': [dict(project) for project in projects],
            'total': total,
            'page': page,
            'per_page': per_page,
            'pages': (total + per_page - 1) // per_page
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@ai_house_bp.route('/projects/<int:project_id>', methods=['GET'])
def get_project(project_id):
    """Get a specific AI project"""
    try:
        conn = get_db_connection()
        project = conn.execute("""
            SELECT p.*, u.username as creator_name 
            FROM ai_projects p 
            LEFT JOIN users u ON p.creator_id = u.id 
            WHERE p.id = ? AND p.active = 1
        """, (project_id,)).fetchone()
        
        if not project:
            conn.close()
            return jsonify({'error': 'Project not found'}), 404
        
        # Get project team members
        team_members = conn.execute("""
            SELECT tm.*, u.username, u.email 
            FROM ai_project_team tm 
            JOIN users u ON tm.user_id = u.id 
            WHERE tm.project_id = ?
        """, (project_id,)).fetchall()
        
        conn.close()
        
        project_dict = dict(project)
        project_dict['team_members'] = [dict(member) for member in team_members]
        
        return jsonify(project_dict)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@ai_house_bp.route('/events', methods=['GET'])
def get_events():
    """Get all AI House events"""
    try:
        upcoming = request.args.get('upcoming', 'false').lower() == 'true'
        limit = request.args.get('limit', type=int)
        
        conn = get_db_connection()
        
        query = """
            SELECT e.*, u.username as organizer_name 
            FROM ai_events e 
            LEFT JOIN users u ON e.organizer_id = u.id 
            WHERE e.active = 1
        """
        params = []
        
        if upcoming:
            query += " AND e.event_date >= date('now')"
        
        query += " ORDER BY e.event_date ASC"
        
        if limit:
            query += " LIMIT ?"
            params.append(limit)
        
        events = conn.execute(query, params).fetchall()
        conn.close()
        
        return jsonify([dict(event) for event in events])
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@ai_house_bp.route('/events/<int:event_id>', methods=['GET'])
def get_event(event_id):
    """Get a specific AI event"""
    try:
        conn = get_db_connection()
        event = conn.execute("""
            SELECT e.*, u.username as organizer_name 
            FROM ai_events e 
            LEFT JOIN users u ON e.organizer_id = u.id 
            WHERE e.id = ? AND e.active = 1
        """, (event_id,)).fetchone()
        
        if not event:
            conn.close()
            return jsonify({'error': 'Event not found'}), 404
        
        # Get event registrations count
        registrations = conn.execute("""
            SELECT COUNT(*) as count FROM ai_event_registrations WHERE event_id = ?
        """, (event_id,)).fetchone()
        
        conn.close()
        
        event_dict = dict(event)
        event_dict['registrations_count'] = registrations['count']
        
        return jsonify(event_dict)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@ai_house_bp.route('/resources', methods=['GET'])
def get_resources():
    """Get all AI House resources"""
    try:
        category = request.args.get('category')
        
        conn = get_db_connection()
        
        query = "SELECT * FROM ai_resources WHERE active = 1"
        params = []
        
        if category:
            query += " AND category = ?"
            params.append(category)
        
        query += " ORDER BY title"
        
        resources = conn.execute(query, params).fetchall()
        conn.close()
        
        return jsonify([dict(resource) for resource in resources])
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@ai_house_bp.route('/projects', methods=['POST'])
@jwt_required()
def create_project():
    """Create a new AI project"""
    try:
        data = request.get_json()
        
        # Validate data
        validation_error = validate_ai_project_data(data)
        if validation_error:
            return jsonify({'error': validation_error}), 400
        
        current_user_id = get_jwt_identity()
        
        conn = get_db_connection()
        cursor = conn.execute("""
            INSERT INTO ai_projects (title, description, category, status, creator_id, 
                                   github_url, demo_url, tech_stack, active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            data['title'],
            data['description'],
            data['category'],
            data.get('status', 'planning'),
            current_user_id,
            data.get('github_url', ''),
            data.get('demo_url', ''),
            data.get('tech_stack', ''),
            True
        ))
        
        project_id = cursor.lastrowid
        
        # Add creator as team member
        conn.execute("""
            INSERT INTO ai_project_team (project_id, user_id, role)
            VALUES (?, ?, ?)
        """, (project_id, current_user_id, 'lead'))
        
        conn.commit()
        conn.close()
        
        return jsonify({'message': 'Project created successfully', 'id': project_id}), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@ai_house_bp.route('/events', methods=['POST'])
@jwt_required()
@admin_required
def create_event():
    """Create a new AI event (admin only)"""
    try:
        data = request.get_json()
        
        required_fields = ['title', 'description', 'event_date', 'location']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        current_user_id = get_jwt_identity()
        
        conn = get_db_connection()
        cursor = conn.execute("""
            INSERT INTO ai_events (title, description, event_date, event_time, location, 
                                 max_participants, organizer_id, active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            data['title'],
            data['description'],
            data['event_date'],
            data.get('event_time', ''),
            data['location'],
            data.get('max_participants', 0),
            current_user_id,
            True
        ))
        
        event_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return jsonify({'message': 'Event created successfully', 'id': event_id}), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@ai_house_bp.route('/events/<int:event_id>/register', methods=['POST'])
@jwt_required()
def register_for_event(event_id):
    """Register for an AI event"""
    try:
        current_user_id = get_jwt_identity()
        
        conn = get_db_connection()
        
        # Check if event exists and is active
        event = conn.execute("""
            SELECT * FROM ai_events WHERE id = ? AND active = 1
        """, (event_id,)).fetchone()
        
        if not event:
            conn.close()
            return jsonify({'error': 'Event not found'}), 404
        
        # Check if already registered
        existing = conn.execute("""
            SELECT id FROM ai_event_registrations WHERE event_id = ? AND user_id = ?
        """, (event_id, current_user_id)).fetchone()
        
        if existing:
            conn.close()
            return jsonify({'error': 'Already registered for this event'}), 400
        
        # Check if event is full
        if event['max_participants'] > 0:
            current_registrations = conn.execute("""
                SELECT COUNT(*) as count FROM ai_event_registrations WHERE event_id = ?
            """, (event_id,)).fetchone()
            
            if current_registrations['count'] >= event['max_participants']:
                conn.close()
                return jsonify({'error': 'Event is full'}), 400
        
        # Register user
        conn.execute("""
            INSERT INTO ai_event_registrations (event_id, user_id)
            VALUES (?, ?)
        """, (event_id, current_user_id))
        
        conn.commit()
        conn.close()
        
        return jsonify({'message': 'Successfully registered for event'})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@ai_house_bp.route('/resources', methods=['POST'])
@jwt_required()
@admin_required
def create_resource():
    """Create a new AI resource (admin only)"""
    try:
        data = request.get_json()
        
        required_fields = ['title', 'category', 'url']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        conn = get_db_connection()
        cursor = conn.execute("""
            INSERT INTO ai_resources (title, description, category, url, resource_type, active)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            data['title'],
            data.get('description', ''),
            data['category'],
            data['url'],
            data.get('resource_type', 'link'),
            True
        ))
        
        resource_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return jsonify({'message': 'Resource created successfully', 'id': resource_id}), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@ai_house_bp.route('/projects/<int:project_id>/join', methods=['POST'])
@jwt_required()
def join_project(project_id):
    """Join an AI project team"""
    try:
        data = request.get_json()
        current_user_id = get_jwt_identity()
        
        conn = get_db_connection()
        
        # Check if project exists
        project = conn.execute("""
            SELECT * FROM ai_projects WHERE id = ? AND active = 1
        """, (project_id,)).fetchone()
        
        if not project:
            conn.close()
            return jsonify({'error': 'Project not found'}), 404
        
        # Check if already a team member
        existing = conn.execute("""
            SELECT id FROM ai_project_team WHERE project_id = ? AND user_id = ?
        """, (project_id, current_user_id)).fetchone()
        
        if existing:
            conn.close()
            return jsonify({'error': 'Already a team member'}), 400
        
        # Add to team
        conn.execute("""
            INSERT INTO ai_project_team (project_id, user_id, role)
            VALUES (?, ?, ?)
        """, (project_id, current_user_id, data.get('role', 'member')))
        
        conn.commit()
        conn.close()
        
        return jsonify({'message': 'Successfully joined project team'})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

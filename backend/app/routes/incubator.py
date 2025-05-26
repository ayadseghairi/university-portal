from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import sqlite3
import os
from datetime import datetime
from ..utils.permissions import admin_required
from ..utils.validators import validate_startup_data

incubator_bp = Blueprint('incubator', __name__)

def get_db_connection():
    """Get database connection"""
    db_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'university.db')
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

@incubator_bp.route('/startups', methods=['GET'])
def get_startups():
    """Get all incubator startups"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 10, type=int), 50)
        stage = request.args.get('stage')
        industry = request.args.get('industry')
        
        conn = get_db_connection()
        
        # Build query
        query = """
            SELECT s.*, u.username as founder_name 
            FROM startups s 
            LEFT JOIN users u ON s.founder_id = u.id 
            WHERE s.active = 1
        """
        params = []
        
        if stage:
            query += " AND s.stage = ?"
            params.append(stage)
            
        if industry:
            query += " AND s.industry = ?"
            params.append(industry)
        
        query += " ORDER BY s.created_at DESC LIMIT ? OFFSET ?"
        params.extend([per_page, (page - 1) * per_page])
        
        startups = conn.execute(query, params).fetchall()
        
        # Get total count
        count_query = "SELECT COUNT(*) FROM startups WHERE active = 1"
        count_params = []
        
        if stage:
            count_query += " AND stage = ?"
            count_params.append(stage)
            
        if industry:
            count_query += " AND industry = ?"
            count_params.append(industry)
        
        total = conn.execute(count_query, count_params).fetchone()[0]
        conn.close()
        
        return jsonify({
            'startups': [dict(startup) for startup in startups],
            'total': total,
            'page': page,
            'per_page': per_page,
            'pages': (total + per_page - 1) // per_page
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@incubator_bp.route('/startups/<int:startup_id>', methods=['GET'])
def get_startup(startup_id):
    """Get a specific startup"""
    try:
        conn = get_db_connection()
        startup = conn.execute("""
            SELECT s.*, u.username as founder_name, u.email as founder_email 
            FROM startups s 
            LEFT JOIN users u ON s.founder_id = u.id 
            WHERE s.id = ? AND s.active = 1
        """, (startup_id,)).fetchone()
        
        if not startup:
            conn.close()
            return jsonify({'error': 'Startup not found'}), 404
        
        # Get startup team members
        team_members = conn.execute("""
            SELECT st.*, u.username, u.email 
            FROM startup_team st 
            JOIN users u ON st.user_id = u.id 
            WHERE st.startup_id = ?
        """, (startup_id,)).fetchall()
        
        # Get funding rounds
        funding_rounds = conn.execute("""
            SELECT * FROM funding_rounds WHERE startup_id = ? ORDER BY round_date DESC
        """, (startup_id,)).fetchall()
        
        conn.close()
        
        startup_dict = dict(startup)
        startup_dict['team_members'] = [dict(member) for member in team_members]
        startup_dict['funding_rounds'] = [dict(round) for round in funding_rounds]
        
        return jsonify(startup_dict)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@incubator_bp.route('/programs', methods=['GET'])
def get_programs():
    """Get all incubator programs"""
    try:
        active_only = request.args.get('active', 'true').lower() == 'true'
        
        conn = get_db_connection()
        
        query = "SELECT * FROM incubator_programs"
        params = []
        
        if active_only:
            query += " WHERE active = 1"
        
        query += " ORDER BY start_date DESC"
        
        programs = conn.execute(query, params).fetchall()
        conn.close()
        
        return jsonify([dict(program) for program in programs])
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@incubator_bp.route('/programs/<int:program_id>', methods=['GET'])
def get_program(program_id):
    """Get a specific incubator program"""
    try:
        conn = get_db_connection()
        program = conn.execute("""
            SELECT * FROM incubator_programs WHERE id = ?
        """, (program_id,)).fetchone()
        
        if not program:
            conn.close()
            return jsonify({'error': 'Program not found'}), 404
        
        # Get program participants
        participants = conn.execute("""
            SELECT pp.*, s.name as startup_name, u.username as founder_name
            FROM program_participants pp
            JOIN startups s ON pp.startup_id = s.id
            LEFT JOIN users u ON s.founder_id = u.id
            WHERE pp.program_id = ?
        """, (program_id,)).fetchall()
        
        conn.close()
        
        program_dict = dict(program)
        program_dict['participants'] = [dict(participant) for participant in participants]
        
        return jsonify(program_dict)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@incubator_bp.route('/mentors', methods=['GET'])
def get_mentors():
    """Get all incubator mentors"""
    try:
        expertise = request.args.get('expertise')
        
        conn = get_db_connection()
        
        query = "SELECT * FROM mentors WHERE active = 1"
        params = []
        
        if expertise:
            query += " AND expertise LIKE ?"
            params.append(f'%{expertise}%')
        
        query += " ORDER BY name"
        
        mentors = conn.execute(query, params).fetchall()
        conn.close()
        
        return jsonify([dict(mentor) for mentor in mentors])
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@incubator_bp.route('/startups', methods=['POST'])
@jwt_required()
def create_startup():
    """Create a new startup"""
    try:
        data = request.get_json()
        
        # Validate data
        validation_error = validate_startup_data(data)
        if validation_error:
            return jsonify({'error': validation_error}), 400
        
        current_user_id = get_jwt_identity()
        
        conn = get_db_connection()
        cursor = conn.execute("""
            INSERT INTO startups (name, description, industry, stage, founder_id, 
                                website, pitch_deck_url, business_model, target_market, active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            data['name'],
            data['description'],
            data['industry'],
            data.get('stage', 'idea'),
            current_user_id,
            data.get('website', ''),
            data.get('pitch_deck_url', ''),
            data.get('business_model', ''),
            data.get('target_market', ''),
            True
        ))
        
        startup_id = cursor.lastrowid
        
        # Add founder as team member
        conn.execute("""
            INSERT INTO startup_team (startup_id, user_id, role, equity_percentage)
            VALUES (?, ?, ?, ?)
        """, (startup_id, current_user_id, 'founder', data.get('founder_equity', 100)))
        
        conn.commit()
        conn.close()
        
        return jsonify({'message': 'Startup created successfully', 'id': startup_id}), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@incubator_bp.route('/programs/<int:program_id>/apply', methods=['POST'])
@jwt_required()
def apply_to_program(program_id):
    """Apply to an incubator program"""
    try:
        data = request.get_json()
        current_user_id = get_jwt_identity()
        
        if not data.get('startup_id'):
            return jsonify({'error': 'Startup ID is required'}), 400
        
        conn = get_db_connection()
        
        # Check if program exists and is active
        program = conn.execute("""
            SELECT * FROM incubator_programs WHERE id = ? AND active = 1
        """, (program_id,)).fetchone()
        
        if not program:
            conn.close()
            return jsonify({'error': 'Program not found'}), 404
        
        # Check if user owns the startup
        startup = conn.execute("""
            SELECT * FROM startups WHERE id = ? AND founder_id = ? AND active = 1
        """, (data['startup_id'], current_user_id)).fetchone()
        
        if not startup:
            conn.close()
            return jsonify({'error': 'Startup not found or you are not the founder'}), 404
        
        # Check if already applied
        existing = conn.execute("""
            SELECT id FROM program_applications 
            WHERE program_id = ? AND startup_id = ?
        """, (program_id, data['startup_id'])).fetchone()
        
        if existing:
            conn.close()
            return jsonify({'error': 'Already applied to this program'}), 400
        
        # Create application
        conn.execute("""
            INSERT INTO program_applications (program_id, startup_id, application_text, status)
            VALUES (?, ?, ?, ?)
        """, (program_id, data['startup_id'], data.get('application_text', ''), 'pending'))
        
        conn.commit()
        conn.close()
        
        return jsonify({'message': 'Application submitted successfully'})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@incubator_bp.route('/startups/<int:startup_id>/funding', methods=['POST'])
@jwt_required()
def add_funding_round(startup_id):
    """Add a funding round to a startup"""
    try:
        data = request.get_json()
        current_user_id = get_jwt_identity()
        
        # Check if user owns the startup
        conn = get_db_connection()
        startup = conn.execute("""
            SELECT * FROM startups WHERE id = ? AND founder_id = ? AND active = 1
        """, (startup_id, current_user_id)).fetchone()
        
        if not startup:
            conn.close()
            return jsonify({'error': 'Startup not found or you are not the founder'}), 404
        
        required_fields = ['round_type', 'amount', 'round_date']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        conn.execute("""
            INSERT INTO funding_rounds (startup_id, round_type, amount, round_date, 
                                      investors, valuation)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            startup_id,
            data['round_type'],
            data['amount'],
            data['round_date'],
            data.get('investors', ''),
            data.get('valuation', 0)
        ))
        
        conn.commit()
        conn.close()
        
        return jsonify({'message': 'Funding round added successfully'})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@incubator_bp.route('/programs', methods=['POST'])
@jwt_required()
@admin_required
def create_program():
    """Create a new incubator program (admin only)"""
    try:
        data = request.get_json()
        
        required_fields = ['name', 'description', 'start_date', 'end_date']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        conn = get_db_connection()
        cursor = conn.execute("""
            INSERT INTO incubator_programs (name, description, start_date, end_date, 
                                          max_participants, application_deadline, active)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            data['name'],
            data['description'],
            data['start_date'],
            data['end_date'],
            data.get('max_participants', 0),
            data.get('application_deadline', ''),
            True
        ))
        
        program_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return jsonify({'message': 'Program created successfully', 'id': program_id}), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@incubator_bp.route('/mentors', methods=['POST'])
@jwt_required()
@admin_required
def create_mentor():
    """Create a new mentor (admin only)"""
    try:
        data = request.get_json()
        
        required_fields = ['name', 'expertise', 'bio']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        conn = get_db_connection()
        cursor = conn.execute("""
            INSERT INTO mentors (name, bio, expertise, company, linkedin_url, 
                               email, phone, active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            data['name'],
            data['bio'],
            data['expertise'],
            data.get('company', ''),
            data.get('linkedin_url', ''),
            data.get('email', ''),
            data.get('phone', ''),
            True
        ))
        
        mentor_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return jsonify({'message': 'Mentor created successfully', 'id': mentor_id}), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@incubator_bp.route('/startups/<int:startup_id>/team', methods=['POST'])
@jwt_required()
def add_team_member(startup_id):
    """Add a team member to a startup"""
    try:
        data = request.get_json()
        current_user_id = get_jwt_identity()
        
        # Check if user owns the startup
        conn = get_db_connection()
        startup = conn.execute("""
            SELECT * FROM startups WHERE id = ? AND founder_id = ? AND active = 1
        """, (startup_id, current_user_id)).fetchone()
        
        if not startup:
            conn.close()
            return jsonify({'error': 'Startup not found or you are not the founder'}), 404
        
        required_fields = ['user_id', 'role']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Check if user is already a team member
        existing = conn.execute("""
            SELECT id FROM startup_team WHERE startup_id = ? AND user_id = ?
        """, (startup_id, data['user_id'])).fetchone()
        
        if existing:
            conn.close()
            return jsonify({'error': 'User is already a team member'}), 400
        
        conn.execute("""
            INSERT INTO startup_team (startup_id, user_id, role, equity_percentage)
            VALUES (?, ?, ?, ?)
        """, (
            startup_id,
            data['user_id'],
            data['role'],
            data.get('equity_percentage', 0)
        ))
        
        conn.commit()
        conn.close()
        
        return jsonify({'message': 'Team member added successfully'})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

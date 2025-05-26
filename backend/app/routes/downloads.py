from flask import Blueprint, request, jsonify, send_file, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
import os
from ..database import get_db_connection, log_activity
from ..utils.permissions import check_permission

downloads_bp = Blueprint('downloads', __name__)

@downloads_bp.route('/files', methods=['GET'])
def get_files():
    """Get list of downloadable files"""
    try:
        search = request.args.get('search', '')
        category = request.args.get('category', '')
        faculty_id = request.args.get('faculty_id', '')
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 20))
        
        with get_db_connection() as conn:
            query = '''
                SELECT f.*, u.name as uploaded_by_name, 
                       fa.name as faculty_name, c.name as college_name
                FROM files f
                JOIN users u ON f.uploaded_by = u.id
                LEFT JOIN faculties fa ON f.faculty_id = fa.id
                LEFT JOIN colleges c ON f.college_id = c.id
                WHERE f.is_public = 1
            '''
            params = []
            
            if search:
                query += ' AND (f.original_filename LIKE ? OR f.category LIKE ?)'
                params.extend([f'%{search}%', f'%{search}%'])
            
            if category:
                query += ' AND f.category = ?'
                params.append(category)
            
            if faculty_id:
                query += ' AND f.faculty_id = ?'
                params.append(faculty_id)
            
            query += ' ORDER BY f.created_at DESC LIMIT ? OFFSET ?'
            params.extend([per_page, (page - 1) * per_page])
            
            files = conn.execute(query, params).fetchall()
            
            # Get total count
            count_query = query.split('ORDER BY')[0].replace('SELECT f.*, u.name as uploaded_by_name, fa.name as faculty_name, c.name as college_name', 'SELECT COUNT(*)')
            total = conn.execute(count_query, params[:-2]).fetchone()[0]
            
            return jsonify({
                'data': [dict(file) for file in files],
                'total': total,
                'page': page,
                'per_page': per_page,
                'pages': (total + per_page - 1) // per_page
            })
            
    except Exception as e:
        current_app.logger.error(f'Get files error: {str(e)}')
        return jsonify({'error': 'Failed to fetch files'}), 500

@downloads_bp.route('/faculties', methods=['GET'])
def get_faculties():
    """Get list of faculties for filtering"""
    try:
        with get_db_connection() as conn:
            faculties = conn.execute('''
                SELECT DISTINCT f.id, f.name 
                FROM faculties f
                JOIN files fi ON f.id = fi.faculty_id
                WHERE fi.is_public = 1 AND f.is_active = 1
                ORDER BY f.name
            ''').fetchall()
            
            return jsonify({
                'data': [dict(faculty) for faculty in faculties]
            })
            
    except Exception as e:
        current_app.logger.error(f'Get faculties error: {str(e)}')
        return jsonify({'error': 'Failed to fetch faculties'}), 500

@downloads_bp.route('/file/<int:file_id>', methods=['GET'])
def download_file(file_id):
    """Download a specific file"""
    try:
        with get_db_connection() as conn:
            file_record = conn.execute('''
                SELECT * FROM files WHERE id = ? AND is_public = 1
            ''', (file_id,)).fetchone()
            
            if not file_record:
                return jsonify({'error': 'File not found'}), 404
            
            file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], file_record['file_path'])
            
            if not os.path.exists(file_path):
                return jsonify({'error': 'File not found on disk'}), 404
            
            # Update download count
            conn.execute('''
                UPDATE files SET download_count = download_count + 1 
                WHERE id = ?
            ''', (file_id,))
            
            # Log download activity
            user_id = None
            try:
                user_id = get_jwt_identity()
            except:
                pass  # Anonymous download
            
            if user_id:
                log_activity(
                    user_id=user_id,
                    action='file_downloaded',
                    resource_type='file',
                    resource_id=file_id,
                    details=f'Downloaded file: {file_record["original_filename"]}',
                    ip_address=request.remote_addr,
                    user_agent=request.headers.get('User-Agent')
                )
            
            conn.commit()
            
            return send_file(
                file_path,
                as_attachment=True,
                download_name=file_record['original_filename'],
                mimetype=file_record['mime_type']
            )
            
    except Exception as e:
        current_app.logger.error(f'Download file error: {str(e)}')
        return jsonify({'error': 'Failed to download file'}), 500

@downloads_bp.route('/stats', methods=['GET'])
def get_download_stats():
    """Get download statistics"""
    try:
        with get_db_connection() as conn:
            stats = {}
            
            # Total files
            stats['total_files'] = conn.execute(
                'SELECT COUNT(*) FROM files WHERE is_public = 1'
            ).fetchone()[0]
            
            # Total downloads
            stats['total_downloads'] = conn.execute(
                'SELECT SUM(download_count) FROM files WHERE is_public = 1'
            ).fetchone()[0] or 0
            
            # Files by category
            categories = conn.execute('''
                SELECT category, COUNT(*) as count 
                FROM files WHERE is_public = 1 
                GROUP BY category
            ''').fetchall()
            stats['by_category'] = {cat['category']: cat['count'] for cat in categories}
            
            # Recent downloads
            recent = conn.execute('''
                SELECT f.original_filename, f.download_count, f.created_at
                FROM files f
                WHERE f.is_public = 1
                ORDER BY f.download_count DESC, f.created_at DESC
                LIMIT 10
            ''').fetchall()
            stats['recent_popular'] = [dict(file) for file in recent]
            
            return jsonify({'data': stats})
            
    except Exception as e:
        current_app.logger.error(f'Get stats error: {str(e)}')
        return jsonify({'error': 'Failed to fetch statistics'}), 500

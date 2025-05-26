from flask import Blueprint, request, jsonify, send_from_directory, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
import os
import uuid
from werkzeug.utils import secure_filename
from PIL import Image
import sqlite3
from ..utils.permissions import admin_required

uploads_bp = Blueprint('uploads', __name__)

def get_db_connection():
    """Get database connection"""
    db_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'university.db')
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

def allowed_file(filename, allowed_extensions):
    """Check if file extension is allowed"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in allowed_extensions

def generate_unique_filename(filename):
    """Generate a unique filename"""
    ext = filename.rsplit('.', 1)[1].lower()
    unique_filename = f"{uuid.uuid4().hex}.{ext}"
    return unique_filename

def resize_image(image_path, max_width=1200, max_height=800, quality=85):
    """Resize image to optimize file size"""
    try:
        with Image.open(image_path) as img:
            # Convert RGBA to RGB if necessary
            if img.mode in ('RGBA', 'LA'):
                background = Image.new('RGB', img.size, (255, 255, 255))
                background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                img = background
            
            # Calculate new dimensions
            width, height = img.size
            if width > max_width or height > max_height:
                img.thumbnail((max_width, max_height), Image.Resampling.LANCZOS)
            
            # Save optimized image
            img.save(image_path, optimize=True, quality=quality)
            
    except Exception as e:
        print(f"Error resizing image: {e}")

@uploads_bp.route('/image', methods=['POST'])
@jwt_required()
def upload_image():
    """Upload an image file"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Check file type
        allowed_extensions = {'jpg', 'jpeg', 'png', 'gif', 'webp'}
        if not allowed_file(file.filename, allowed_extensions):
            return jsonify({'error': 'Invalid file type. Allowed: jpg, jpeg, png, gif, webp'}), 400
        
        # Generate unique filename
        filename = generate_unique_filename(file.filename)
        
        # Create upload directory if it doesn't exist
        upload_dir = os.path.join(current_app.config['UPLOAD_FOLDER'], 'images')
        os.makedirs(upload_dir, exist_ok=True)
        
        # Save file
        file_path = os.path.join(upload_dir, filename)
        file.save(file_path)
        
        # Resize image for optimization
        resize_image(file_path)
        
        # Get file info
        file_size = os.path.getsize(file_path)
        current_user_id = get_jwt_identity()
        
        # Save to database
        conn = get_db_connection()
        cursor = conn.execute("""
            INSERT INTO uploads (filename, original_filename, file_path, file_size, 
                               file_type, uploaded_by, upload_type)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            filename,
            secure_filename(file.filename),
            f'images/{filename}',
            file_size,
            'image',
            current_user_id,
            'image'
        ))
        
        upload_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return jsonify({
            'message': 'Image uploaded successfully',
            'id': upload_id,
            'filename': filename,
            'url': f'/api/uploads/images/{filename}',
            'size': file_size
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@uploads_bp.route('/document', methods=['POST'])
@jwt_required()
def upload_document():
    """Upload a document file"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Check file type
        allowed_extensions = {'pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'}
        if not allowed_file(file.filename, allowed_extensions):
            return jsonify({'error': 'Invalid file type. Allowed: pdf, doc, docx, txt, rtf, odt'}), 400
        
        # Generate unique filename
        filename = generate_unique_filename(file.filename)
        
        # Create upload directory if it doesn't exist
        upload_dir = os.path.join(current_app.config['UPLOAD_FOLDER'], 'documents')
        os.makedirs(upload_dir, exist_ok=True)
        
        # Save file
        file_path = os.path.join(upload_dir, filename)
        file.save(file_path)
        
        # Get file info
        file_size = os.path.getsize(file_path)
        current_user_id = get_jwt_identity()
        
        # Save to database
        conn = get_db_connection()
        cursor = conn.execute("""
            INSERT INTO uploads (filename, original_filename, file_path, file_size, 
                               file_type, uploaded_by, upload_type)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            filename,
            secure_filename(file.filename),
            f'documents/{filename}',
            file_size,
            'document',
            current_user_id,
            'document'
        ))
        
        upload_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return jsonify({
            'message': 'Document uploaded successfully',
            'id': upload_id,
            'filename': filename,
            'url': f'/api/uploads/documents/{filename}',
            'size': file_size
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@uploads_bp.route('/avatar', methods=['POST'])
@jwt_required()
def upload_avatar():
    """Upload an avatar image"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Check file type
        allowed_extensions = {'jpg', 'jpeg', 'png'}
        if not allowed_file(file.filename, allowed_extensions):
            return jsonify({'error': 'Invalid file type. Allowed: jpg, jpeg, png'}), 400
        
        # Generate unique filename
        filename = generate_unique_filename(file.filename)
        
        # Create upload directory if it doesn't exist
        upload_dir = os.path.join(current_app.config['UPLOAD_FOLDER'], 'avatars')
        os.makedirs(upload_dir, exist_ok=True)
        
        # Save file
        file_path = os.path.join(upload_dir, filename)
        file.save(file_path)
        
        # Resize avatar (square, 300x300)
        try:
            with Image.open(file_path) as img:
                # Convert to RGB if necessary
                if img.mode in ('RGBA', 'LA'):
                    background = Image.new('RGB', img.size, (255, 255, 255))
                    background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                    img = background
                
                # Make square crop
                width, height = img.size
                size = min(width, height)
                left = (width - size) // 2
                top = (height - size) // 2
                right = left + size
                bottom = top + size
                
                img = img.crop((left, top, right, bottom))
                img = img.resize((300, 300), Image.Resampling.LANCZOS)
                img.save(file_path, optimize=True, quality=90)
                
        except Exception as e:
            print(f"Error processing avatar: {e}")
        
        # Get file info
        file_size = os.path.getsize(file_path)
        current_user_id = get_jwt_identity()
        
        # Save to database
        conn = get_db_connection()
        cursor = conn.execute("""
            INSERT INTO uploads (filename, original_filename, file_path, file_size, 
                               file_type, uploaded_by, upload_type)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            filename,
            secure_filename(file.filename),
            f'avatars/{filename}',
            file_size,
            'image',
            current_user_id,
            'avatar'
        ))
        
        upload_id = cursor.lastrowid
        
        # Update user avatar
        conn.execute("""
            UPDATE users SET avatar_url = ? WHERE id = ?
        """, (f'/api/uploads/avatars/{filename}', current_user_id))
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'message': 'Avatar uploaded successfully',
            'id': upload_id,
            'filename': filename,
            'url': f'/api/uploads/avatars/{filename}',
            'size': file_size
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@uploads_bp.route('/images/<filename>')
def serve_image(filename):
    """Serve uploaded images"""
    try:
        upload_dir = os.path.join(current_app.config['UPLOAD_FOLDER'], 'images')
        return send_from_directory(upload_dir, filename)
    except Exception as e:
        return jsonify({'error': 'File not found'}), 404

@uploads_bp.route('/documents/<filename>')
@jwt_required()
def serve_document(filename):
    """Serve uploaded documents (requires authentication)"""
    try:
        upload_dir = os.path.join(current_app.config['UPLOAD_FOLDER'], 'documents')
        return send_from_directory(upload_dir, filename)
    except Exception as e:
        return jsonify({'error': 'File not found'}), 404

@uploads_bp.route('/avatars/<filename>')
def serve_avatar(filename):
    """Serve avatar images"""
    try:
        upload_dir = os.path.join(current_app.config['UPLOAD_FOLDER'], 'avatars')
        return send_from_directory(upload_dir, filename)
    except Exception as e:
        return jsonify({'error': 'File not found'}), 404

@uploads_bp.route('/my-uploads', methods=['GET'])
@jwt_required()
def get_my_uploads():
    """Get current user's uploads"""
    try:
        current_user_id = get_jwt_identity()
        upload_type = request.args.get('type')  # image, document, avatar
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 20, type=int), 50)
        
        conn = get_db_connection()
        
        query = "SELECT * FROM uploads WHERE uploaded_by = ?"
        params = [current_user_id]
        
        if upload_type:
            query += " AND upload_type = ?"
            params.append(upload_type)
        
        query += " ORDER BY created_at DESC LIMIT ? OFFSET ?"
        params.extend([per_page, (page - 1) * per_page])
        
        uploads = conn.execute(query, params).fetchall()
        
        # Get total count
        count_query = "SELECT COUNT(*) FROM uploads WHERE uploaded_by = ?"
        count_params = [current_user_id]
        
        if upload_type:
            count_query += " AND upload_type = ?"
            count_params.append(upload_type)
        
        total = conn.execute(count_query, count_params).fetchone()[0]
        conn.close()
        
        return jsonify({
            'uploads': [dict(upload) for upload in uploads],
            'total': total,
            'page': page,
            'per_page': per_page,
            'pages': (total + per_page - 1) // per_page
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@uploads_bp.route('/<int:upload_id>', methods=['DELETE'])
@jwt_required()
def delete_upload(upload_id):
    """Delete an upload"""
    try:
        current_user_id = get_jwt_identity()
        
        conn = get_db_connection()
        
        # Check if upload exists and belongs to user
        upload = conn.execute("""
            SELECT * FROM uploads WHERE id = ? AND uploaded_by = ?
        """, (upload_id, current_user_id)).fetchone()
        
        if not upload:
            conn.close()
            return jsonify({'error': 'Upload not found'}), 404
        
        # Delete file from filesystem
        file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], upload['file_path'])
        if os.path.exists(file_path):
            os.remove(file_path)
        
        # Delete from database
        conn.execute("DELETE FROM uploads WHERE id = ?", (upload_id,))
        conn.commit()
        conn.close()
        
        return jsonify({'message': 'Upload deleted successfully'})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@uploads_bp.route('/admin', methods=['GET'])
@jwt_required()
@admin_required
def get_all_uploads():
    """Get all uploads (admin only)"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 20, type=int), 50)
        upload_type = request.args.get('type')
        
        conn = get_db_connection()
        
        query = """
            SELECT u.*, us.username as uploader_name 
            FROM uploads u 
            LEFT JOIN users us ON u.uploaded_by = us.id
        """
        params = []
        
        if upload_type:
            query += " WHERE u.upload_type = ?"
            params.append(upload_type)
        
        query += " ORDER BY u.created_at DESC LIMIT ? OFFSET ?"
        params.extend([per_page, (page - 1) * per_page])
        
        uploads = conn.execute(query, params).fetchall()
        
        # Get total count
        count_query = "SELECT COUNT(*) FROM uploads"
        count_params = []
        
        if upload_type:
            count_query += " WHERE upload_type = ?"
            count_params.append(upload_type)
        
        total = conn.execute(count_query, count_params).fetchone()[0]
        conn.close()
        
        return jsonify({
            'uploads': [dict(upload) for upload in uploads],
            'total': total,
            'page': page,
            'per_page': per_page,
            'pages': (total + per_page - 1) // per_page
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@uploads_bp.route('/admin/<int:upload_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def admin_delete_upload(upload_id):
    """Delete any upload (admin only)"""
    try:
        conn = get_db_connection()
        
        # Check if upload exists
        upload = conn.execute("SELECT * FROM uploads WHERE id = ?", (upload_id,)).fetchone()
        
        if not upload:
            conn.close()
            return jsonify({'error': 'Upload not found'}), 404
        
        # Delete file from filesystem
        file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], upload['file_path'])
        if os.path.exists(file_path):
            os.remove(file_path)
        
        # Delete from database
        conn.execute("DELETE FROM uploads WHERE id = ?", (upload_id,))
        conn.commit()
        conn.close()
        
        return jsonify({'message': 'Upload deleted successfully'})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

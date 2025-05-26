from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import sqlite3
import os
from datetime import datetime
from ..utils.permissions import admin_required
from ..utils.validators import validate_news_data

news_bp = Blueprint('news', __name__)

def get_db_connection():
    """Get database connection"""
    db_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'university.db')
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

@news_bp.route('/', methods=['GET'])
def get_news():
    """Get all news articles with pagination"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 10, type=int), 50)
        category = request.args.get('category')
        search = request.args.get('search')
        
        conn = get_db_connection()
        
        # Build query
        query = """
            SELECT n.*, u.username as author_name 
            FROM news n 
            LEFT JOIN users u ON n.author_id = u.id 
            WHERE n.published = 1
        """
        params = []
        
        if category:
            query += " AND n.category = ?"
            params.append(category)
            
        if search:
            query += " AND (n.title LIKE ? OR n.content LIKE ?)"
            params.extend([f'%{search}%', f'%{search}%'])
        
        query += " ORDER BY n.created_at DESC LIMIT ? OFFSET ?"
        params.extend([per_page, (page - 1) * per_page])
        
        news = conn.execute(query, params).fetchall()
        
        # Get total count
        count_query = "SELECT COUNT(*) FROM news WHERE published = 1"
        count_params = []
        
        if category:
            count_query += " AND category = ?"
            count_params.append(category)
            
        if search:
            count_query += " AND (title LIKE ? OR content LIKE ?)"
            count_params.extend([f'%{search}%', f'%{search}%'])
        
        total = conn.execute(count_query, count_params).fetchone()[0]
        conn.close()
        
        return jsonify({
            'news': [dict(article) for article in news],
            'total': total,
            'page': page,
            'per_page': per_page,
            'pages': (total + per_page - 1) // per_page
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@news_bp.route('/<int:news_id>', methods=['GET'])
def get_news_article(news_id):
    """Get a specific news article"""
    try:
        conn = get_db_connection()
        article = conn.execute("""
            SELECT n.*, u.username as author_name 
            FROM news n 
            LEFT JOIN users u ON n.author_id = u.id 
            WHERE n.id = ? AND n.published = 1
        """, (news_id,)).fetchone()
        
        if not article:
            conn.close()
            return jsonify({'error': 'Article not found'}), 404
        
        # Increment view count
        conn.execute("UPDATE news SET views = views + 1 WHERE id = ?", (news_id,))
        conn.commit()
        conn.close()
        
        return jsonify(dict(article))
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@news_bp.route('/categories', methods=['GET'])
def get_categories():
    """Get all news categories"""
    try:
        conn = get_db_connection()
        categories = conn.execute("""
            SELECT category, COUNT(*) as count 
            FROM news 
            WHERE published = 1 
            GROUP BY category 
            ORDER BY category
        """).fetchall()
        conn.close()
        
        return jsonify([dict(cat) for cat in categories])
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@news_bp.route('/featured', methods=['GET'])
def get_featured_news():
    """Get featured news articles"""
    try:
        limit = request.args.get('limit', 5, type=int)
        
        conn = get_db_connection()
        featured = conn.execute("""
            SELECT n.*, u.username as author_name 
            FROM news n 
            LEFT JOIN users u ON n.author_id = u.id 
            WHERE n.published = 1 AND n.featured = 1 
            ORDER BY n.created_at DESC 
            LIMIT ?
        """, (limit,)).fetchall()
        conn.close()
        
        return jsonify([dict(article) for article in featured])
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@news_bp.route('/', methods=['POST'])
@jwt_required()
@admin_required
def create_news():
    """Create a new news article (admin only)"""
    try:
        data = request.get_json()
        
        # Validate data
        validation_error = validate_news_data(data)
        if validation_error:
            return jsonify({'error': validation_error}), 400
        
        current_user_id = get_jwt_identity()
        
        conn = get_db_connection()
        cursor = conn.execute("""
            INSERT INTO news (title, content, summary, category, author_id, featured, published, image_url)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            data['title'],
            data['content'],
            data.get('summary', ''),
            data['category'],
            current_user_id,
            data.get('featured', False),
            data.get('published', True),
            data.get('image_url', '')
        ))
        
        news_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return jsonify({'message': 'News article created successfully', 'id': news_id}), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@news_bp.route('/<int:news_id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_news(news_id):
    """Update a news article (admin only)"""
    try:
        data = request.get_json()
        
        # Validate data
        validation_error = validate_news_data(data)
        if validation_error:
            return jsonify({'error': validation_error}), 400
        
        conn = get_db_connection()
        
        # Check if article exists
        existing = conn.execute("SELECT id FROM news WHERE id = ?", (news_id,)).fetchone()
        if not existing:
            conn.close()
            return jsonify({'error': 'Article not found'}), 404
        
        conn.execute("""
            UPDATE news 
            SET title = ?, content = ?, summary = ?, category = ?, 
                featured = ?, published = ?, image_url = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        """, (
            data['title'],
            data['content'],
            data.get('summary', ''),
            data['category'],
            data.get('featured', False),
            data.get('published', True),
            data.get('image_url', ''),
            news_id
        ))
        
        conn.commit()
        conn.close()
        
        return jsonify({'message': 'News article updated successfully'})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@news_bp.route('/<int:news_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_news(news_id):
    """Delete a news article (admin only)"""
    try:
        conn = get_db_connection()
        
        # Check if article exists
        existing = conn.execute("SELECT id FROM news WHERE id = ?", (news_id,)).fetchone()
        if not existing:
            conn.close()
            return jsonify({'error': 'Article not found'}), 404
        
        conn.execute("DELETE FROM news WHERE id = ?", (news_id,))
        conn.commit()
        conn.close()
        
        return jsonify({'message': 'News article deleted successfully'})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@news_bp.route('/admin', methods=['GET'])
@jwt_required()
@admin_required
def get_admin_news():
    """Get all news articles for admin (including unpublished)"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 10, type=int), 50)
        
        conn = get_db_connection()
        
        news = conn.execute("""
            SELECT n.*, u.username as author_name 
            FROM news n 
            LEFT JOIN users u ON n.author_id = u.id 
            ORDER BY n.created_at DESC 
            LIMIT ? OFFSET ?
        """, (per_page, (page - 1) * per_page)).fetchall()
        
        total = conn.execute("SELECT COUNT(*) FROM news").fetchone()[0]
        conn.close()
        
        return jsonify({
            'news': [dict(article) for article in news],
            'total': total,
            'page': page,
            'per_page': per_page,
            'pages': (total + per_page - 1) // per_page
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

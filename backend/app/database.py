import sqlite3
import os
import bcrypt
from datetime import datetime
from contextlib import contextmanager

DATABASE_PATH = 'university.db'

@contextmanager
def get_db_connection():
    """Context manager for database connections"""
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

def hash_password(password):
    """Hash password using bcrypt"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password, hashed):
    """Verify password against hash"""
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def init_db():
    """Initialize database with all tables"""
    with get_db_connection() as conn:
        # Users table with enhanced role management
        conn.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                name TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'department_admin',
                college_id INTEGER,
                faculty_id INTEGER,
                department_id INTEGER,
                is_active BOOLEAN DEFAULT 1,
                last_login TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (college_id) REFERENCES colleges (id),
                FOREIGN KEY (faculty_id) REFERENCES faculties (id),
                FOREIGN KEY (department_id) REFERENCES departments (id)
            )
        ''')
        
        # Add missing columns to existing users table if they don't exist
        try:
            conn.execute('ALTER TABLE users ADD COLUMN college_id INTEGER')
        except sqlite3.OperationalError:
            pass  # Column already exists
            
        try:
            conn.execute('ALTER TABLE users ADD COLUMN department_id INTEGER')
        except sqlite3.OperationalError:
            pass  # Column already exists
        
        # Page views table for analytics
        conn.execute('''
            CREATE TABLE IF NOT EXISTS page_views (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                page TEXT NOT NULL,
                title TEXT,
                referrer TEXT,
                referrer_domain TEXT,
                ip_address TEXT,
                user_agent TEXT,
                device_type TEXT, -- mobile, tablet, desktop
                browser TEXT,
                os TEXT,
                screen_resolution TEXT,
                language TEXT,
                session_id TEXT,
                user_id INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        
        # User sessions table
        conn.execute('''
            CREATE TABLE IF NOT EXISTS user_sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT UNIQUE NOT NULL,
                ip_address TEXT,
                user_agent TEXT,
                device_type TEXT,
                browser TEXT,
                os TEXT,
                country TEXT,
                city TEXT,
                first_visit TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                page_views INTEGER DEFAULT 0,
                duration INTEGER DEFAULT 0, -- in seconds
                is_bounce BOOLEAN DEFAULT 1,
                user_id INTEGER,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        
        # Roles and permissions table
        conn.execute('''
            CREATE TABLE IF NOT EXISTS roles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT UNIQUE NOT NULL,
                description TEXT,
                permissions TEXT, -- JSON string of permissions
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # User permissions table
        conn.execute('''
            CREATE TABLE IF NOT EXISTS user_permissions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                resource_type TEXT NOT NULL, -- 'faculty', 'department', 'news', etc.
                resource_id INTEGER,
                permission TEXT NOT NULL, -- 'read', 'write', 'delete', 'admin'
                granted_by INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id),
                FOREIGN KEY (granted_by) REFERENCES users (id)
            )
        ''')
        
        # Colleges table (multiple colleges support)
        conn.execute('''
            CREATE TABLE IF NOT EXISTS colleges (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                name_ar TEXT,
                name_fr TEXT,
                description TEXT,
                description_ar TEXT,
                description_fr TEXT,
                logo TEXT,
                website_url TEXT,
                contact_email TEXT,
                contact_phone TEXT,
                address TEXT,
                established_year INTEGER,
                is_active BOOLEAN DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Faculties table (updated to belong to colleges)
        conn.execute('''
            CREATE TABLE IF NOT EXISTS faculties (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                college_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                name_ar TEXT,
                name_fr TEXT,
                description TEXT,
                description_ar TEXT,
                description_fr TEXT,
                image TEXT,
                dean_name TEXT,
                contact_email TEXT,
                contact_phone TEXT,
                students_count INTEGER DEFAULT 0,
                departments_count INTEGER DEFAULT 0,
                is_active BOOLEAN DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (college_id) REFERENCES colleges (id)
            )
        ''')
        
        # Enhanced news table
        conn.execute('''
            CREATE TABLE IF NOT EXISTS news (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                title_ar TEXT,
                title_fr TEXT,
                content TEXT NOT NULL,
                content_ar TEXT,
                content_fr TEXT,
                excerpt TEXT,
                excerpt_ar TEXT,
                excerpt_fr TEXT,
                image TEXT,
                category TEXT DEFAULT 'general',
                tags TEXT, -- JSON array of tags
                author_id INTEGER NOT NULL,
                author_name TEXT NOT NULL,
                college_id INTEGER,
                faculty_id INTEGER,
                department_id INTEGER,
                is_published BOOLEAN DEFAULT 1,
                is_featured BOOLEAN DEFAULT 0,
                publish_date TIMESTAMP,
                views_count INTEGER DEFAULT 0,
                likes_count INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (author_id) REFERENCES users (id),
                FOREIGN KEY (college_id) REFERENCES colleges (id),
                FOREIGN KEY (faculty_id) REFERENCES faculties (id),
                FOREIGN KEY (department_id) REFERENCES departments (id)
            )
        ''')
        
        # Enhanced files table with security features
        conn.execute('''
            CREATE TABLE IF NOT EXISTS files (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                filename TEXT NOT NULL,
                original_filename TEXT NOT NULL,
                file_path TEXT NOT NULL,
                file_type TEXT NOT NULL,
                file_size INTEGER NOT NULL,
                mime_type TEXT NOT NULL,
                file_hash TEXT NOT NULL,
                uploaded_by INTEGER NOT NULL,
                category TEXT DEFAULT 'general',
                description TEXT,
                college_id INTEGER,
                faculty_id INTEGER,
                department_id INTEGER,
                is_public BOOLEAN DEFAULT 0,
                is_scanned BOOLEAN DEFAULT 0,
                scan_result TEXT,
                download_count INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (uploaded_by) REFERENCES users (id),
                FOREIGN KEY (college_id) REFERENCES colleges (id),
                FOREIGN KEY (faculty_id) REFERENCES faculties (id),
                FOREIGN KEY (department_id) REFERENCES departments (id)
            )
        ''')

        # File access logs for audit trail
        conn.execute('''
            CREATE TABLE IF NOT EXISTS file_access_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                file_id INTEGER NOT NULL,
                user_id INTEGER,
                action TEXT NOT NULL, -- 'download', 'view', 'delete'
                ip_address TEXT,
                user_agent TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (file_id) REFERENCES files (id),
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')

        # Quarantine table for suspicious files
        conn.execute('''
            CREATE TABLE IF NOT EXISTS quarantine_files (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                original_file_id INTEGER,
                filename TEXT NOT NULL,
                file_path TEXT NOT NULL,
                reason TEXT NOT NULL,
                detected_by TEXT,
                quarantined_by INTEGER NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (quarantined_by) REFERENCES users (id)
            )
        ''')
        
        # Activity logs for audit trail
        conn.execute('''
            CREATE TABLE IF NOT EXISTS activity_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                action TEXT NOT NULL,
                resource_type TEXT,
                resource_id INTEGER,
                details TEXT,
                ip_address TEXT,
                user_agent TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        
        # Create indexes for better performance
        conn.execute('CREATE INDEX IF NOT EXISTS idx_page_views_page ON page_views(page)')
        conn.execute('CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views(created_at)')
        conn.execute('CREATE INDEX IF NOT EXISTS idx_page_views_ip ON page_views(ip_address)')
        conn.execute('CREATE INDEX IF NOT EXISTS idx_user_sessions_session_id ON user_sessions(session_id)')
        conn.execute('CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id)')
        conn.execute('CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at)')
        
        # Create default roles
        create_default_roles(conn)
        
        # Create default admin user if not exists
        create_default_admin(conn)
        
        # Create sample college if not exists
        create_sample_data(conn)
        
        conn.commit()

def create_default_roles(conn):
    """Create default system roles"""
    roles = [
        ('super_admin', 'Super Administrator', '["all", "analytics_view"]'),
        ('college_admin', 'College Administrator', '["college_manage", "faculty_manage", "user_manage", "analytics_view"]'),
        ('faculty_admin', 'Faculty Administrator', '["faculty_manage", "department_manage", "news_manage"]'),
        ('department_admin', 'Department Administrator', '["department_manage", "news_create", "files_manage"]'),
        ('ai_house_admin', 'AI House Administrator', '["ai_house_manage", "projects_manage"]'),
        ('incubator_admin', 'Incubator Administrator', '["incubator_manage", "startups_manage"]'),
        ('editor', 'Content Editor', '["news_create", "news_edit"]'),
        ('viewer', 'Viewer', '["read_only"]')
    ]
    
    for role_name, description, permissions in roles:
        conn.execute('''
            INSERT OR IGNORE INTO roles (name, description, permissions)
            VALUES (?, ?, ?)
        ''', (role_name, description, permissions))

def create_default_admin(conn):
    """Create default admin user"""
    cursor = conn.execute('SELECT COUNT(*) FROM users WHERE role = "super_admin"')
    admin_count = cursor.fetchone()[0]
    
    if admin_count == 0:
        password_hash = hash_password('admin123')
        conn.execute('''
            INSERT INTO users (username, email, password_hash, name, role)
            VALUES (?, ?, ?, ?, ?)
        ''', ('admin', 'admin@univ-khenchela.dz', password_hash, 'System Administrator', 'super_admin'))

def create_sample_data(conn):
    """Create sample college and faculties"""
    # Check if college exists
    cursor = conn.execute('SELECT COUNT(*) FROM colleges')
    college_count = cursor.fetchone()[0]
    
    if college_count == 0:
        # Create University of Khenchela as default college
        conn.execute('''
            INSERT INTO colleges (name, name_ar, name_fr, description, description_ar, description_fr, 
                                contact_email, contact_phone, established_year)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            'University of Khenchela',
            'جامعة خنشلة',
            'Université de Khenchela',
            'Leading university in higher education and research',
            'جامعة رائدة في التعليم العالي والبحث العلمي',
            'Université leader dans l\'enseignement supérieur et la recherche',
            'info@univ-khenchela.dz',
            '+213 32 XX XX XX',
            2001
        ))
        
        college_id = cursor.lastrowid

        
        # Create sample faculties
        sample_faculties = [
            ('Faculty of Science and Technology', 'كلية العلوم والتكنولوجيا', 'Faculté des Sciences et de la Technologie'),
            ('Faculty of Economics', 'كلية العلوم الاقتصادية', 'Faculté des Sciences Économiques'),
            ('Faculty of Letters and Languages', 'كلية الآداب واللغات', 'Faculté des Lettres et des Langues'),
        ]
        
        for faculty in sample_faculties:
            conn.execute('''
                INSERT INTO faculties (college_id, name, name_ar, name_fr, description, students_count, departments_count)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (college_id, faculty[0], faculty[1], faculty[2], f'Description for {faculty[0]}', 1000, 5))

def log_activity(user_id, action, resource_type=None, resource_id=None, details=None, ip_address=None, user_agent=None):
    """Log user activity"""
    with get_db_connection() as conn:
        conn.execute('''
            INSERT INTO activity_logs (user_id, action, resource_type, resource_id, details, ip_address, user_agent)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (user_id, action, resource_type, resource_id, details, ip_address, user_agent))
        conn.commit()

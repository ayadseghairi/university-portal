from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_mail import Mail
import os
import logging
from logging.handlers import RotatingFileHandler
from datetime import timedelta

# Initialize extensions
jwt = JWTManager()
mail = Mail()
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["100 per hour"]
)

def create_app(config_name='development'):
    app = Flask(__name__)
    
    # Load configuration
    load_config(app, config_name)
    
    # Initialize extensions
    initialize_extensions(app)
    
    # Setup logging
    setup_logging(app)
    
    # Create upload directories
    setup_upload_directories(app)
    
    # Initialize database
    from .database import init_db
    init_db()
    
    # Register blueprints
    register_blueprints(app)
    
    # Setup error handlers
    setup_error_handlers(app)
    
    return app

def load_config(app, config_name):
    """Load configuration from environment variables"""
    from dotenv import load_dotenv
    load_dotenv()
    
    # Basic Flask config
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
    app.config['DATABASE_URL'] = os.environ.get('DATABASE_URL', 'sqlite:///university.db')
    app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'uploads')
    app.config['MAX_CONTENT_LENGTH'] = int(os.environ.get('MAX_CONTENT_LENGTH', 16 * 1024 * 1024))
    
    # JWT Configuration
    app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'jwt-secret-change-in-production')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(seconds=int(os.environ.get('JWT_ACCESS_TOKEN_EXPIRES', 3600)))
    app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(seconds=int(os.environ.get('JWT_REFRESH_TOKEN_EXPIRES', 2592000)))
    app.config['JWT_TOKEN_LOCATION'] = ['cookies', 'headers']
    app.config['JWT_COOKIE_SECURE'] = config_name == 'production'
    app.config['JWT_COOKIE_CSRF_PROTECT'] = False  # Disable CSRF for development
    app.config['JWT_CSRF_IN_COOKIES'] = False
    
    # CORS Configuration
    cors_origins = os.environ.get('CORS_ORIGINS', 'http://localhost:3000').split(',')
    app.config['CORS_ORIGINS'] = cors_origins
    
    # Mail Configuration
    app.config['MAIL_SERVER'] = os.environ.get('MAIL_SERVER', 'smtp.gmail.com')
    app.config['MAIL_PORT'] = int(os.environ.get('MAIL_PORT', 587))
    app.config['MAIL_USE_TLS'] = os.environ.get('MAIL_USE_TLS', 'True').lower() == 'true'
    app.config['MAIL_USERNAME'] = os.environ.get('MAIL_USERNAME')
    app.config['MAIL_PASSWORD'] = os.environ.get('MAIL_PASSWORD')
    
    # File upload configuration
    app.config['ALLOWED_EXTENSIONS'] = set(os.environ.get('ALLOWED_EXTENSIONS', 'jpg,jpeg,png,gif,pdf,doc,docx').split(','))

def initialize_extensions(app):
    """Initialize Flask extensions"""
    # CORS - More permissive for development
    CORS(app, 
         origins=['http://localhost:3000', 'http://127.0.0.1:3000'],
         supports_credentials=True,
         allow_headers=['Content-Type', 'Authorization', 'X-CSRF-TOKEN', 'X-Requested-With'],
         methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
         expose_headers=['Set-Cookie'])
    
    # JWT
    jwt.init_app(app)
    
    # Mail
    mail.init_app(app)
    
    # Rate Limiter
    limiter.init_app(app)

def setup_logging(app):
    """Setup application logging"""
    if not app.debug and not app.testing:
        # Create logs directory if it doesn't exist
        if not os.path.exists('logs'):
            os.mkdir('logs')
        
        # Setup file handler
        file_handler = RotatingFileHandler('logs/university_portal.log', 
                                         maxBytes=10240000, backupCount=10)
        file_handler.setFormatter(logging.Formatter(
            '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
        ))
        file_handler.setLevel(logging.INFO)
        app.logger.addHandler(file_handler)
        
        app.logger.setLevel(logging.INFO)
        app.logger.info('University Portal startup')

def setup_upload_directories(app):
    """Create upload directories"""
    upload_folder = app.config['UPLOAD_FOLDER']
    directories = ['images', 'documents', 'avatars', 'temp']
    
    for directory in directories:
        dir_path = os.path.join(upload_folder, directory)
        os.makedirs(dir_path, exist_ok=True)

def register_blueprints(app):
    """Register application blueprints"""
    from .routes.auth import auth_bp
    from .routes.analytics import analytics_bp
    from .routes.downloads import downloads_bp
    from .routes.news import news_bp
    from .routes.faculties import faculties_bp
    from .routes.ai_house import ai_house_bp
    from .routes.incubator import incubator_bp
    from .routes.uploads import uploads_bp
    from .routes.admin import admin_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(analytics_bp, url_prefix='/api/analytics')
    app.register_blueprint(downloads_bp, url_prefix='/api/downloads')
    app.register_blueprint(news_bp, url_prefix='/api/news')
    app.register_blueprint(faculties_bp, url_prefix='/api/faculties')
    app.register_blueprint(ai_house_bp, url_prefix='/api/ai-house')
    app.register_blueprint(incubator_bp, url_prefix='/api/incubator')
    app.register_blueprint(uploads_bp, url_prefix='/api/uploads')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')

def setup_error_handlers(app):
    """Setup error handlers"""
    from flask import jsonify
    
    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({'error': 'Bad request'}), 400
    
    @app.errorhandler(401)
    def unauthorized(error):
        return jsonify({'error': 'Unauthorized'}), 401
    
    @app.errorhandler(403)
    def forbidden(error):
        return jsonify({'error': 'Forbidden'}), 403
    
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Not found'}), 404
    
    @app.errorhandler(413)
    def request_entity_too_large(error):
        return jsonify({'error': 'File too large'}), 413
    
    @app.errorhandler(429)
    def ratelimit_handler(e):
        return jsonify({'error': 'Rate limit exceeded', 'message': str(e.description)}), 429
    
    @app.errorhandler(500)
    def internal_error(error):
        app.logger.error(f'Server Error: {error}')
        return jsonify({'error': 'Internal server error'}), 500

# JWT token handlers
@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    from flask import jsonify
    return jsonify({'error': 'Token has expired'}), 401

@jwt.invalid_token_loader
def invalid_token_callback(error):
    from flask import jsonify
    return jsonify({'error': 'Invalid token'}), 401

@jwt.unauthorized_loader
def missing_token_callback(error):
    from flask import jsonify
    return jsonify({'error': 'Authorization token is required'}), 401

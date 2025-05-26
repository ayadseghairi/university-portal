import pytest
import json
from app import create_app
from app.database import init_db, hash_password
import tempfile
import os

@pytest.fixture
def app():
    """Create and configure a new app instance for each test."""
    db_fd, db_path = tempfile.mkstemp()
    
    app = create_app('testing')
    app.config['DATABASE_URL'] = f'sqlite:///{db_path}'
    app.config['TESTING'] = True
    app.config['WTF_CSRF_ENABLED'] = False
    
    with app.app_context():
        init_db()
        
    yield app
    
    os.close(db_fd)
    os.unlink(db_path)

@pytest.fixture
def client(app):
    """A test client for the app."""
    return app.test_client()

@pytest.fixture
def runner(app):
    """A test runner for the app's Click commands."""
    return app.test_cli_runner()

class TestAuth:
    def test_login_success(self, client):
        """Test successful login"""
        response = client.post('/api/auth/login', 
                             data=json.dumps({
                                 'username': 'admin',
                                 'password': 'admin123'
                             }),
                             content_type='application/json')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'user' in data
        assert data['user']['username'] == 'admin'

    def test_login_invalid_credentials(self, client):
        """Test login with invalid credentials"""
        response = client.post('/api/auth/login',
                             data=json.dumps({
                                 'username': 'admin',
                                 'password': 'wrongpassword'
                             }),
                             content_type='application/json')
        
        assert response.status_code == 401
        data = json.loads(response.data)
        assert 'error' in data

    def test_login_missing_fields(self, client):
        """Test login with missing fields"""
        response = client.post('/api/auth/login',
                             data=json.dumps({
                                 'username': 'admin'
                             }),
                             content_type='application/json')
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data

    def test_verify_token_without_login(self, client):
        """Test token verification without login"""
        response = client.get('/api/auth/verify')
        assert response.status_code == 401

    def test_logout(self, client):
        """Test logout functionality"""
        # First login
        login_response = client.post('/api/auth/login',
                                   data=json.dumps({
                                       'username': 'admin',
                                       'password': 'admin123'
                                   }),
                                   content_type='application/json')
        
        assert login_response.status_code == 200
        
        # Then logout
        logout_response = client.post('/api/auth/logout')
        assert logout_response.status_code == 200

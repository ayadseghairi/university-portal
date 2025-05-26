import re
from typing import List, Optional

def validate_email(email: str) -> bool:
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password(password: str) -> bool:
    """Validate password strength"""
    if len(password) < 8:
        return False
    
    # Check for at least one uppercase, lowercase, digit, and special character
    if not re.search(r'[A-Z]', password):
        return False
    if not re.search(r'[a-z]', password):
        return False
    if not re.search(r'\d', password):
        return False
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        return False
    
    return True

def validate_file_type(filename: str, allowed_extensions: List[str]) -> bool:
    """Validate file extension"""
    if '.' not in filename:
        return False
    
    extension = filename.rsplit('.', 1)[1].lower()
    return extension in allowed_extensions

def validate_file_size(file_size: int, max_size: int) -> bool:
    """Validate file size"""
    return file_size <= max_size

def sanitize_filename(filename: str) -> str:
    """Sanitize filename for safe storage"""
    # Remove or replace dangerous characters
    filename = re.sub(r'[^\w\s.-]', '', filename)
    filename = re.sub(r'[-\s]+', '-', filename)
    return filename.strip('.-')

def validate_url(url: str) -> bool:
    """Validate URL format"""
    pattern = r'^https?://(?:[-\w.])+(?:[:\d]+)?(?:/(?:[\w/_.])*(?:\?(?:[\w&=%.])*)?(?:#(?:\w*))?)?$'
    return re.match(pattern, url) is not None

def validate_phone(phone: str) -> bool:
    """Validate phone number format"""
    # Simple validation for international phone numbers
    pattern = r'^\+?[\d\s\-$$$$]{10,}$'
    return re.match(pattern, phone) is not None

def validate_required_fields(data: dict, required_fields: List[str]) -> Optional[str]:
    """Validate that all required fields are present and not empty"""
    for field in required_fields:
        if field not in data or not str(data[field]).strip():
            return f'{field} is required'
    return None

def validate_string_length(text: str, min_length: int = 0, max_length: int = None) -> bool:
    """Validate string length"""
    if len(text) < min_length:
        return False
    if max_length and len(text) > max_length:
        return False
    return True

def validate_integer_range(value: int, min_value: int = None, max_value: int = None) -> bool:
    """Validate integer is within range"""
    if min_value is not None and value < min_value:
        return False
    if max_value is not None and value > max_value:
        return False
    return True

def validate_news_data(data: dict) -> Optional[str]:
    """Validate news article data"""
    required_fields = ['title', 'content', 'category']
    
    # Check required fields
    validation_error = validate_required_fields(data, required_fields)
    if validation_error:
        return validation_error
    
    # Validate title length
    if not validate_string_length(data['title'], min_length=5, max_length=200):
        return 'Title must be between 5 and 200 characters'
    
    # Validate content length
    if not validate_string_length(data['content'], min_length=50):
        return 'Content must be at least 50 characters'
    
    # Validate summary length if provided
    if 'summary' in data and data['summary']:
        if not validate_string_length(data['summary'], max_length=500):
            return 'Summary must be less than 500 characters'
    
    # Validate category
    allowed_categories = [
        'academic', 'research', 'events', 'announcements', 
        'achievements', 'admissions', 'general'
    ]
    if data['category'] not in allowed_categories:
        return f'Category must be one of: {", ".join(allowed_categories)}'
    
    # Validate image URL if provided
    if 'image_url' in data and data['image_url']:
        if not validate_url(data['image_url']):
            return 'Invalid image URL format'
    
    return None

def validate_faculty_data(data: dict) -> Optional[str]:
    """Validate faculty data"""
    required_fields = ['name', 'description']
    
    # Check required fields
    validation_error = validate_required_fields(data, required_fields)
    if validation_error:
        return validation_error
    
    # Validate name length
    if not validate_string_length(data['name'], min_length=2, max_length=100):
        return 'Faculty name must be between 2 and 100 characters'
    
    # Validate description length
    if not validate_string_length(data['description'], min_length=10, max_length=1000):
        return 'Description must be between 10 and 1000 characters'
    
    # Validate website URL if provided
    if 'website' in data and data['website']:
        if not validate_url(data['website']):
            return 'Invalid website URL format'
    
    # Validate email if provided
    if 'email' in data and data['email']:
        if not validate_email(data['email']):
            return 'Invalid email format'
    
    # Validate phone if provided
    if 'phone' in data and data['phone']:
        if not validate_phone(data['phone']):
            return 'Invalid phone number format'
    
    return None

def validate_department_data(data: dict) -> Optional[str]:
    """Validate department data"""
    required_fields = ['name', 'description', 'faculty_id']
    
    # Check required fields
    validation_error = validate_required_fields(data, required_fields)
    if validation_error:
        return validation_error
    
    # Validate name length
    if not validate_string_length(data['name'], min_length=2, max_length=100):
        return 'Department name must be between 2 and 100 characters'
    
    # Validate description length
    if not validate_string_length(data['description'], min_length=10, max_length=1000):
        return 'Description must be between 10 and 1000 characters'
    
    # Validate faculty_id is positive integer
    if not validate_integer_range(data['faculty_id'], min_value=1):
        return 'Faculty ID must be a positive integer'
    
    # Validate head of department if provided
    if 'head_of_department' in data and data['head_of_department']:
        if not validate_string_length(data['head_of_department'], min_length=2, max_length=100):
            return 'Head of department name must be between 2 and 100 characters'
    
    return None

def validate_project_data(data: dict) -> Optional[str]:
    """Validate AI House project data"""
    required_fields = ['title', 'description', 'category']
    
    # Check required fields
    validation_error = validate_required_fields(data, required_fields)
    if validation_error:
        return validation_error
    
    # Validate title length
    if not validate_string_length(data['title'], min_length=5, max_length=150):
        return 'Project title must be between 5 and 150 characters'
    
    # Validate description length
    if not validate_string_length(data['description'], min_length=20, max_length=2000):
        return 'Description must be between 20 and 2000 characters'
    
    # Validate category
    allowed_categories = [
        'machine_learning', 'deep_learning', 'nlp', 'computer_vision',
        'robotics', 'data_science', 'web_development', 'mobile_development'
    ]
    if data['category'] not in allowed_categories:
        return f'Category must be one of: {", ".join(allowed_categories)}'
    
    # Validate status if provided
    if 'status' in data:
        allowed_statuses = ['planning', 'active', 'completed', 'on_hold']
        if data['status'] not in allowed_statuses:
            return f'Status must be one of: {", ".join(allowed_statuses)}'
    
    # Validate team size if provided
    if 'max_team_size' in data:
        if not validate_integer_range(data['max_team_size'], min_value=1, max_value=20):
            return 'Max team size must be between 1 and 20'
    
    return None

def validate_event_data(data: dict) -> Optional[str]:
    """Validate event data"""
    required_fields = ['title', 'description', 'event_date', 'location']
    
    # Check required fields
    validation_error = validate_required_fields(data, required_fields)
    if validation_error:
        return validation_error
    
    # Validate title length
    if not validate_string_length(data['title'], min_length=5, max_length=150):
        return 'Event title must be between 5 and 150 characters'
    
    # Validate description length
    if not validate_string_length(data['description'], min_length=20, max_length=2000):
        return 'Description must be between 20 and 2000 characters'
    
    # Validate location length
    if not validate_string_length(data['location'], min_length=2, max_length=200):
        return 'Location must be between 2 and 200 characters'
    
    # Validate max participants if provided
    if 'max_participants' in data and data['max_participants']:
        if not validate_integer_range(data['max_participants'], min_value=1, max_value=1000):
            return 'Max participants must be between 1 and 1000'
    
    return None

def validate_company_data(data: dict) -> Optional[str]:
    """Validate startup company data"""
    required_fields = ['name', 'description', 'industry']
    
    # Check required fields
    validation_error = validate_required_fields(data, required_fields)
    if validation_error:
        return validation_error
    
    # Validate name length
    if not validate_string_length(data['name'], min_length=2, max_length=100):
        return 'Company name must be between 2 and 100 characters'
    
    # Validate description length
    if not validate_string_length(data['description'], min_length=20, max_length=2000):
        return 'Description must be between 20 and 2000 characters'
    
    # Validate industry
    allowed_industries = [
        'technology', 'healthcare', 'finance', 'education', 'retail',
        'manufacturing', 'agriculture', 'energy', 'transportation', 'other'
    ]
    if data['industry'] not in allowed_industries:
        return f'Industry must be one of: {", ".join(allowed_industries)}'
    
    # Validate website if provided
    if 'website' in data and data['website']:
        if not validate_url(data['website']):
            return 'Invalid website URL format'
    
    # Validate employee count if provided
    if 'employee_count' in data and data['employee_count']:
        if not validate_integer_range(data['employee_count'], min_value=1, max_value=10000):
            return 'Employee count must be between 1 and 10000'
    
    return None

def validate_user_data(data: dict) -> Optional[str]:
    """Validate user registration/update data"""
    required_fields = ['username', 'email']
    
    # Check required fields
    validation_error = validate_required_fields(data, required_fields)
    if validation_error:
        return validation_error
    
    # Validate username
    if not validate_string_length(data['username'], min_length=3, max_length=50):
        return 'Username must be between 3 and 50 characters'
    
    # Username should only contain alphanumeric characters and underscores
    import re
    if not re.match(r'^[a-zA-Z0-9_]+$', data['username']):
        return 'Username can only contain letters, numbers, and underscores'
    
    # Validate email
    if not validate_email(data['email']):
        return 'Invalid email format'
    
    # Validate password if provided (for registration)
    if 'password' in data:
        if not validate_password(data['password']):
            return 'Password must be at least 8 characters with uppercase, lowercase, digit, and special character'
    
    # Validate role if provided
    if 'role' in data:
        allowed_roles = [
            'student', 'faculty', 'staff', 'alumni', 'visitor',
            'department_admin', 'faculty_admin', 'college_admin', 
            'ai_house_admin', 'incubator_admin', 'super_admin'
        ]
        if data['role'] not in allowed_roles:
            return f'Role must be one of: {", ".join(allowed_roles)}'
    
    # Validate first_name and last_name if provided
    if 'first_name' in data and data['first_name']:
        if not validate_string_length(data['first_name'], min_length=1, max_length=50):
            return 'First name must be between 1 and 50 characters'
    
    if 'last_name' in data and data['last_name']:
        if not validate_string_length(data['last_name'], min_length=1, max_length=50):
            return 'Last name must be between 1 and 50 characters'
    
    return None

# Alias for AI House project validation
validate_ai_project_data = validate_project_data

# Additional aliases for different route modules
validate_startup_data = validate_company_data
validate_incubator_company_data = validate_company_data
validate_mentor_data = validate_user_data
validate_program_data = validate_event_data
validate_resource_data = validate_news_data

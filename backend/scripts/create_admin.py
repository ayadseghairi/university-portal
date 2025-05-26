#!/usr/bin/env python3
"""
Script to create admin users for the University Portal
Usage: python create_admin.py
"""

import sys
import os
import hashlib
import getpass
from datetime import datetime

# Add the parent directory to the path to import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import get_db_connection

def hash_password(password):
    """Hash password using SHA256"""
    return hashlib.sha256(password.encode()).hexdigest()

def validate_email(email):
    """Basic email validation"""
    return '@' in email and '.' in email.split('@')[1]

def validate_role(role):
    """Validate user role"""
    valid_roles = [
        'super_admin',
        'faculty_admin', 
        'department_admin',
        'ai_house_admin',
        'incubator_admin'
    ]
    return role in valid_roles

def get_faculties():
    """Get list of available faculties"""
    try:
        with get_db_connection() as conn:
            faculties = conn.execute('SELECT id, name FROM faculties ORDER BY name').fetchall()
            return faculties
    except Exception as e:
        print(f"Error fetching faculties: {str(e)}")
        return []

def create_admin_user():
    """Interactive function to create an admin user"""
    print("=" * 50)
    print("University Portal - Admin User Creation")
    print("=" * 50)
    
    # Get user input
    username = input("Enter username: ").strip()
    if not username:
        print("Error: Username cannot be empty")
        return False
    
    email = input("Enter email: ").strip()
    if not email or not validate_email(email):
        print("Error: Please enter a valid email address")
        return False
    
    name = input("Enter full name: ").strip()
    if not name:
        print("Error: Name cannot be empty")
        return False
    
    # Password input
    while True:
        password = getpass.getpass("Enter password: ")
        if len(password) < 6:
            print("Error: Password must be at least 6 characters long")
            continue
        
        confirm_password = getpass.getpass("Confirm password: ")
        if password != confirm_password:
            print("Error: Passwords do not match")
            continue
        break
    
    # Role selection
    print("\nAvailable roles:")
    roles = [
        ('super_admin', 'Super Administrator (Full access)'),
        ('faculty_admin', 'Faculty Administrator'),
        ('department_admin', 'Department Administrator'),
        ('ai_house_admin', 'AI House Administrator'),
        ('incubator_admin', 'Incubator Administrator')
    ]
    
    for i, (role_key, role_desc) in enumerate(roles, 1):
        print(f"{i}. {role_desc}")
    
    while True:
        try:
            role_choice = int(input("\nSelect role (1-5): "))
            if 1 <= role_choice <= 5:
                selected_role = roles[role_choice - 1][0]
                break
            else:
                print("Error: Please enter a number between 1 and 5")
        except ValueError:
            print("Error: Please enter a valid number")
    
    # Faculty selection (if not super admin)
    faculty_id = None
    if selected_role != 'super_admin':
        faculties = get_faculties()
        if faculties:
            print("\nAvailable faculties:")
            for i, faculty in enumerate(faculties, 1):
                print(f"{i}. {faculty['name']}")
            
            while True:
                try:
                    faculty_choice = int(input(f"\nSelect faculty (1-{len(faculties)}) or 0 for none: "))
                    if faculty_choice == 0:
                        break
                    elif 1 <= faculty_choice <= len(faculties):
                        faculty_id = faculties[faculty_choice - 1]['id']
                        break
                    else:
                        print(f"Error: Please enter a number between 0 and {len(faculties)}")
                except ValueError:
                    print("Error: Please enter a valid number")
    
    # Check if user already exists and create the user
    try:
        with get_db_connection() as conn:
            existing_user = conn.execute(
                'SELECT id FROM users WHERE username = ? OR email = ?',
                (username, email)
            ).fetchone()
            
            if existing_user:
                print("Error: User with this username or email already exists")
                return False
            
            # Create the user
            password_hash = hash_password(password)
            cursor = conn.execute('''
                INSERT INTO users (username, email, password_hash, name, role, faculty_id, is_active, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            ''', (username, email, password_hash, name, selected_role, faculty_id))
            
            user_id = cursor.lastrowid
            
            # Log the activity
            conn.execute('''
                INSERT INTO activity_logs (user_id, action, resource_type, resource_id, details, created_at)
                VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            ''', (user_id, 'user_created', 'user', user_id, f'Admin user created via script'))
            
            conn.commit()
            
            print("\n" + "=" * 50)
            print("SUCCESS: Admin user created successfully!")
            print("=" * 50)
            print(f"Username: {username}")
            print(f"Email: {email}")
            print(f"Name: {name}")
            print(f"Role: {selected_role}")
            if faculty_id:
                try:
                    faculty_name = next(f['name'] for f in get_faculties() if f['id'] == faculty_id)
                    print(f"Faculty: {faculty_name}")
                except StopIteration:
                    print("Faculty: N/A")
            print("=" * 50)
            
            return True
            
    except Exception as e:
        print(f"Error creating user: {str(e)}")
        return False

def list_admin_users():
    """List all admin users"""
    try:
        with get_db_connection() as conn:
            users = conn.execute('''
                SELECT u.id, u.username, u.email, u.name, u.role, u.is_active, 
                       u.created_at, f.name as faculty_name
                FROM users u
                LEFT JOIN faculties f ON u.faculty_id = f.id
                WHERE u.role IN ('super_admin', 'faculty_admin', 'department_admin', 'ai_house_admin', 'incubator_admin')
                ORDER BY u.created_at DESC
            ''').fetchall()
        
        if not users:
            print("No admin users found.")
            return
        
        print("\n" + "=" * 80)
        print("EXISTING ADMIN USERS")
        print("=" * 80)
        print(f"{'ID':<4} {'Username':<15} {'Name':<20} {'Role':<18} {'Faculty':<15} {'Status':<8}")
        print("-" * 80)
        
        for user in users:
            status = "Active" if user['is_active'] else "Inactive"
            faculty = user['faculty_name'] or "N/A"
            print(f"{user['id']:<4} {user['username']:<15} {user['name']:<20} {user['role']:<18} {faculty:<15} {status:<8}")
        
        print("=" * 80)
        
    except Exception as e:
        print(f"Error listing users: {str(e)}")

def change_password():
    """Change password for an existing user"""
    username = input("Enter username to change password: ").strip()
    if not username:
        print("Error: Username cannot be empty")
        return False
    
    try:
        with get_db_connection() as conn:
            user = conn.execute('SELECT id, name FROM users WHERE username = ?', (username,)).fetchone()
            
            if not user:
                print("Error: User not found")
                return False
            
            print(f"Changing password for: {user['name']} ({username})")
            
            while True:
                password = getpass.getpass("Enter new password: ")
                if len(password) < 6:
                    print("Error: Password must be at least 6 characters long")
                    continue
                
                confirm_password = getpass.getpass("Confirm new password: ")
                if password != confirm_password:
                    print("Error: Passwords do not match")
                    continue
                break
            
            password_hash = hash_password(password)
            conn.execute(
                'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                (password_hash, user['id'])
            )
            
            # Log the activity
            conn.execute('''
                INSERT INTO activity_logs (user_id, action, resource_type, resource_id, details, created_at)
                VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            ''', (user['id'], 'password_changed', 'user', user['id'], 'Password changed via script'))
            
            conn.commit()
            
            print("SUCCESS: Password changed successfully!")
            return True
            
    except Exception as e:
        print(f"Error changing password: {str(e)}")
        return False

def deactivate_user():
    """Deactivate a user account"""
    username = input("Enter username to deactivate: ").strip()
    if not username:
        print("Error: Username cannot be empty")
        return False
    
    try:
        with get_db_connection() as conn:
            user = conn.execute('SELECT id, name, is_active FROM users WHERE username = ?', (username,)).fetchone()
            
            if not user:
                print("Error: User not found")
                return False
            
            if not user['is_active']:
                print("User is already deactivated")
                return False
            
            print(f"Deactivating user: {user['name']} ({username})")
            confirm = input("Are you sure? (yes/no): ").strip().lower()
            
            if confirm != 'yes':
                print("Operation cancelled")
                return False
            
            conn.execute(
                'UPDATE users SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                (user['id'],)
            )
            
            # Log the activity
            conn.execute('''
                INSERT INTO activity_logs (user_id, action, resource_type, resource_id, details, created_at)
                VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            ''', (user['id'], 'user_deactivated', 'user', user['id'], 'User deactivated via script'))
            
            conn.commit()
            
            print("SUCCESS: User deactivated successfully!")
            return True
            
    except Exception as e:
        print(f"Error deactivating user: {str(e)}")
        return False

def main():
    """Main function"""
    while True:
        print("\n" + "=" * 50)
        print("University Portal - Admin Management")
        print("=" * 50)
        print("1. Create new admin user")
        print("2. List existing admin users")
        print("3. Change user password")
        print("4. Deactivate user")
        print("5. Exit")
        print("=" * 50)
        
        try:
            choice = int(input("Select an option (1-5): "))
            
            if choice == 1:
                create_admin_user()
            elif choice == 2:
                list_admin_users()
            elif choice == 3:
                change_password()
            elif choice == 4:
                deactivate_user()
            elif choice == 5:
                print("Goodbye!")
                break
            else:
                print("Error: Please enter a number between 1 and 5")
                
        except ValueError:
            print("Error: Please enter a valid number")
        except KeyboardInterrupt:
            print("\n\nOperation cancelled by user. Goodbye!")
            break
        except Exception as e:
            print(f"An error occurred: {str(e)}")

if __name__ == "__main__":
    main()

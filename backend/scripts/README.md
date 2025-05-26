# University Portal - Admin Scripts

This directory contains utility scripts for managing the University Portal backend.

## Scripts Overview

### 1. create_admin.py
Interactive script for managing admin users.

**Features:**
- Create new admin users with different roles
- List existing admin users
- Change user passwords
- Deactivate user accounts
- Input validation and error handling

**Usage:**
\`\`\`bash
cd backend
python3 scripts/create_admin.py
\`\`\`

**Available Roles:**
- `super_admin`: Full system access
- `faculty_admin`: Faculty-level administration
- `department_admin`: Department-level administration
- `ai_house_admin`: AI House management
- `incubator_admin`: Startup incubator management

### 2. setup_database.py
Database initialization and management script.

**Features:**
- Initialize database tables
- Create sample data for testing
- Reset database (with confirmation)
- Populate faculties, departments, news, and other entities

**Usage:**
\`\`\`bash
cd backend
python3 scripts/setup_database.py
\`\`\`

### 3. run_admin_script.sh
Bash wrapper for the admin management script.

**Usage:**
\`\`\`bash
cd backend/scripts
chmod +x run_admin_script.sh
./run_admin_script.sh
\`\`\`

### 4. setup_db.sh
Bash wrapper for the database setup script.

**Usage:**
\`\`\`bash
cd backend/scripts
chmod +x setup_db.sh
./setup_db.sh
\`\`\`

## Quick Start

### First Time Setup

1. **Initialize the database:**
   \`\`\`bash
   cd backend
   python3 scripts/setup_database.py
   # Choose option 1 to initialize database
   # Choose option 2 to create sample data
   \`\`\`

2. **Create your first admin user:**
   \`\`\`bash
   python3 scripts/create_admin.py
   # Choose option 1 to create new admin user
   \`\`\`

3. **Start the Flask server:**
   \`\`\`bash
   python3 run.py
   \`\`\`

### Regular Administration

**To create additional admin users:**
\`\`\`bash
cd backend
python3 scripts/create_admin.py
\`\`\`

**To list existing users:**
\`\`\`bash
cd backend
python3 scripts/create_admin.py
# Choose option 2
\`\`\`

**To change a user's password:**
\`\`\`bash
cd backend
python3 scripts/create_admin.py
# Choose option 3
\`\`\`

## Security Notes

- Passwords are hashed using SHA256
- Minimum password length is 6 characters
- Username and email must be unique
- Users can be deactivated instead of deleted for audit purposes

## Sample Data

The setup script creates sample data including:
- 5 faculties with multilingual names and descriptions
- Sample departments for the Science and Technology faculty
- Sample news articles
- Sample AI House projects
- Sample startup companies
- Default admin user (username: admin, password: admin123)

## Troubleshooting

**Database locked error:**
- Make sure the Flask server is not running
- Check if any other process is using the database

**Permission denied:**
- Make sure you have write permissions in the backend directory
- For bash scripts, run `chmod +x script_name.sh`

**Import errors:**
- Make sure you're running the scripts from the backend directory
- Check that all required Python modules are installed

## File Structure

\`\`\`
backend/scripts/
├── create_admin.py          # Admin user management
├── setup_database.py        # Database setup and management
├── run_admin_script.sh      # Bash wrapper for admin script
├── setup_db.sh             # Bash wrapper for database script
└── README.md               # This file
\`\`\`

## Environment Variables

The scripts use the same configuration as the main application:
- `DATABASE_URL`: Database connection string (defaults to SQLite)
- `SECRET_KEY`: JWT secret key for token generation

## Logging

All user management actions are logged in the `activity_logs` table for audit purposes.

#!/usr/bin/env python3
"""
Database setup script for University Portal
Usage: python setup_database.py
"""

import sys
import os
import hashlib

# Add the parent directory to the path to import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import init_db, get_db_connection

def create_sample_data():
    """Create sample data for testing"""
    conn = get_db_connection()
    
    # Sample faculties
    sample_faculties = [
        {
            'name': 'Faculty of Science and Technology',
            'name_ar': 'كلية العلوم والتكنولوجيا',
            'name_fr': 'Faculté des Sciences et de la Technologie',
            'description': 'Leading faculty in scientific research and technological innovation',
            'description_ar': 'كلية رائدة في البحث العلمي والابتكار التكنولوجي',
            'description_fr': 'Faculté leader dans la recherche scientifique et l\'innovation technologique',
            'dean_name': 'Dr. Ahmed Benali',
            'contact_email': 'science@univ-khenchela.dz',
            'contact_phone': '+213 32 XX XX 10',
            'students_count': 2500,
            'departments_count': 8
        },
        {
            'name': 'Faculty of Economics and Management',
            'name_ar': 'كلية العلوم الاقتصادية والتجارية وعلوم التسيير',
            'name_fr': 'Faculté des Sciences Économiques et de Gestion',
            'description': 'Excellence in economic sciences and business management',
            'description_ar': 'التميز في العلوم الاقتصادية وإدارة الأعمال',
            'description_fr': 'Excellence en sciences économiques et gestion d\'entreprise',
            'dean_name': 'Dr. Fatima Zohra',
            'contact_email': 'economics@univ-khenchela.dz',
            'contact_phone': '+213 32 XX XX 11',
            'students_count': 1800,
            'departments_count': 6
        },
        {
            'name': 'Faculty of Letters and Languages',
            'name_ar': 'كلية الآداب واللغات',
            'name_fr': 'Faculté des Lettres et des Langues',
            'description': 'Promoting linguistic diversity and cultural studies',
            'description_ar': 'تعزيز التنوع اللغوي والدراسات الثقافية',
            'description_fr': 'Promotion de la diversité linguistique et des études culturelles',
            'dean_name': 'Dr. Mohamed Salah',
            'contact_email': 'letters@univ-khenchela.dz',
            'contact_phone': '+213 32 XX XX 12',
            'students_count': 1200,
            'departments_count': 5
        },
        {
            'name': 'Faculty of Law and Political Sciences',
            'name_ar': 'كلية الحقوق والعلوم السياسية',
            'name_fr': 'Faculté de Droit et Sciences Politiques',
            'description': 'Training future legal professionals and political scientists',
            'description_ar': 'تكوين المهنيين القانونيين وعلماء السياسة المستقبليين',
            'description_fr': 'Formation des futurs professionnels du droit et politologues',
            'dean_name': 'Dr. Amina Khelifi',
            'contact_email': 'law@univ-khenchela.dz',
            'contact_phone': '+213 32 XX XX 13',
            'students_count': 1500,
            'departments_count': 4
        },
        {
            'name': 'Faculty of Medicine',
            'name_ar': 'كلية الطب',
            'name_fr': 'Faculté de Médecine',
            'description': 'Excellence in medical education and healthcare research',
            'description_ar': 'التميز في التعليم الطبي وبحوث الرعاية الصحية',
            'description_fr': 'Excellence en éducation médicale et recherche en santé',
            'dean_name': 'Dr. Karim Boudjemaa',
            'contact_email': 'medicine@univ-khenchela.dz',
            'contact_phone': '+213 32 XX XX 14',
            'students_count': 800,
            'departments_count': 6
        }
    ]
    
    # Clear existing faculties
    conn.execute('DELETE FROM faculties')
    
    # Insert sample faculties
    for faculty in sample_faculties:
        conn.execute('''
            INSERT INTO faculties (
                name, name_ar, name_fr, description, description_ar, description_fr,
                dean_name, contact_email, contact_phone, students_count, departments_count
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            faculty['name'], faculty['name_ar'], faculty['name_fr'],
            faculty['description'], faculty['description_ar'], faculty['description_fr'],
            faculty['dean_name'], faculty['contact_email'], faculty['contact_phone'],
            faculty['students_count'], faculty['departments_count']
        ))
    
    # Sample departments for Science and Technology faculty
    science_faculty_id = conn.execute('SELECT id FROM faculties WHERE name = ?', 
                                    ('Faculty of Science and Technology',)).fetchone()['id']
    
    sample_departments = [
        {
            'faculty_id': science_faculty_id,
            'name': 'Computer Science',
            'name_ar': 'علوم الحاسوب',
            'name_fr': 'Informatique',
            'description': 'Advanced computer science education and research',
            'head_name': 'Dr. Youcef Messaoud',
            'contact_email': 'cs@univ-khenchela.dz',
            'students_count': 400
        },
        {
            'faculty_id': science_faculty_id,
            'name': 'Mathematics',
            'name_ar': 'الرياضيات',
            'name_fr': 'Mathématiques',
            'description': 'Pure and applied mathematics',
            'head_name': 'Dr. Leila Benali',
            'contact_email': 'math@univ-khenchela.dz',
            'students_count': 300
        },
        {
            'faculty_id': science_faculty_id,
            'name': 'Physics',
            'name_ar': 'الفيزياء',
            'name_fr': 'Physique',
            'description': 'Theoretical and experimental physics',
            'head_name': 'Dr. Omar Cherif',
            'contact_email': 'physics@univ-khenchela.dz',
            'students_count': 250
        }
    ]
    
    for dept in sample_departments:
        conn.execute('''
            INSERT INTO departments (
                faculty_id, name, name_ar, name_fr, description,
                head_name, contact_email, students_count
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            dept['faculty_id'], dept['name'], dept['name_ar'], dept['name_fr'],
            dept['description'], dept['head_name'], dept['contact_email'], dept['students_count']
        ))
    
    # Sample news articles
    admin_user = conn.execute('SELECT id FROM users WHERE role = "super_admin" LIMIT 1').fetchone()
    if admin_user:
        sample_news = [
            {
                'title': 'University Launches New AI Research Center',
                'title_ar': 'الجامعة تطلق مركز جديد لبحوث الذكاء الاصطناعي',
                'title_fr': 'L\'université lance un nouveau centre de recherche en IA',
                'content': 'The University of Khenchela is proud to announce the launch of its new Artificial Intelligence Research Center...',
                'excerpt': 'New AI Research Center launched at University of Khenchela',
                'category': 'research',
                'author_id': admin_user['id'],
                'author_name': 'Admin'
            },
            {
                'title': 'International Conference on Sustainable Development',
                'title_ar': 'المؤتمر الدولي للتنمية المستدامة',
                'title_fr': 'Conférence internationale sur le développement durable',
                'content': 'The university will host an international conference on sustainable development next month...',
                'excerpt': 'International conference on sustainable development to be held',
                'category': 'events',
                'author_id': admin_user['id'],
                'author_name': 'Admin'
            }
        ]
        
        for news in sample_news:
            conn.execute('''
                INSERT INTO news (
                    title, title_ar, title_fr, content, excerpt, category,
                    author_id, author_name, is_published, is_featured
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 0)
            ''', (
                news['title'], news['title_ar'], news['title_fr'],
                news['content'], news['excerpt'], news['category'],
                news['author_id'], news['author_name']
            ))
    
    # Sample AI House projects
    sample_ai_projects = [
        {
            'title': 'Smart Campus Management System',
            'title_ar': 'نظام إدارة الحرم الجامعي الذكي',
            'description': 'AI-powered system for managing campus resources and student services',
            'technologies': 'Python,TensorFlow,React,Node.js',
            'team_size': 5,
            'status': 'active'
        },
        {
            'title': 'Automated Grading System',
            'title_ar': 'نظام التصحيح الآلي',
            'description': 'Machine learning system for automated essay grading and feedback',
            'technologies': 'Python,NLP,Flask,PostgreSQL',
            'team_size': 3,
            'status': 'active'
        }
    ]
    
    for project in sample_ai_projects:
        conn.execute('''
            INSERT INTO ai_projects (
                title, title_ar, description, technologies, team_size, status
            ) VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            project['title'], project['title_ar'], project['description'],
            project['technologies'], project['team_size'], project['status']
        ))
    
    # Sample startups
    sample_startups = [
        {
            'name': 'EduTech Solutions',
            'description': 'Educational technology platform for online learning',
            'industry': 'Education Technology',
            'stage': 'seed',
            'team_size': 4,
            'founder_name': 'Sarah Benali',
            'founder_email': 'sarah@edutech.dz'
        },
        {
            'name': 'GreenEnergy Innovations',
            'description': 'Renewable energy solutions for rural communities',
            'industry': 'Clean Energy',
            'stage': 'prototype',
            'team_size': 6,
            'founder_name': 'Ahmed Khelil',
            'founder_email': 'ahmed@greenenergy.dz'
        }
    ]
    
    for startup in sample_startups:
        conn.execute('''
            INSERT INTO startups (
                name, description, industry, stage, team_size, founder_name, founder_email
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            startup['name'], startup['description'], startup['industry'],
            startup['stage'], startup['team_size'], startup['founder_name'], startup['founder_email']
        ))
    
    conn.commit()
    conn.close()
    print("Sample data created successfully!")

def reset_database():
    """Reset the database and recreate all tables"""
    print("WARNING: This will delete all existing data!")
    confirm = input("Are you sure you want to reset the database? (yes/no): ").strip().lower()
    
    if confirm != 'yes':
        print("Operation cancelled")
        return
    
    # Delete the database file if it exists
    db_path = 'university.db'
    if os.path.exists(db_path):
        os.remove(db_path)
        print("Existing database deleted")
    
    # Recreate the database
    init_db()
    print("Database recreated successfully!")
    
    # Ask if user wants to create sample data
    create_sample = input("Do you want to create sample data? (yes/no): ").strip().lower()
    if create_sample == 'yes':
        create_sample_data()

def main():
    """Main function"""
    print("=" * 50)
    print("University Portal - Database Setup")
    print("=" * 50)
    print("1. Initialize database (create tables)")
    print("2. Create sample data")
    print("3. Reset database (WARNING: Deletes all data)")
    print("4. Exit")
    print("=" * 50)
    
    try:
        choice = int(input("Select an option (1-4): "))
        
        if choice == 1:
            init_db()
            print("Database initialized successfully!")
        elif choice == 2:
            create_sample_data()
        elif choice == 3:
            reset_database()
        elif choice == 4:
            print("Goodbye!")
        else:
            print("Error: Please enter a number between 1 and 4")
            
    except ValueError:
        print("Error: Please enter a valid number")
    except Exception as e:
        print(f"An error occurred: {str(e)}")

if __name__ == "__main__":
    main()

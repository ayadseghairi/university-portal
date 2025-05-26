# University of Khenchela - Official Website

A modern, secure, multilingual university website built with React.js frontend and Flask backend with comprehensive role-based access control.

## 🚀 Features

### Security & Authentication
- **JWT-based authentication** with httpOnly cookies
- **Role-based access control** with hierarchical permissions
- **CSRF protection** and CORS security
- **Rate limiting** on sensitive endpoints
- **Secure file upload** with type and size validation
- **Password hashing** with bcrypt
- **Activity logging** for audit trails

### Multi-College Support
- **Multiple colleges** management
- **Faculty and department** hierarchy
- **Granular permissions** per college/faculty/department
- **Admin delegation** at different levels

### Multilingual Support
- **Arabic (RTL)**, French, and English
- **Complete translation** system
- **RTL layout** support for Arabic
- **Language-specific content** management

### Content Management
- **News and events** management
- **File upload and sharing** system
- **Download center** with categorization
- **AI House** project showcase
- **Startup incubator** management

### User Experience
- **Responsive design** (mobile-first)
- **Progressive Web App** features
- **Fast loading** with code splitting
- **Accessibility** compliance
- **Search and filtering** capabilities

## 🛠️ Tech Stack

### Frontend
- **React 18** with hooks
- **Vite** for fast development
- **Tailwind CSS** for styling
- **React Router** for navigation
- **React i18next** for internationalization
- **Axios** for API communication
- **Lucide React** for icons

### Backend
- **Flask** with blueprints
- **Flask-JWT-Extended** for authentication
- **Flask-CORS** for security
- **Flask-Limiter** for rate limiting
- **SQLite** database (easily replaceable)
- **bcrypt** for password hashing
- **Pillow** for image processing

### Testing
- **Vitest** for frontend testing
- **pytest** for backend testing
- **Testing Library** for React components

## 📁 Project Structure

```
university-portal/
├── src/                          # Frontend source
│   ├── components/              # Reusable components
│   │   ├── layout/             # Layout components
│   │   ├── common/             # Common UI components
│   │   └── auth/               # Authentication components
│   ├── pages/                  # Page components
│   │   ├── admin/              # Admin dashboard pages
│   │   └── auth/               # Authentication pages
│   ├── contexts/               # React contexts
│   ├── api/                    # API client functions
│   ├── utils/                  # Utility functions
│   ├── i18n/                   # Internationalization
│   └── test/                   # Frontend tests
├── backend/                     # Flask backend
│   ├── app/                    # Application package
│   │   ├── routes/             # API routes
│   │   ├── utils/              # Utility functions
│   │   └── database.py         # Database operations
│   ├── scripts/                # Management scripts
│   ├── tests/                  # Backend tests
│   └── uploads/                # File uploads
└── docs/                       # Documentation
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **Python** (3.8 or higher)
- **npm** or **yarn**

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ayadseghairi/university-portal.git
   cd university-portal
   ```

2. **Install frontend dependencies:**
   ```
   npm install
   ```

3. **Set up backend:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

4. **Environment setup:**
   ```bash
   # Copy environment files
   cp .env.example .env
   cp backend/.env.example backend/.env
   
   # Edit the .env files with your configuration
   ```

5. **Initialize database:**
   ```bash
   cd backend
   python scripts/setup_database.py
   ```

6. **Create admin user:**
   ```bash
   python scripts/create_admin.py
   ```

### Development

**Start both frontend and backend:**
```bash
npm run dev
```

**Or start them separately:**
```bash
# Frontend (Terminal 1)
npm run dev:frontend

# Backend (Terminal 2)
npm run dev:backend
```

The application will be available at:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000

### Testing

**Run frontend tests:**
```bash
npm test
```

**Run backend tests:**
```bash
npm run test:backend
```

## 🔐 Security Features

### Authentication & Authorization
- JWT tokens stored in httpOnly cookies
- CSRF protection enabled
- Role-based permissions with hierarchy
- Session management with refresh tokens
- Rate limiting on auth endpoints

### File Upload Security
- File type validation (MIME type checking)
- File size limits
- Secure file storage outside web root
- Virus scanning capability (configurable)
- Access control per file

### Data Protection
- SQL injection prevention
- XSS protection
- Input validation and sanitization
- Secure headers configuration
- Activity logging for audit trails

## 👥 User Roles & Permissions

### Role Hierarchy
1. **Super Admin** - Full system access
2. **College Admin** - Manage entire college
3. **Faculty Admin** - Manage faculty and departments
4. **Department Admin** - Manage department content
5. **AI House Admin** - Manage AI House content
6. **Incubator Admin** - Manage startup incubator
7. **Editor** - Create and edit content
8. **Viewer** - Read-only access

### Permission System
- **Hierarchical permissions** (college → faculty → department)
- **Resource-specific permissions** (news, files, users)
- **Action-based permissions** (create, read, update, delete)
- **Granular access control** per resource

## 🌐 Internationalization

### Supported Languages
- **English** (en) - Default
- **French** (fr)
- **Arabic** (ar) - RTL support

### Translation Management
- JSON-based translation files
- Namespace organization
- Pluralization support
- Date and number formatting
- RTL layout for Arabic

## 📱 Responsive Design

### Breakpoints
- **Mobile:** 320px - 767px
- **Tablet:** 768px - 1023px
- **Desktop:** 1024px+

### Features
- Mobile-first approach
- Touch-friendly interfaces
- Optimized images
- Progressive enhancement

## 🔧 Configuration

### Environment Variables

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=University of Khenchela
VITE_UPLOAD_MAX_SIZE=5242880
```

**Backend (backend/.env):**
```env
FLASK_ENV=development
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret
DATABASE_URL=sqlite:///university.db
CORS_ORIGINS=http://localhost:3000
```

## 📊 Monitoring & Logging

### Activity Logging
- User authentication events
- Content creation/modification
- File uploads/downloads
- Permission changes
- System errors

### Performance Monitoring
- API response times
- Database query performance
- File upload metrics
- User activity patterns

## 🚀 Deployment

### Production Build
```bash
# Build frontend
npm run build

# Set production environment
export FLASK_ENV=production

# Run with production server
gunicorn -w 4 -b 0.0.0.0:5000 "app:create_app('production')"
```

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up -d
```

### Environment Setup
1. Set secure secret keys
2. Configure database connection
3. Set up file storage
4. Configure email settings
5. Enable HTTPS
6. Set up monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Ensure all tests pass
6. Submit a pull request

### Code Style
- **Frontend:** ESLint + Prettier
- **Backend:** Black + flake8
- **Commits:** Conventional commits

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- **Email:** seghiri.ayad@univ-khenchela.dz
- **Documentation:** [docs/](docs/)
- **Issues:** GitHub Issues

## 🙏 Acknowledgments

- University of Khenchela administration
- Open source community
- Contributors and maintainers

# 🎨 Creative Mark Business Management System (BMS)

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.1-blue?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-18.x-green?style=for-the-badge&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-7.x-green?style=for-the-badge&logo=mongodb)
![Socket.io](https://img.shields.io/badge/Socket.io-4.8-black?style=for-the-badge&logo=socket.io)

**Complete Business Management Solution with Multi-Role Dashboards**

[Features](#-features) • [Installation](#-installation) • [Documentation](#-documentation) • [Contributing](#-contributing)

</div>

---

## 📋 Table of Contents

- [About](#-about)
- [Architecture](#-architecture)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Installation](#-installation)
- [Environment Setup](#-environment-setup)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 About

Creative Mark BMS is a comprehensive business management system designed to streamline operations for businesses in Saudi Arabia. The system provides a complete solution for managing client applications, task assignments, employee coordination, partner collaboration, and financial operations through modern, role-based dashboards.

### Key Highlights
- 🚀 **Full-Stack Solution** - Modern Next.js frontend with Express.js backend
- 👥 **Multi-Role System** - Admin, Client, Employee, and Partner dashboards
- 💬 **Real-time Communication** - Socket.io powered messaging and notifications
- 🌐 **Multi-language Support** - English and Arabic with RTL layout
- 📱 **Fully Responsive** - Mobile-first design for all devices
- 🔐 **Secure Authentication** - JWT-based authentication with role-based access
- 📊 **Business Analytics** - Comprehensive reports and insights
- 💰 **Payment Management** - Invoice generation and payment tracking

---

## 🏗️ Architecture

```
Creative Mark BMS
├── 🎨 Frontend (Next.js 15)
│   ├── Admin Dashboard
│   ├── Client Portal
│   ├── Employee Workspace
│   └── Partner Interface
│
├── 🚀 Backend (Node.js/Express)
│   ├── RESTful API
│   ├── Real-time Socket.io
│   ├── Authentication & Authorization
│   └── File Management
│
└── 🗄️ Database (MongoDB)
    ├── User Management
    ├── Application Tracking
    ├── Task Management
    ├── Payment Records
    └── Communication Logs
```

### Project Structure
```
creativemark-bms/
├── creative-mark-backend/     # Express.js API server
├── creative-mark-bm/         # Next.js frontend application
├── README.md                 # This file
└── docs/                     # Documentation (optional)
```

---

## ✨ Features

### 🔐 Authentication & User Management
- User registration with email verification
- Secure JWT-based authentication
- Password reset functionality
- Role-based access control (RBAC)
- Multi-role support: Admin, Client, Employee, Partner

### 👨‍💼 Admin Dashboard
- **User Management**: Create, update, delete users across all roles
- **Application Workflow**: Review, approve, and manage client applications
- **Task Coordination**: Assign tasks to employees and track progress
- **Financial Oversight**: Monitor payments and generate reports
- **System Analytics**: Comprehensive business intelligence
- **Employee Management**: Oversee team performance and assignments

### 🙋 Client Portal
- **Application Submission**: Multi-step forms with draft saving
- **Status Tracking**: Real-time application progress monitoring
- **Document Management**: Secure file uploads and management
- **Payment Processing**: View invoices and payment history
- **Support System**: Create and track support tickets
- **Profile Management**: Update personal and business information

### 👨‍💻 Employee Workspace
- **Task Management**: View assigned tasks with priority levels
- **Application Processing**: Handle client applications through workflow
- **Client Communication**: Direct messaging and updates
- **Performance Tracking**: Daily reports and productivity metrics
- **Team Collaboration**: Coordinate with other employees
- **Resource Access**: Company documents and guidelines

### 🤝 Partner Interface
- **Task Assignments**: View and complete assigned work
- **Document Collaboration**: Upload and share business documents
- **Communication Hub**: Real-time messaging with team
- **Billing Access**: View invoices and payment schedules
- **Performance Reports**: Track work completion and metrics
- **Profile Management**: Update partner information

### 💬 Communication System
- Real-time messaging with Socket.io
- Group conversations and direct messaging
- File sharing capabilities
- Message history and search
- Typing indicators and read receipts
- Notification system for new messages

### 📋 Application Management
- Multi-step application forms with validation
- Draft auto-save functionality
- Document upload with preview and management
- Timeline tracking for application progress
- Status updates and notifications
- Comments and internal notes system

### ✅ Task Management
- Create and assign tasks with priorities
- Status tracking (Pending, In Progress, Completed)
- Deadline management and notifications
- Task filtering and search capabilities
- Progress reporting and analytics
- Task dependencies and workflows

### 💰 Financial Management
- Invoice generation and management
- Payment tracking and status updates
- Multiple payment method support
- Financial reporting and analytics
- Receipt generation and downloads
- Payment reminders and notifications

### 📊 Reports & Analytics
- Application statistics and trends
- Task completion metrics
- Payment and revenue reports
- User activity and performance analytics
- Custom date range filtering
- Export capabilities (PDF, Excel, CSV)

### 🌍 Internationalization
- English and Arabic language support
- RTL (Right-to-Left) layout for Arabic
- Localized date, number, and currency formats
- Language switcher component
- Translation management system

---

## 🛠️ Tech Stack

### Frontend (creative-mark-bm/)
- **Framework**: Next.js 15.5 with App Router
- **UI Library**: React 19.1
- **Styling**: TailwindCSS 4.x
- **Animations**: Framer Motion 12.23
- **Icons**: Lucide React, React Icons
- **Charts**: Chart.js with react-chartjs-2
- **Internationalization**: next-intl 4.3
- **Real-time**: Socket.io-client 4.8
- **HTTP Client**: Axios 1.12

### Backend (creative-mark-backend/)
- **Runtime**: Node.js 18.x
- **Framework**: Express.js 4.18
- **Database**: MongoDB 7.x with Mongoose 7.5
- **Authentication**: JWT (jsonwebtoken)
- **Real-time**: Socket.io 4.8
- **File Storage**: Cloudinary
- **Email**: Nodemailer with Resend
- **Validation**: express-validator
- **Security**: bcryptjs, CORS, Helmet

### Development & Testing
- **Testing**: Jest with React Testing Library
- **Linting**: ESLint
- **Build Tool**: Turbopack (Next.js)
- **Package Manager**: npm
- **Version Control**: Git

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (v7 or higher)
- npm or yarn package manager
- Git

### One-Command Setup
```bash
# Clone the repository
git clone https://github.com/yourusername/creativemark-bms.git
cd creativemark-bms

# Setup backend
cd creative-mark-backend
npm install
cp .env.example .env
# Edit .env with your configuration

# Setup frontend
cd ../creative-mark-bm
npm install
cp .env.example .env.local
# Edit .env.local with your configuration

# Start development servers
npm run dev
```

---

## 📦 Installation

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd creative-mark-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your MongoDB URI, JWT secret, etc.
   ```

4. **Start MongoDB**
   ```bash
   # Make sure MongoDB is running
   mongod
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```
   Backend will be available at `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd creative-mark-bm
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with API URLs
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```
   Frontend will be available at `http://localhost:3000`

---

## 🔧 Environment Setup

### Backend Environment Variables (.env)
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/creativemark-bms

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Frontend URL
CLIENT_URL=http://localhost:3000

# Cloudinary (for file uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password

# Resend API (alternative email service)
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

### Frontend Environment Variables (.env.local)
```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000

# Application URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Feature Flags
NEXT_PUBLIC_ENABLE_CHAT=true
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true

# Localization
NEXT_PUBLIC_DEFAULT_LOCALE=en
NEXT_PUBLIC_SUPPORTED_LOCALES=en,ar
```

---

## 🎮 Usage

### User Registration & Login
1. Visit the application at `http://localhost:3000`
2. Click "Register" and fill in your details
3. Check your email for verification link
4. Login with your credentials

### Role-Based Access
- **Admin**: Full system access at `/admin`
- **Client**: Application management at `/client`
- **Employee**: Task workspace at `/employee`
- **Partner**: Collaboration tools at `/partner`

### Common Workflows

#### Client Application Submission
1. Login as a client
2. Navigate to "New Application"
3. Fill out the multi-step form
4. Upload required documents
5. Submit for review
6. Track progress in dashboard

#### Admin Task Assignment
1. Login as admin
2. View pending applications
3. Create tasks for employees
4. Assign priorities and deadlines
5. Monitor progress and completion

#### Employee Task Management
1. Login as employee
2. View assigned tasks
3. Update task status
4. Communicate with clients
5. Submit daily reports

---

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication
All protected endpoints require JWT token:
```
Authorization: Bearer <your_jwt_token>
```

### Key Endpoints

| Category | Endpoint | Description |
|----------|----------|-------------|
| **Auth** | `POST /auth/register` | User registration |
| **Auth** | `POST /auth/login` | User authentication |
| **Applications** | `GET /applications` | List applications |
| **Applications** | `POST /applications` | Create application |
| **Tasks** | `GET /tasks` | List tasks |
| **Tasks** | `POST /tasks` | Create task |
| **Payments** | `GET /payments` | List payments |
| **Messages** | `GET /messages` | Get messages |
| **Reports** | `GET /reports/applications` | Application reports |

For complete API documentation, see [Backend README](./creative-mark-backend/README.md)

---

## 🧪 Testing

### Backend Testing
```bash
cd creative-mark-backend
npm test                    # Run all tests
npm run test:watch         # Watch mode
npm run test:coverage      # With coverage
```

### Frontend Testing
```bash
cd creative-mark-bm
npm test                   # Run all tests
npm run test:watch        # Watch mode
npm run test:coverage     # With coverage
```

### Test Coverage Goals
- Backend: 80%+ coverage
- Frontend: 75%+ coverage
- Integration tests for critical workflows

---

## 🚢 Deployment

### Recommended Deployment Stack
- **Frontend**: Vercel or Netlify
- **Backend**: Railway, Render, or Heroku
- **Database**: MongoDB Atlas
- **File Storage**: Cloudinary

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Configure production MongoDB URI
- [ ] Set secure JWT secrets
- [ ] Enable HTTPS
- [ ] Configure domain settings
- [ ] Set up monitoring and logging
- [ ] Configure backup strategies

### Environment Variables for Production
Ensure all environment variables are set in your hosting platform with production values.

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Development Workflow
1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Write tests** for new features
5. **Run the test suite**
   ```bash
   # Backend tests
   cd creative-mark-backend && npm test

   # Frontend tests
   cd creative-mark-bm && npm test
   ```
6. **Commit with conventional format**
   ```bash
   git commit -m "feat: add new feature"
   ```
7. **Push and create Pull Request**

### Code Standards
- Follow existing code style and patterns
- Use meaningful variable and function names
- Add JSDoc comments for complex functions
- Keep components small and focused
- Write comprehensive tests

### Commit Message Convention
- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Test additions
- `chore:` - Maintenance tasks

---

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Authors

- **Creative Mark Team** - [GitHub](https://github.com/ImaadDev)

---

## 🙏 Acknowledgments

- **Next.js Team** - For the amazing React framework
- **Express.js Community** - For the robust backend framework
- **MongoDB Team** - For the powerful database solution
- **Socket.io Team** - For real-time communication
- **Open Source Community** - For the countless libraries and tools

---

## 📞 Support

- **Email**: kimad1728@gmail.com



---

## 🔄 Changelog

### Version 1.0.0 (2025-01-15)
- Initial release of Creative Mark BMS
- Multi-role dashboard system
- Complete application management workflow
- Task assignment and tracking
- Real-time messaging system
- Payment processing and invoicing
- Comprehensive reporting and analytics
- Multi-language support (English/Arabic)
- Responsive design for all devices
- Full test coverage and documentation

---

<div align="center">

**[⬆ back to top](#-creative-mark-business-management-system-bms)**

Built with ❤️ by Imad Hussain Khan

*Creating the future of business management*

</div>
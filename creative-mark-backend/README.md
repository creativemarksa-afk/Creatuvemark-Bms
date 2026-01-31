# 🚀 Creative Mark BMS - Backend API

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-18.x-green?style=for-the-badge&logo=node.js)
![Express](https://img.shields.io/badge/Express-4.18-blue?style=for-the-badge&logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-7.x-green?style=for-the-badge&logo=mongodb)
![JWT](https://img.shields.io/badge/JWT-Auth-orange?style=for-the-badge&logo=jsonwebtokens)
![Socket.io](https://img.shields.io/badge/Socket.io-4.8-black?style=for-the-badge&logo=socket.io)

**Backend API for Creative Mark Business Management System**

[Features](#-features) • [Installation](#-installation) • [API Documentation](#-api-documentation) • [Testing](#-testing)

</div>

---

## 📋 Table of Contents

- [About](#-about)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Contributing](#-contributing)

---

## 🎯 About

Creative Mark BMS Backend is a comprehensive RESTful API built with Node.js and Express.js, designed to manage business operations including client management, task tracking, employee coordination, partner collaboration, and financial transactions.

### Key Capabilities
- 🔐 **Authentication & Authorization** - JWT-based secure authentication with role-based access control
- 👥 **Multi-Role System** - Support for Admin, Client, Employee, and Partner roles
- 📊 **Application Management** - Track and manage client applications through various stages
- 💼 **Task Management** - Assign and monitor tasks across teams
- 💬 **Real-time Communication** - Socket.io powered messaging and notifications
- 💰 **Payment Processing** - Handle payments and financial transactions
- 🎫 **Support Tickets** - Integrated ticketing system for customer support
- 📈 **Reports & Analytics** - Generate comprehensive business reports
- 📁 **File Management** - Cloudinary integration for document uploads

---

## ✨ Features

### Authentication & User Management
- User registration with email verification
- Secure login/logout with JWT tokens
- Password reset functionality
- Role-based access control (RBAC)
- Multi-role support (Admin, Client, Employee, Partner)

### Application Management
- Create and submit applications
- Track application status through workflow stages
- Document upload and management
- Timeline tracking for each application
- Draft saving functionality

### Task Management
- Create and assign tasks to employees
- Task status tracking (pending, in-progress, completed)
- Priority management
- Task deadline monitoring
- Task comments and updates

### Communication System
- Real-time messaging with Socket.io
- Message notifications
- Group messaging support
- Message history and archiving
- Read receipts

### Support Tickets
- Create and manage support tickets
- Ticket replies and threading
- Status tracking (open, in-progress, resolved, closed)
- Priority levels
- Employee assignment

### Payment Management
- Record payment transactions
- Payment status tracking
- Payment history
- Invoice generation
- Multiple payment methods

### Reports & Analytics
- Application statistics
- Task completion reports
- Payment reports
- User activity tracking
- Custom date range filtering

### Notifications
- Real-time push notifications
- Email notifications
- Notification preferences
- Mark as read/unread
- Notification history

---

## 🛠️ Tech Stack

### Core
- **Node.js** (v18+) - JavaScript runtime
- **Express.js** (v4.18) - Web application framework
- **MongoDB** (v7.x) - NoSQL database
- **Mongoose** (v7.5) - MongoDB ODM

### Authentication & Security
- **JWT** (jsonwebtoken) - Token-based authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
- **cookie-parser** - Cookie handling
- **CORS** - Cross-origin resource sharing

### Real-time & Communication
- **Socket.io** (v4.8) - WebSocket for real-time features
- **Nodemailer** (v7.0) - Email sending
- **Resend** (v6.1) - Email service integration

### File Management
- **Cloudinary** (v1.40) - Cloud storage for files
- **Multer** (v1.4) - File upload handling
- **multer-storage-cloudinary** - Cloudinary storage engine

### Development Tools
- **Nodemon** (v3.0) - Development server with auto-restart
- **Jest** (v30.2) - Testing framework
- **Supertest** - HTTP testing
- **dotenv** (v16.3) - Environment variable management

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (v7 or higher)
- npm or yarn package manager
- Cloudinary account (for file uploads)
- SMTP credentials (for email sending)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/creativemark-bms.git
   cd creativemark-bms/creative-mark-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Create .env file in the root directory
   cp .env.example .env
   ```
   Then edit `.env` with your configuration (see [Environment Variables](#-environment-variables))

4. **Start MongoDB**
   ```bash
   # Make sure MongoDB is running
   mongod
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

   The server will start on `http://localhost:5000`

### Available Scripts

```bash
# Start production server
npm start

# Start development server with auto-reload
npm run dev

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

---

## 🔐 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/creativemark-bms
# For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/creativemark-bms

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:3000

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email Configuration (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password

# Resend API (Alternative Email Service)
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=noreply@yourdomain.com

# Application URLs
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000

# File Upload Limits
MAX_FILE_SIZE=10485760  # 10MB in bytes
```

### Getting API Keys

**Cloudinary:**
1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Get your credentials from Dashboard

**Resend:**
1. Sign up at [resend.com](https://resend.com)
2. Create an API key from Settings

**Gmail SMTP:**
1. Enable 2-factor authentication
2. Generate an App Password from Google Account settings

---

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication

All authenticated endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### API Endpoints

#### 🔐 Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register new user | No |
| POST | `/login` | User login | No |
| POST | `/logout` | User logout | Yes |
| GET | `/verify-email/:token` | Verify email address | No |
| POST | `/forgot-password` | Request password reset | No |
| POST | `/reset-password/:token` | Reset password | No |
| GET | `/me` | Get current user | Yes |

#### 👤 Clients (`/api/clients`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all clients | Yes (Admin) |
| GET | `/:id` | Get client by ID | Yes |
| PUT | `/:id` | Update client | Yes |
| DELETE | `/:id` | Delete client | Yes (Admin) |

#### 📋 Applications (`/api/applications`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all applications | Yes |
| POST | `/` | Create application | Yes (Client) |
| GET | `/:id` | Get application by ID | Yes |
| PUT | `/:id` | Update application | Yes |
| DELETE | `/:id` | Delete application | Yes |
| POST | `/:id/submit` | Submit application | Yes (Client) |
| GET | `/drafts` | Get draft applications | Yes (Client) |

#### 👨‍💼 Employees (`/api/employees`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all employees | Yes (Admin) |
| POST | `/` | Create employee | Yes (Admin) |
| GET | `/:id` | Get employee by ID | Yes |
| PUT | `/:id` | Update employee | Yes |
| DELETE | `/:id` | Delete employee | Yes (Admin) |

#### 🤝 Partners (`/api/partners`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all partners | Yes |
| POST | `/` | Create partner | Yes (Admin) |
| GET | `/:id` | Get partner by ID | Yes |
| PUT | `/:id` | Update partner | Yes |
| DELETE | `/:id` | Delete partner | Yes (Admin) |

#### ✅ Tasks (`/api/tasks`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all tasks | Yes |
| POST | `/` | Create task | Yes (Admin) |
| GET | `/:id` | Get task by ID | Yes |
| PUT | `/:id` | Update task | Yes |
| DELETE | `/:id` | Delete task | Yes (Admin) |
| GET | `/my-tasks` | Get assigned tasks | Yes (Employee) |
| PUT | `/:id/status` | Update task status | Yes |

#### 💰 Payments (`/api/payments`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all payments | Yes |
| POST | `/` | Create payment | Yes |
| GET | `/:id` | Get payment by ID | Yes |
| PUT | `/:id` | Update payment | Yes |
| DELETE | `/:id` | Delete payment | Yes (Admin) |

#### 🎫 Tickets (`/api/tickets`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all tickets | Yes |
| POST | `/` | Create ticket | Yes |
| GET | `/:id` | Get ticket by ID | Yes |
| PUT | `/:id` | Update ticket | Yes |
| POST | `/:id/reply` | Reply to ticket | Yes |
| PUT | `/:id/status` | Update ticket status | Yes |

#### 💬 Messages (`/api/messages`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all messages | Yes |
| POST | `/` | Send message | Yes |
| GET | `/conversation/:userId` | Get conversation | Yes |
| PUT | `/:id/read` | Mark as read | Yes |

#### 🔔 Notifications (`/api/notifications`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all notifications | Yes |
| PUT | `/:id/read` | Mark as read | Yes |
| PUT | `/read-all` | Mark all as read | Yes |
| DELETE | `/:id` | Delete notification | Yes |

#### 📊 Reports (`/api/reports`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/applications` | Application reports | Yes (Admin) |
| GET | `/tasks` | Task reports | Yes (Admin) |
| GET | `/payments` | Payment reports | Yes (Admin) |
| GET | `/users` | User statistics | Yes (Admin) |

#### 📊 Status (`/api/status`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/health` | API health check | No |
| GET | `/` | Server status | No |

### Example Requests

**Register User:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123!",
    "phone": "0501234567",
    "nationality": "Saudi",
    "residencyStatus": "saudi"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

**Get Applications (Authenticated):**
```bash
curl -X GET http://localhost:5000/api/applications \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 📁 Project Structure

```
creative-mark-backend/
├── config/                      # Configuration files
│   ├── cloudinary.js           # Cloudinary setup
│   ├── db.js                   # MongoDB connection
│   └── upload.js               # File upload configuration
│
├── controllers/                # Request handlers
│   ├── applicationController.js
│   ├── authController.js
│   ├── clientController.js
│   ├── employeeController.js
│   ├── messageController.js
│   ├── notificationController.js
│   ├── partnerController.js
│   ├── passwordController.js
│   ├── paymentController.js
│   ├── reportsController.js
│   ├── statusController.js
│   ├── taskController.js
│   └── ticketController.js
│
├── middlewares/                # Custom middleware
│   ├── authMiddleware.js       # JWT authentication
│   ├── checkRoles.js           # Role-based authorization
│   └── errorMiddleware.js      # Error handling
│
├── models/                     # Mongoose schemas
│   ├── Application.js
│   ├── Document.js
│   ├── Message.js
│   ├── Notification.js
│   ├── Partner.js
│   ├── Payment.js
│   ├── Task.js
│   ├── Ticket.js
│   ├── TicketReply.js
│   ├── Timeline.js
│   └── User.js
│
├── routes/                     # API routes
│   ├── appliactionRoutes.js
│   ├── authRoutes.js
│   ├── clientRoutes.js
│   ├── employeeRoutes.js
│   ├── messageRoutes.js
│   ├── notificationRoutes.js
│   ├── partnerRoutes.js
│   ├── paymentRoutes.js
│   ├── reportsRoutes.js
│   ├── statusRoutes.js
│   ├── taskRoutes.js
│   └── ticketRoutes.js
│
├── utils/                      # Utility functions
│   ├── mailer.js              # Email utilities
│   ├── sendEmail.js           # Email sending
│   └── socketHandler.js       # Socket.io handlers
│
├── __tests__/                  # Test files
│   ├── auth.test.js
│   ├── models.test.js
│   └── utils.test.js
│
├── uploads/                    # Temporary upload directory
├── .env                        # Environment variables (not in git)
├── .gitignore                 # Git ignore rules
├── jest.config.js             # Jest configuration
├── package.json               # Dependencies and scripts
├── README.md                  # This file
├── server.js                  # Application entry point
└── vercel.json                # Vercel deployment config
```

---

## 🧪 Testing

This project uses **Jest** and **Supertest** for testing.

### Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Structure

```
__tests__/
├── auth.test.js        # Authentication tests
├── models.test.js      # Model validation tests
└── utils.test.js       # Utility function tests
```

### Writing Tests

Example test:
```javascript
import request from 'supertest';
import app from '../server.js';

describe('POST /api/auth/register', () => {
  it('should register a new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'Test@1234',
      })
      .expect(201);

    expect(response.body.success).toBe(true);
  });
});
```

For more details, see [TESTING_GUIDE.md](../TESTING_GUIDE.md)

---

## 🚢 Deployment

### Vercel Deployment

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Set Environment Variables**
   - Go to Vercel Dashboard
   - Navigate to Settings > Environment Variables
   - Add all variables from `.env`

### Heroku Deployment

1. **Create Heroku App**
   ```bash
   heroku create your-app-name
   ```

2. **Set Environment Variables**
   ```bash
   heroku config:set MONGO_URI=your_mongodb_uri
   heroku config:set JWT_SECRET=your_jwt_secret
   # ... add all other env variables
   ```

3. **Deploy**
   ```bash
   git push heroku main
   ```

### Railway Deployment

1. **Connect Repository**
   - Go to [railway.app](https://railway.app)
   - Create new project from GitHub repo

2. **Add MongoDB Plugin**
   - Add MongoDB database to project
   - Railway will provide MONGO_URI

3. **Configure Environment Variables**
   - Add all required environment variables

### Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
```

```bash
# Build and run
docker build -t creativemark-backend .
docker run -p 5000:5000 --env-file .env creativemark-backend
```

---

## 🔒 Security

### Best Practices Implemented

- ✅ JWT token-based authentication
- ✅ Password hashing with bcryptjs
- ✅ Input validation and sanitization
- ✅ CORS configuration
- ✅ HTTP-only cookies for tokens
- ✅ Environment variable protection
- ✅ MongoDB injection prevention
- ✅ Rate limiting (recommended to add)
- ✅ Helmet.js security headers (recommended to add)

### Security Checklist

- [ ] Change JWT_SECRET in production
- [ ] Use HTTPS in production
- [ ] Enable rate limiting
- [ ] Add helmet.js for security headers
- [ ] Implement API rate limiting
- [ ] Regular security audits with `npm audit`
- [ ] Keep dependencies updated
- [ ] Use secure MongoDB connection (Atlas)
- [ ] Implement proper logging
- [ ] Set up monitoring and alerts

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Write/update tests**
5. **Run tests**
   ```bash
   npm test
   ```
6. **Commit your changes**
   ```bash
   git commit -m "Add: your feature description"
   ```
7. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```
8. **Create a Pull Request**

### Commit Message Convention

- `Add:` - New features
- `Fix:` - Bug fixes
- `Update:` - Updates to existing features
- `Refactor:` - Code refactoring
- `Docs:` - Documentation changes
- `Test:` - Test additions or updates

---

## 📝 License

This project is licensed under the ISC License.

---

## 👥 Authors

- **Creative Mark Team** - [GitHub Profile](https://github.com/yourusername)

---

## 🙏 Acknowledgments

- Express.js community
- MongoDB team
- Socket.io developers
- All open-source contributors

---

## 📞 Support

For support, email support@creativemark.com or join our Slack channel.

---

## 🔄 Changelog

### Version 1.0.0 (2025-01-15)
- Initial release
- User authentication system
- Application management
- Task tracking
- Real-time messaging
- Support ticket system
- Payment processing
- Comprehensive API documentation

---

<div align="center">

**[⬆ back to top](#-creative-mark-bms---backend-api)**

Made with ❤️ by Creative Mark Team

</div>


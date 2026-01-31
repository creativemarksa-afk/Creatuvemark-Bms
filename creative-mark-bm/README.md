# 🎨 Creative Mark BMS - Frontend

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.1-blue?style=for-the-badge&logo=react)
![TailwindCSS](https://img.shields.io/badge/Tailwind-4.x-38bdf8?style=for-the-badge&logo=tailwind-css)
![TypeScript](https://img.shields.io/badge/Jest-30.2-C21325?style=for-the-badge&logo=jest)

**Modern, Responsive Business Management System**

[Features](#-features) • [Installation](#-installation) • [Usage](#-usage) • [Testing](#-testing)

</div>

---

## 📋 Table of Contents

- [About](#-about)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Project Structure](#-project-structure)
- [User Roles](#-user-roles)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Contributing](#-contributing)

---

## 🎯 About

Creative Mark BMS Frontend is a modern, responsive web application built with Next.js 15 and React 19. It provides a comprehensive business management interface for clients, employees, partners, and administrators to manage applications, tasks, communications, and business operations.

### Highlights
- 🚀 **Next.js 15** with App Router and Server Components
- ⚡ **Turbopack** for lightning-fast development
- 🎨 **TailwindCSS 4** for modern, utility-first styling
- 🌐 **Multi-language Support** with next-intl (English & Arabic)
- 🔐 **Secure Authentication** with JWT tokens
- 📱 **Fully Responsive** design for all devices
- 💬 **Real-time Features** with Socket.io
- ♿ **Accessible** components following WCAG guidelines
- 🎭 **Beautiful Animations** with Framer Motion
- 📊 **Interactive Charts** with Chart.js

---

## ✨ Features

### 🔐 Authentication System
- User registration with email verification
- Secure login/logout
- Password reset functionality
- Protected routes with role-based access
- Persistent authentication with cookies
- Social login (optional integration)

### 👤 Multi-Role Dashboards

#### 👨‍💼 Admin Dashboard
- User management (create, update, delete users)
- Application review and approval workflow
- Task assignment and monitoring
- Employee management
- Client management
- Payment tracking
- System reports and analytics
- Settings and configuration

#### 🙋 Client Dashboard
- Submit new applications
- Track application status
- Save drafts
- View application timeline
- Document upload
- Payment history
- Support ticket system
- Profile management

#### 👨‍💻 Employee Dashboard
- View assigned tasks
- Update task status
- Application processing
- Client communication
- Task reports
- Notifications
- Team collaboration

#### 🤝 Partner Dashboard
- View assigned tasks
- Upload documents
- Communication hub
- Billing and payments
- Reports access
- Profile management

### 📋 Application Management
- Multi-step application form
- Draft auto-save functionality
- Document upload with preview
- Real-time validation
- Status tracking
- Timeline visualization
- Comments and notes

### ✅ Task Management
- Create and assign tasks
- Priority levels (Low, Medium, High, Urgent)
- Status tracking (Pending, In Progress, Completed)
- Deadline management
- Task filtering and search
- Task comments and updates

### 💬 Communication
- Real-time messaging
- Message notifications
- Conversation history
- File sharing in messages
- Typing indicators
- Read receipts
- Group messaging

### 🎫 Support System
- Create support tickets
- Priority levels
- Category selection
- Ticket status tracking
- Reply and threading
- File attachments
- Ticket history

### 💰 Payment Management
- View payment history
- Payment receipts
- Multiple payment methods
- Payment status tracking
- Invoice download

### 📊 Reports & Analytics
- Application statistics
- Task completion rates
- Payment reports
- User activity tracking
- Export to PDF/Excel
- Custom date ranges
- Visual charts and graphs

### 🔔 Notifications
- Real-time push notifications
- In-app notification center
- Email notifications
- Notification preferences
- Mark as read/unread
- Notification grouping

### 🌍 Internationalization
- English and Arabic support
- RTL (Right-to-Left) layout for Arabic
- Language switcher
- Localized date and number formats
- Translation management

### 🎨 UI/UX Features
- Modern, clean design
- Responsive layout (Mobile, Tablet, Desktop)
- Dark mode support
- Loading states
- Empty states
- Error boundaries
- Toast notifications
- Modal dialogs
- Dropdown menus
- Form validation
- Smooth animations
- Skeleton loaders

---

## 🛠️ Tech Stack

### Core Framework
- **Next.js 15.5** - React framework with App Router
- **React 19.1** - UI library
- **Turbopack** - Next-generation bundler

### Styling
- **TailwindCSS 4.x** - Utility-first CSS framework
- **@tailwindcss/postcss** - PostCSS integration
- **Framer Motion 12.23** - Animation library

### State Management & Data Fetching
- **React Context API** - Global state management
- **Axios 1.12** - HTTP client
- **Custom Hooks** - Reusable logic

### Real-time & Communication
- **Socket.io-client 4.8** - WebSocket client
- **Real-time notifications** - Live updates

### Internationalization
- **next-intl 4.3** - i18n for Next.js
- **Multi-language support** - English & Arabic

### UI Components & Utilities
- **Lucide React 0.544** - Icon library
- **React Icons 5.5** - Additional icons
- **Chart.js 4.5** - Chart library
- **React-chartjs-2 5.3** - Chart.js React wrapper
- **SweetAlert2 11.23** - Beautiful alerts

### Development & Testing
- **Jest 30.2** - Testing framework
- **@testing-library/react 16.3** - React testing utilities
- **@testing-library/jest-dom 6.9** - DOM matchers
- **@testing-library/user-event 14.6** - User event simulation
- **ESLint 9** - Code linting
- **eslint-config-next** - Next.js ESLint config

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager
- Backend API running (see [backend README](../creative-mark-backend/README.md))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/creativemark-bms.git
   cd creativemark-bms/creative-mark-bm
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Create .env.local file in the root directory
   cp .env.example .env.local
   ```
   Then edit `.env.local` with your configuration (see [Environment Variables](#-environment-variables))

4. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser

### Available Scripts

```bash
# Start development server with Turbopack
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

---

## 🔐 Environment Variables

Create a `.env.local` file in the root directory:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000

# Application URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000

# API Endpoints
NEXT_PUBLIC_AUTH_ENDPOINT=/api/auth
NEXT_PUBLIC_APPLICATIONS_ENDPOINT=/api/applications
NEXT_PUBLIC_TASKS_ENDPOINT=/api/tasks
NEXT_PUBLIC_MESSAGES_ENDPOINT=/api/messages
NEXT_PUBLIC_NOTIFICATIONS_ENDPOINT=/api/notifications
NEXT_PUBLIC_PAYMENTS_ENDPOINT=/api/payments
NEXT_PUBLIC_TICKETS_ENDPOINT=/api/tickets

# Features Flags (Optional)
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_CHAT=true
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true

# Analytics (Optional)
NEXT_PUBLIC_GA_ID=your_google_analytics_id

# Localization
NEXT_PUBLIC_DEFAULT_LOCALE=en
NEXT_PUBLIC_SUPPORTED_LOCALES=en,ar
```

### Production Environment Variables

For production deployment, set these in your hosting platform:

- **Vercel**: Settings > Environment Variables
- **Netlify**: Site settings > Build & deploy > Environment
- **Railway**: Project > Variables

---

## 📁 Project Structure

```
creative-mark-bm/
├── public/                          # Static assets
│   ├── CreativeMarkFavicon.png     # Favicon
│   └── locales/                    # Translation files
│       ├── ar/
│       │   └── common.json         # Arabic translations
│       └── en/
│           └── common.json         # English translations
│
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── admin/                  # Admin pages
│   │   │   ├── add-user/
│   │   │   ├── all-employees/
│   │   │   ├── clients/
│   │   │   ├── payments/
│   │   │   ├── profile/
│   │   │   ├── reports/
│   │   │   ├── requests/
│   │   │   ├── settings/
│   │   │   ├── tasks/
│   │   │   ├── tickets/
│   │   │   ├── layout.js
│   │   │   └── page.jsx
│   │   │
│   │   ├── client/                 # Client pages
│   │   │   ├── application/
│   │   │   ├── payments/
│   │   │   ├── profile/
│   │   │   ├── settings/
│   │   │   ├── support/
│   │   │   ├── track-application/
│   │   │   ├── layout.js
│   │   │   └── page.jsx
│   │   │
│   │   ├── employee/               # Employee pages
│   │   │   ├── additional-services/
│   │   │   ├── assign-tasks/
│   │   │   ├── my-tasks/
│   │   │   ├── notifications/
│   │   │   ├── payments/
│   │   │   ├── profile/
│   │   │   ├── reports/
│   │   │   ├── settings/
│   │   │   ├── tickets/
│   │   │   ├── layout.js
│   │   │   └── page.jsx
│   │   │
│   │   ├── partner/                # Partner pages
│   │   │   ├── assigned-tasks/
│   │   │   ├── billing/
│   │   │   ├── communication/
│   │   │   ├── notifications/
│   │   │   ├── profile/
│   │   │   ├── reports/
│   │   │   ├── settings/
│   │   │   ├── uploads/
│   │   │   ├── layout.js
│   │   │   └── page.jsx
│   │   │
│   │   ├── forgot-password/
│   │   ├── register/
│   │   ├── reset-password/
│   │   ├── verify-email/
│   │   ├── globals.css             # Global styles
│   │   ├── layout.js               # Root layout
│   │   ├── not-found.jsx           # 404 page
│   │   └── page.js                 # Home page
│   │
│   ├── components/                 # React components
│   │   ├── admin/                  # Admin components
│   │   │   ├── AssignmentModal.jsx
│   │   │   ├── RequestDetails.jsx
│   │   │   ├── RequestsList.jsx
│   │   │   └── requests/
│   │   │
│   │   ├── client/                 # Client components
│   │   │   ├── DraftsList.jsx
│   │   │   ├── InstructionModal.jsx
│   │   │   ├── RequestForm.jsx
│   │   │   ├── RequirementsModal.jsx
│   │   │   └── SubmittedRequestsList.jsx
│   │   │
│   │   ├── employee/               # Employee components
│   │   │   ├── AssignmentModal.jsx
│   │   │   ├── RequestDetails.jsx
│   │   │   └── RequestsList.jsx
│   │   │
│   │   ├── message/                # Message components
│   │   ├── ticket/                 # Ticket components
│   │   ├── request/                # Request components
│   │   ├── icons/                  # Icon components
│   │   ├── ClientOnly.jsx          # Client-only wrapper
│   │   ├── LanguageSwitcher.jsx    # Language toggle
│   │   ├── LoadingSpinner.jsx      # Loading component
│   │   ├── Navbar.jsx              # Navigation bar
│   │   ├── NotificationDropdown.jsx # Notifications
│   │   ├── Sidebar.jsx             # Sidebar navigation
│   │   └── Timeline.jsx            # Timeline component
│   │
│   ├── contexts/                   # React Context providers
│   │   ├── AuthContext.jsx         # Authentication state
│   │   ├── MessageNotificationContext.jsx
│   │   └── SocketContext.jsx       # Socket.io connection
│   │
│   ├── hooks/                      # Custom React hooks
│   │   ├── useAuthGuard.js         # Auth protection
│   │   ├── useClientOnly.js        # Client-side only
│   │   ├── useFetch.js             # Data fetching
│   │   └── useForm.js              # Form handling
│   │
│   ├── services/                   # API services
│   │   ├── api.js                  # API client
│   │   ├── applicationService.js
│   │   ├── auth.js                 # Auth service
│   │   ├── clientApi.js
│   │   ├── clientService.js
│   │   ├── employeeApi.js
│   │   ├── employeeDashboardService.js
│   │   ├── messageService.js
│   │   ├── notificationService.js
│   │   ├── paymentService.js
│   │   ├── reportsApi.js
│   │   ├── taskService.js
│   │   ├── ticketService.js
│   │   └── userService.js
│   │
│   ├── i18n/                       # Internationalization
│   │   ├── config.js               # i18n configuration
│   │   └── TranslationContext.jsx  # Translation context
│   │
│   ├── utils/                      # Utility functions
│   │   ├── constants.js            # App constants
│   │   ├── cookies.js              # Cookie helpers
│   │   └── helpers.js              # Helper functions
│   │
│   └── __tests__/                  # Test files
│       ├── LoadingSpinner.test.jsx
│       ├── api.test.js
│       └── utils.test.js
│
├── .env.local                      # Environment variables (not in git)
├── .gitignore                      # Git ignore rules
├── eslint.config.mjs              # ESLint configuration
├── jest.config.mjs                # Jest configuration
├── jest.setup.js                  # Jest setup file
├── jsconfig.json                  # JavaScript config
├── next.config.mjs                # Next.js configuration
├── package.json                   # Dependencies and scripts
├── postcss.config.mjs             # PostCSS configuration
├── README.md                      # This file
└── tailwind.config.js             # Tailwind configuration
```

---

## 👥 User Roles

### 🔑 Role-Based Access Control

The application supports four main user roles:

#### 1. **Admin** 👨‍💼
**Full system access and management**
- User management (CRUD)
- Application review and approval
- Task assignment and monitoring
- Employee and client management
- System configuration
- Reports and analytics
- Payment oversight

**Access:** `/admin/*`

#### 2. **Client** 🙋
**Application submission and tracking**
- Submit new applications
- Track application status
- View payment history
- Create support tickets
- Manage profile
- View notifications

**Access:** `/client/*`

#### 3. **Employee** 👨‍💻
**Task execution and client support**
- View assigned tasks
- Update task status
- Process applications
- Communicate with clients
- Generate reports
- Manage tickets

**Access:** `/employee/*`

#### 4. **Partner** 🤝
**Collaboration and service delivery**
- View assigned tasks
- Upload documents
- Communication
- Billing access
- View reports
- Profile management

**Access:** `/partner/*`

---

## 🧪 Testing

This project uses **Jest** and **React Testing Library** for testing.

### Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test LoadingSpinner.test.jsx
```

### Test Coverage

```
✅ 31 tests passing
   - 14 LoadingSpinner component tests
   - 12 Utility function tests
   - 5 API service tests
```

### Example Test

```javascript
import { render, screen } from '@testing-library/react';
import LoadingSpinner from '@/components/LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders with custom text', () => {
    render(<LoadingSpinner text="Please wait..." />);
    expect(screen.getByText('Please wait...')).toBeInTheDocument();
  });
});
```

For more details, see [TESTING_GUIDE.md](../TESTING_GUIDE.md)

---

## 🚢 Deployment

### Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your repository
   - Vercel will auto-detect Next.js

3. **Configure Environment Variables**
   - Add all variables from `.env.local`
   - Deploy!

**Live URL:** `https://your-app.vercel.app`

### Netlify

1. **Build Settings**
   - Build command: `npm run build`
   - Publish directory: `.next`

2. **Environment Variables**
   - Add all variables from `.env.local`

3. **Deploy**
   ```bash
   npm install -g netlify-cli
   netlify deploy --prod
   ```

### Docker

```dockerfile
# Dockerfile
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
```

```bash
# Build and run
docker build -t creativemark-frontend .
docker run -p 3000:3000 creativemark-frontend
```

### Self-Hosted

```bash
# Build for production
npm run build

# Start production server
npm start

# Or use PM2
pm2 start npm --name "creativemark-frontend" -- start
```

---

## 🎨 Customization

### Theme Colors

Edit `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdf4',
          // ... your colors
          900: '#14532d',
        },
      },
    },
  },
};
```

### Translations

Add translations in `public/locales/{lang}/common.json`:

```json
{
  "welcome": "Welcome",
  "dashboard": "Dashboard",
  "settings": "Settings"
}
```

Use in components:
```javascript
import { useTranslations } from 'next-intl';

export default function Page() {
  const t = useTranslations();
  return <h1>{t('welcome')}</h1>;
}
```

---

## 🔍 Performance

### Optimization Techniques

- ✅ Server Components for better performance
- ✅ Image optimization with `next/image`
- ✅ Code splitting and lazy loading
- ✅ Static site generation (SSG) where possible
- ✅ API route caching
- ✅ Turbopack for faster builds
- ✅ Bundle analysis

### Lighthouse Score Goals

- **Performance:** 90+
- **Accessibility:** 95+
- **Best Practices:** 95+
- **SEO:** 90+

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Write/update tests
5. Run tests (`npm test`)
6. Commit your changes (`git commit -m 'Add: amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### Code Style

- Follow the existing code style
- Use meaningful variable/function names
- Add comments for complex logic
- Write tests for new features
- Keep components small and focused

---

## 🐛 Known Issues

See [GitHub Issues](https://github.com/yourusername/creativemark-bms/issues) for current bugs and feature requests.

---

## 📝 License

This project is licensed under the ISC License.

---

## 👥 Authors

- **Creative Mark Team** - [GitHub Profile](https://github.com/yourusername)

---

## 🙏 Acknowledgments

- Next.js team for an amazing framework
- Vercel for hosting
- TailwindCSS for beautiful styling
- Open-source community

---

## 📞 Support

- **Email:** support@creativemark.com
- **Documentation:** [docs.creativemark.com](https://docs.creativemark.com)
- **Issues:** [GitHub Issues](https://github.com/yourusername/creativemark-bms/issues)

---

## 🔄 Changelog

### Version 1.0.0 (2025-01-15)
- Initial release
- Multi-role dashboard system
- Application management
- Task tracking
- Real-time messaging
- Support ticket system
- Payment tracking
- Multi-language support (EN/AR)
- Responsive design
- Comprehensive testing

---

<div align="center">

**[⬆ back to top](#-creative-mark-bms---frontend)**

Built with Next.js ❤️ by Creative Mark Team

</div>

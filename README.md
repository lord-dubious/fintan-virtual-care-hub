# Dr. Fintan's Virtual Care Hub

A **production-ready, full-stack virtual healthcare platform** built with React, TypeScript, Node.js, and PostgreSQL. This application provides a comprehensive solution for virtual medical consultations, appointment booking, patient management, and healthcare practice administration.

## 🎯 **Project Status: PRODUCTION READY**

This is a **complete, fully functional healthcare platform** with real backend integration, payment processing, video consultations, and database persistence. All mock implementations have been replaced with production-ready services.

## ✨ **Key Features**

### 🏥 **Healthcare Platform**
- **Real Video/Audio Consultations**: Daily.co integration with WebRTC
- **Appointment Booking & Management**: Full scheduling system with calendar sync
- **Patient Management**: Complete medical records and history tracking
- **Provider Dashboard**: Real-time analytics and practice management
- **Multi-Provider Payment Processing**: Stripe, Paystack, PayPal, Flutterwave
- **Email & SMS Notifications**: Automated appointment reminders and confirmations

### 🔐 **Authentication & Security**
- **JWT-based Authentication**: Secure login with refresh tokens
- **Role-based Access Control**: Admin, Provider, and Patient roles
- **Password Security**: Bcrypt hashing with secure password policies
- **Session Management**: Automatic token refresh and secure logout

### 💳 **Payment Processing**
- **Multiple Payment Providers**: Stripe, Paystack, PayPal, Flutterwave
- **Secure Card Processing**: PCI-compliant payment handling
- **Payment Verification**: Real-time payment confirmation and receipts
- **Refund Management**: Automated refund processing for cancellations

### 📅 **Calendar Integration**
- **External Calendar Sync**: Google Calendar, Outlook, Apple Calendar
- **Availability Management**: Provider schedule and time slot management
- **ICS File Generation**: Calendar export for appointments
- **Conflict Detection**: Automatic scheduling conflict prevention

### 🎨 **User Experience**
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Dark/Light Mode**: Automatic theme switching with user preference
- **Real-time Updates**: Live dashboard statistics and notifications
- **Loading States**: Comprehensive loading and error handling
- **Accessibility**: WCAG compliant with keyboard navigation support

## 🛠 **Technology Stack**

### **Frontend**
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Shadcn/UI** for component library
- **React Query** for server state management
- **React Router** for navigation

### **Backend**
- **Node.js** with Express.js
- **PostgreSQL** (Neon Serverless)
- **Prisma ORM** for database management
- **JWT Authentication** with refresh tokens
- **Bcrypt** for password hashing
- **Express Rate Limiting** for security

### **External Services**
- **Daily.co** for video/audio calls
- **Stripe, Paystack, PayPal, Flutterwave** for payments
- **Nodemailer** for email notifications
- **Twilio** for SMS notifications
- **Google/Outlook Calendar** integration

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18+ and npm 8+
- PostgreSQL database (Neon recommended)
- Daily.co account for video/audio calls
- Payment provider accounts (Stripe, Paystack, etc.)

### **Installation**

1. **Clone and Install**
   ```bash
   git clone https://github.com/lord-dubious/fintan-virtual-care-hub.git
   cd fintan-virtual-care-hub

   # Install all dependencies (frontend + backend)
   npm run full:install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Database Setup**
   ```bash
   npm run prisma:generate
   npm run prisma:deploy
   ```

4. **Start Development**
   ```bash
   # Start both frontend and backend
   npm run full:dev
   ```

   This starts:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001
   - Health Check: http://localhost:3001/health

### **Production Deployment**
See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for complete deployment instructions.

## Demo Accounts

For testing purposes, the following demo accounts are available:

### Patient Accounts

| Email | Password | Description |
|-------|----------|-------------|
| patient@example.com | Password123! | Regular patient account |
| patient2@example.com | Password123! | Patient with existing appointments |

### Provider Accounts

| Email | Password | Description |
|-------|----------|-------------|
| doctor@example.com | Password123! | General practitioner |
| specialist@example.com | Password123! | Specialist with limited availability |

### Admin Account

| Email | Password |
|-------|----------|
| admin@example.com | AdminPass123! |

## Project Structure

```
fintan-virtual-care-hub/
├── docs/                    # Documentation
├── prisma/                  # Prisma schema and migrations
├── public/                  # Static assets
├── scripts/                 # Utility scripts
├── src/
│   ├── components/          # React components
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utility functions and services
│   │   ├── auth/            # Authentication logic
│   │   ├── services/        # Service layer
│   │   └── utils/           # Helper utilities
│   ├── pages/               # Application pages
│   └── styles/              # CSS and styling
└── tests/                   # Test files
```

## Key Features

- **Secure Audio/Video Consultations**: Powered by Daily.co SDK
- **Appointment Management**: Schedule, reschedule, and cancel appointments
- **Provider Availability**: Manage provider schedules and availability
- **Patient Records**: Secure storage and access to patient medical records
- **Real-time Notifications**: Appointment reminders and system notifications
- **Payment Processing**: Secure payment handling for consultations

## Documentation

For more detailed documentation, please refer to:

- [Site Map](./docs/site-map.md) - Overview of the application structure
- [Services Documentation](./docs/services-documentation.md) - Detailed API documentation
- [Neon-Prisma Setup](./docs/neon-prisma-setup.md) - Database setup guide
- [Database Schema](./docs/database-schema.md) - Database structure and relationships
- [API Endpoints](./docs/api-endpoints.md) - Detailed API endpoint documentation

## Development

### Database Migrations

To apply database migrations:

```sh
node scripts/apply-migrations.js
```

### Running Tests

```sh
npm test
# or
yarn test
```

## Deployment

The application is configured for deployment on Vercel. Simply connect your GitHub repository to Vercel and deploy.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Contribution Guidelines

#### Code Style

- Follow the existing code style and formatting
- Use TypeScript for all new code
- Add appropriate JSDoc comments for functions and classes
- Use meaningful variable and function names
- Keep functions small and focused on a single responsibility

#### Testing

- Write unit tests for all new functionality
- Ensure all tests pass before submitting a PR
- Aim for good test coverage of critical paths
- Include both positive and negative test cases

#### Documentation

- Update documentation for any changed functionality
- Document new features, APIs, or configuration options
- Keep the README and other documentation files up to date
- Add comments for complex logic or non-obvious code

#### Pull Request Process

1. Ensure your code follows the style guidelines
2. Update the README.md with details of changes if applicable
3. The PR should work in development and pass all tests
4. PRs require review from at least one maintainer
5. Squash commits before merging if requested

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Troubleshooting

### Database Connection Issues

- **Connection Refused**: Ensure your Neon PostgreSQL instance is running and accessible
- **Authentication Failed**: Verify your database credentials in the `.env` file
- **Migration Errors**: Make sure both `DATABASE_URL` and `DIRECT_URL` are correctly configured
- **Prisma Client Generation**: If you encounter errors with the Prisma client, try running `npx prisma generate` manually

### Daily.co Integration

- **API Key Invalid**: Verify your Daily.co API key in the `.env` file
- **Room Creation Failed**: Check your Daily.co account limits and permissions
- **Video/Audio Not Working**: Ensure browser permissions for camera and microphone are granted
- **Token Generation Errors**: Verify that your Daily.co API key has the necessary permissions

### Development Environment

- **Node.js Version**: This project requires Node.js v18 or higher
- **Package Installation Errors**: Try deleting `node_modules` and running `npm install` again
- **Build Failures**: Check for TypeScript errors with `npm run tsc`
- **Test Failures**: Run tests individually to isolate the failing test

For more detailed troubleshooting, refer to the documentation for each technology in the stack:
- [Neon Documentation](https://neon.tech/docs/introduction)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Daily.co Documentation](https://docs.daily.co/)
- [Next.js Documentation](https://nextjs.org/docs)

## Acknowledgements

- [Daily.co](https://www.daily.co/) for their excellent video/audio SDK
- [Neon](https://neon.tech/) for serverless PostgreSQL
- [Prisma](https://www.prisma.io/) for the ORM
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [shadcn/ui](https://ui.shadcn.com/) for UI components

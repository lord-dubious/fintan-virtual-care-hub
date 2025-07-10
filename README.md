# Dr. Fintan's Virtual Care Hub

A **production-ready, full-stack virtual healthcare platform** built with React, TypeScript, Node.js, and PostgreSQL. This application provides a comprehensive solution for virtual medical consultations, appointment booking, patient management, and healthcare practice administration.


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
   - Backend API: http://localhost:3000
   - Health Check: http://localhost:3000/health

### **Production Deployment**
See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for complete deployment instructions.

## 🔑 API Keys & Service Configuration

### Required Services

To run the application, you'll need accounts and API keys from these services:

#### 1. **Neon PostgreSQL** (Database)
- **Website**: [neon.tech](https://neon.tech)
- **Purpose**: Serverless PostgreSQL database
- **Setup**:
  1. Create a free account
  2. Create a new project
  3. Copy the `DATABASE_URL` (pooled) and `DIRECT_URL` (direct) connection strings
  4. Add to your `.env` file

#### 2. **Daily.co** (Video/Audio Calls)
- **Website**: [daily.co](https://daily.co)
- **Purpose**: WebRTC video and audio calling
- **Setup**:
  1. Sign up for a free account
  2. Go to Developers → API Keys
  3. Create a new API key
  4. Set up a domain in Dashboard → Domains
  5. Add `DAILY_API_KEY` and `VITE_DAILY_DOMAIN` to your `.env`

#### 3. **Stripe** (Payment Processing)
- **Website**: [stripe.com](https://stripe.com)
- **Purpose**: Secure payment processing
- **Setup**:
  1. Create a Stripe account
  2. Go to Developers → API Keys
  3. Copy the publishable key (`pk_test_...`) and secret key (`sk_test_...`)
  4. Set up webhooks for payment confirmation
  5. Add keys to your `.env` file

### Optional Services

#### 4. **Paystack** (Alternative Payment - Africa)
- **Website**: [paystack.com](https://paystack.com)
- **Purpose**: Payment processing for African markets
- **Setup**: Get API keys from your dashboard

#### 5. **Flutterwave** (Alternative Payment - Global)
- **Website**: [flutterwave.com](https://flutterwave.com)
- **Purpose**: Global payment processing
- **Setup**: Get API keys from your dashboard

#### 6. **PayPal** (Alternative Payment)
- **Website**: [developer.paypal.com](https://developer.paypal.com)
- **Purpose**: PayPal payment processing
- **Setup**: Create a developer app and get client ID/secret

### Environment Variables Setup

Copy `.env.example` to `.env` and fill in your API keys:

```bash
cp .env.example .env
```

**Required Variables**:
```bash
# Database (Neon)
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Authentication
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-here"

# Daily.co Video Calls
DAILY_API_KEY="your-daily-api-key"
VITE_DAILY_DOMAIN="your-daily-domain"

# Stripe Payments
STRIPE_SECRET_KEY="sk_test_..."
VITE_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

**Optional Variables**:
```bash
# Additional Payment Providers
PAYSTACK_SECRET_KEY="sk_test_..."
FLUTTERWAVE_SECRET_KEY="FLWSECK_TEST-..."
PAYPAL_CLIENT_ID="your-paypal-client-id"
PAYPAL_CLIENT_SECRET="your-paypal-secret"

# Email & SMS (if needed)
SMTP_HOST="smtp.gmail.com"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
TWILIO_ACCOUNT_SID="your-twilio-sid"
TWILIO_AUTH_TOKEN="your-twilio-token"
```

## 🎭 Demo Accounts & Database Seeding

### Database Seeding

To populate your database with demo data, run:

```bash
# Seed the database with demo accounts and sample data
npm run seed

# Or run from the backend directory
cd backend && npm run seed
```

This will create the following demo accounts:

### 👤 Patient Accounts

| Email | Password | Role | Description |
|-------|----------|------|-------------|
| patient@demo.com | DemoPass123! | PATIENT | Regular patient with medical history |
| patient2@demo.com | DemoPass123! | PATIENT | Patient with existing appointments |
| john.doe@demo.com | DemoPass123! | PATIENT | Patient with completed consultations |

### 👨‍⚕️ Provider Accounts

| Email | Password | Role | Specialization |
|-------|----------|------|----------------|
| doctor@demo.com | DemoPass123! | PROVIDER | General Practitioner |
| specialist@demo.com | DemoPass123! | PROVIDER | Cardiologist |
| surgeon@demo.com | DemoPass123! | PROVIDER | Orthopedic Surgeon |

### 👑 Admin Account

| Email | Password | Role |
|-------|----------|------|
| admin@demo.com | AdminPass123! | ADMIN |

### 🔄 Resetting Demo Data

To reset and reseed the database:

```bash
# Reset database and reseed
npm run db:reset
npm run seed
```

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

## 🚀 Deployment

The application supports multiple deployment platforms:

### Recommended: Render.com
- **Easy setup** with `render.yaml` configuration
- **Automatic deployments** from GitHub
- **Built-in PostgreSQL** database options
- **Free tier available** for testing

### Alternative Platforms
- **Vercel** (Frontend) + **Railway** (Backend)
- **Netlify** (Frontend) + **Heroku** (Backend)
- **Self-hosted** with Docker

### Quick Deploy to Render

1. Fork this repository
2. Connect to Render using the `render.yaml` blueprint
3. Set environment variables in Render dashboard
4. Deploy automatically

**For detailed instructions, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)**

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

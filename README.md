# Fintan Virtual Care Hub

A comprehensive telemedicine platform that connects patients with healthcare providers through secure audio and video consultations.

## Project Overview

Fintan Virtual Care Hub is a full-stack telemedicine application that enables:

- Secure audio and video consultations between patients and healthcare providers
- Appointment scheduling and management
- Patient medical record management
- Provider availability management
- Secure payment processing
- Real-time notifications

## Technology Stack

- **Frontend**: React, Next.js, Tailwind CSS, shadcn-ui
- **Backend**: Node.js, Express
- **Database**: PostgreSQL (Neon Serverless)
- **ORM**: Prisma
- **Real-time Communication**: Daily.co SDK
- **Authentication**: JWT, bcrypt
- **Payment Processing**: Stripe
- **Hosting**: Vercel

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- A Neon PostgreSQL account
- A Daily.co account (for video/audio calls)

### Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/lord-dubious/fintan-virtual-care-hub.git
   cd fintan-virtual-care-hub
   ```

2. Install dependencies:
   ```sh
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Update the variables with your actual credentials

4. Set up the database:
   ```sh
   node scripts/apply-migrations.js
   ```

5. Start the development server:
   ```sh
   npm run dev
   # or
   yarn dev
   ```

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

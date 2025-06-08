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

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Daily.co](https://www.daily.co/) for their excellent video/audio SDK
- [Neon](https://neon.tech/) for serverless PostgreSQL
- [Prisma](https://www.prisma.io/) for the ORM
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [shadcn/ui](https://ui.shadcn.com/) for UI components


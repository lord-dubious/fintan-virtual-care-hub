# Cal.com Integration Guide

This guide explains how to replace the existing booking system with Cal.com self-hosted integration for the Fintan Virtual Care Hub.

## Overview

The Cal.com integration provides:
- Self-hosted scheduling infrastructure
- Advanced booking management
- Webhook-based event handling
- Integration with existing Daily.co video system
- Unified booking experience
- API-driven appointment management

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Cal.com       │
│                 │    │                 │    │                 │
│ CalcomBooking   │◄──►│ calcomService   │◄──►│ Self-hosted     │
│ useCalcom hooks │    │ calcomController│    │ Instance        │
│                 │    │ Webhook Handler │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   Database      │
                       │                 │
                       │ Appointments    │
                       │ Cal.com Data    │
                       │ Webhook Events  │
                       └─────────────────┘
```

## Quick Start

### 1. Automated Setup

Run the setup script to automatically configure Cal.com:

```bash
./scripts/setup-calcom.sh
```

This script will:
- Check system requirements
- Generate secure secrets
- Create environment configuration
- Start Cal.com services
- Run database migrations

### 2. Manual Setup

If you prefer manual setup:

#### Step 1: Environment Configuration

Copy the example environment file:
```bash
cp .env.calcom.example .env.calcom
```

Update the configuration values in `.env.calcom`:
- Database passwords
- Security keys (generate with `openssl rand -base64 32`)
- Domain URLs
- Daily.co API key
- Email settings

#### Step 2: Start Cal.com Services

```bash
docker-compose -f docker-compose.calcom.yml up -d
```

#### Step 3: Database Migration

```bash
cd backend
npx prisma migrate dev --name add_calcom_integration
```

## Configuration

### Environment Variables

Key environment variables in `.env.calcom`:

```bash
# Database
CALCOM_DATABASE_PASSWORD=your_secure_password
DATABASE_URL=postgresql://calcom:password@localhost:5433/calcom

# Security
CALCOM_NEXTAUTH_SECRET=your_nextauth_secret
CALCOM_ENCRYPTION_KEY=your_encryption_key

# URLs
CALCOM_WEBAPP_URL=http://localhost:3001
MAIN_APP_URL=http://localhost:3000

# Daily.co Integration
DAILY_API_KEY=your_daily_api_key

# Webhooks
WEBHOOK_ENDPOINT=http://host.docker.internal:3000/api/calcom/webhooks
WEBHOOK_SECRET=your_webhook_secret
```

### Cal.com Setup

1. Visit your Cal.com instance (default: http://localhost:3001)
2. Complete the initial setup wizard
3. Create an admin user
4. Configure OAuth client in Settings > Developer
5. Set up webhooks pointing to your application

### OAuth Configuration

In Cal.com settings:
1. Go to Settings > Developer > OAuth Applications
2. Create a new OAuth application
3. Set redirect URL: `http://localhost:3000/api/calcom/callback`
4. Copy Client ID and Secret to `.env.calcom`

### Webhook Configuration

In Cal.com settings:
1. Go to Settings > Developer > Webhooks
2. Create a new webhook
3. Set URL: `http://host.docker.internal:3000/api/calcom/webhooks`
4. Select events: BOOKING_CREATED, BOOKING_CANCELLED, BOOKING_RESCHEDULED, etc.
5. Set secret from `.env.calcom`

## API Integration

### Backend Services

#### CalcomService (`backend/src/services/calcomService.ts`)

Main service for Cal.com API integration:
- User synchronization
- Event type management
- Booking operations
- Availability checking

```typescript
// Example usage
import { calcomService } from '@/services/calcomService';

// Sync user to Cal.com
const calcomUser = await calcomService.syncUserToCalcom(userId);

// Create booking
const booking = await calcomService.createBooking({
  eventTypeId: 1,
  start: '2024-01-15T10:00:00Z',
  end: '2024-01-15T10:30:00Z',
  attendee: { name: 'John Doe', email: 'john@example.com' }
});
```

#### Webhook Handler (`backend/src/controllers/calcomController.ts`)

Handles Cal.com webhook events:
- Booking created/updated/cancelled
- Meeting started/ended
- Automatic appointment synchronization

### Frontend Components

#### CalcomBooking Component (`src/components/booking/CalcomBooking.tsx`)

Main booking interface:
- Event type selection
- Date/time picker
- Consultation type selection
- Integration with Cal.com embed

```tsx
import CalcomBooking from '@/components/booking/CalcomBooking';

// Usage
<CalcomBooking
  onBookingComplete={() => navigate('/appointments')}
  defaultConsultationType="VIDEO"
/>
```

#### Hooks (`src/hooks/useCalcom.ts`)

React hooks for Cal.com integration:
- `useCalcomEventTypes()` - Get available event types
- `useCreateCalcomBooking()` - Create bookings
- `useCalcomAvailableSlots()` - Get available time slots
- `useCancelCalcomBooking()` - Cancel bookings

## Database Schema

### New Fields

#### User Table
```sql
-- Cal.com integration fields
calcomUserId         INT UNIQUE,
calcomUsername       TEXT UNIQUE,
calcomAccessToken    TEXT,
calcomRefreshToken   TEXT,
calcomTokenExpiry    TIMESTAMP,
timezone             TEXT DEFAULT 'UTC'
```

#### Appointment Table
```sql
-- Cal.com integration fields
calcomBookingId      INT UNIQUE,
calcomBookingUid     TEXT UNIQUE,
calcomEventTypeId    INT,
calcomMetadata       JSONB
```

### New Tables

#### CalcomWebhook
Tracks webhook configurations and events.

#### CalcomEventType
Stores Cal.com event type information.

## Video Integration

The integration maintains compatibility with your existing Daily.co setup:

1. **Cal.com Configuration**: Configure Cal.com to use Daily.co as video provider
2. **Room Creation**: Webhook handler creates Daily.co rooms for bookings
3. **Existing Components**: Keep existing video call components
4. **Consultation Flow**: Maintain existing consultation room workflow

## Testing

### Unit Tests

Test Cal.com service functions:
```bash
npm test -- --testPathPattern=calcom
```

### Integration Tests

Test webhook handling and API integration:
```bash
npm run test:integration
```

### End-to-End Tests

Test complete booking flow:
```bash
npm run test:e2e
```

## Monitoring

### Health Checks

Check Cal.com service health:
```bash
curl http://localhost:3000/api/calcom/health
```

### Logs

View Cal.com container logs:
```bash
docker-compose -f docker-compose.calcom.yml logs -f calcom-app
```

### Webhook Events

Monitor webhook events in database:
```sql
SELECT * FROM "CalcomWebhookEvent" 
WHERE "processed" = false 
ORDER BY "createdAt" DESC;
```

## Troubleshooting

### Common Issues

1. **Cal.com not starting**
   - Check Docker logs
   - Verify environment variables
   - Ensure database is accessible

2. **Webhook not receiving events**
   - Verify webhook URL is accessible from Cal.com
   - Check webhook secret configuration
   - Review firewall settings

3. **Booking creation fails**
   - Verify user is synced to Cal.com
   - Check event type configuration
   - Review API credentials

### Debug Mode

Enable debug logging:
```bash
# In .env.calcom
CALCOM_DEBUG=true
NODE_ENV=development
```

## Migration from Existing System

### Phase 1: Parallel Operation
1. Deploy Cal.com alongside existing system
2. Test with limited users
3. Verify webhook integration

### Phase 2: Gradual Migration
1. Migrate existing appointments to Cal.com format
2. Update frontend to use Cal.com components
3. Redirect new bookings to Cal.com

### Phase 3: Complete Migration
1. Disable old booking system
2. Remove deprecated code
3. Update documentation

## Security Considerations

1. **API Keys**: Store securely, rotate regularly
2. **Webhook Secrets**: Use strong secrets, verify signatures
3. **Database**: Encrypt sensitive Cal.com data
4. **Network**: Use HTTPS in production
5. **Access Control**: Implement proper user permissions

## Production Deployment

### Environment Setup
1. Use production-grade database
2. Configure SSL certificates
3. Set up monitoring and alerting
4. Implement backup strategies

### Performance Optimization
1. Enable Redis caching
2. Configure database connection pooling
3. Implement rate limiting
4. Monitor API response times

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review Cal.com documentation
3. Check application logs
4. Contact development team

## Resources

- [Cal.com Documentation](https://cal.com/docs)
- [Cal.com API Reference](https://cal.com/docs/api-reference/v2/introduction)
- [Daily.co Integration](https://docs.daily.co/)
- [Docker Compose Reference](https://docs.docker.com/compose/)

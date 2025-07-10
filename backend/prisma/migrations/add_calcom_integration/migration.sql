-- Add Cal.com integration fields to User table
ALTER TABLE "User" ADD COLUMN "timezone" TEXT DEFAULT 'UTC';
ALTER TABLE "User" ADD COLUMN "calcomUserId" INTEGER;
ALTER TABLE "User" ADD COLUMN "calcomUsername" TEXT;
ALTER TABLE "User" ADD COLUMN "calcomAccessToken" TEXT;
ALTER TABLE "User" ADD COLUMN "calcomRefreshToken" TEXT;
ALTER TABLE "User" ADD COLUMN "calcomTokenExpiry" TIMESTAMP(3);

-- Add unique constraints for Cal.com fields
ALTER TABLE "User" ADD CONSTRAINT "User_calcomUserId_key" UNIQUE ("calcomUserId");
ALTER TABLE "User" ADD CONSTRAINT "User_calcomUsername_key" UNIQUE ("calcomUsername");

-- Add Cal.com integration fields to Appointment table
ALTER TABLE "Appointment" ADD COLUMN "calcomBookingId" INTEGER;
ALTER TABLE "Appointment" ADD COLUMN "calcomBookingUid" TEXT;
ALTER TABLE "Appointment" ADD COLUMN "calcomEventTypeId" INTEGER;
ALTER TABLE "Appointment" ADD COLUMN "calcomMetadata" JSONB;

-- Add unique constraints for Cal.com booking fields
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_calcomBookingId_key" UNIQUE ("calcomBookingId");
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_calcomBookingUid_key" UNIQUE ("calcomBookingUid");

-- Add indexes for Cal.com fields
CREATE INDEX "Appointment_calcomBookingId_idx" ON "Appointment"("calcomBookingId");
CREATE INDEX "Appointment_calcomBookingUid_idx" ON "Appointment"("calcomBookingUid");

-- Create CalcomWebhook table
CREATE TABLE "CalcomWebhook" (
    "id" TEXT NOT NULL,
    "webhookId" TEXT NOT NULL,
    "subscriberUrl" TEXT NOT NULL,
    "eventTriggers" TEXT[],
    "secret" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CalcomWebhook_pkey" PRIMARY KEY ("id")
);

-- Add unique constraint for webhook ID
ALTER TABLE "CalcomWebhook" ADD CONSTRAINT "CalcomWebhook_webhookId_key" UNIQUE ("webhookId");

-- Create CalcomWebhookEvent table
CREATE TABLE "CalcomWebhookEvent" (
    "id" TEXT NOT NULL,
    "webhookId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "bookingId" INTEGER,
    "bookingUid" TEXT,
    "payload" JSONB NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "processingError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CalcomWebhookEvent_pkey" PRIMARY KEY ("id")
);

-- Add indexes for CalcomWebhookEvent
CREATE INDEX "CalcomWebhookEvent_eventType_idx" ON "CalcomWebhookEvent"("eventType");
CREATE INDEX "CalcomWebhookEvent_bookingId_idx" ON "CalcomWebhookEvent"("bookingId");
CREATE INDEX "CalcomWebhookEvent_processed_idx" ON "CalcomWebhookEvent"("processed");

-- Create CalcomEventType table
CREATE TABLE "CalcomEventType" (
    "id" TEXT NOT NULL,
    "calcomId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "length" INTEGER NOT NULL,
    "locations" JSONB,
    "metadata" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CalcomEventType_pkey" PRIMARY KEY ("id")
);

-- Add unique constraint for Cal.com event type ID
ALTER TABLE "CalcomEventType" ADD CONSTRAINT "CalcomEventType_calcomId_key" UNIQUE ("calcomId");

-- Add foreign key constraints
ALTER TABLE "CalcomWebhookEvent" ADD CONSTRAINT "CalcomWebhookEvent_webhookId_fkey" FOREIGN KEY ("webhookId") REFERENCES "CalcomWebhook"("id") ON DELETE CASCADE ON UPDATE CASCADE;

# Cal.com Complete Integration Guide

## 🎯 **OVERVIEW**

Your Fintan Virtual Care Hub has a **complete Cal.com integration** that:
- ✅ **Shares your Neon database** (no separate database needed)
- ✅ **Embedded booking component** styled to match your theme
- ✅ **Daily.co video integration** pre-configured
- ✅ **Audio/Video call options** built-in
- ✅ **Automatic user synchronization** between systems

## 🚀 **QUICK START**

### **1. Start Cal.com**
```bash
./start-calcom.sh
```

### **2. Initial Setup**
1. Go to http://localhost:3002
2. Create your admin account (use your email)
3. Complete the onboarding wizard

### **3. Configure Event Types (Required)**
This is the **most important step** for booking to work!

## 📅 **EVENT TYPES SETUP (CRITICAL)**

### **Step 1: Create Your Event Types**

1. **Go to Cal.com**: http://localhost:3002
2. **Login** with your admin account
3. **Navigate to**: Event Types → Create New Event Type

### **Step 2: Recommended Event Types**

Create these event types for your virtual care hub:

#### **🩺 General Consultation (30 min)**
- **Name**: `General Consultation`
- **URL**: `general-consultation`
- **Duration**: 30 minutes
- **Description**: "General medical consultation with Dr. Fintan Ekochin"
- **Location**: Daily.co Video Call
- **Price**: Set your consultation fee

#### **🔬 Follow-up Appointment (15 min)**
- **Name**: `Follow-up Appointment`
- **URL**: `follow-up`
- **Duration**: 15 minutes
- **Description**: "Follow-up consultation for existing patients"
- **Location**: Daily.co Video Call
- **Price**: Set your follow-up fee

#### **🏥 Emergency Consultation (45 min)**
- **Name**: `Emergency Consultation`
- **URL**: `emergency`
- **Duration**: 45 minutes
- **Description**: "Urgent medical consultation"
- **Location**: Daily.co Video Call
- **Price**: Set your emergency fee

#### **📞 Phone Consultation (20 min)**
- **Name**: `Phone Consultation`
- **URL**: `phone-consultation`
- **Duration**: 20 minutes
- **Description**: "Audio-only medical consultation"
- **Location**: Phone Call
- **Price**: Set your phone consultation fee

### **Step 3: Configure Daily.co Integration**

1. **In Cal.com**: Go to Apps → Daily.co
2. **API Key**: Already configured (uses your DAILY_API_KEY)
3. **Domain**: Set your Daily.co domain if you have one
4. **Enable** for all event types

### **Step 4: Set Your Availability**

1. **Go to**: Availability → Working Hours
2. **Set your schedule**: e.g., Mon-Fri 9:00 AM - 5:00 PM
3. **Add breaks**: Lunch break, etc.
4. **Save** your availability

## 🎨 **EMBEDDED BOOKING COMPONENT**

Your Fintan app has a **custom booking component** that:

### **Features:**
- ✅ **Styled to match your theme** (same colors, fonts, spacing)
- ✅ **Fetches event types** from your Cal.com setup
- ✅ **Shows available time slots** in real-time
- ✅ **Video/Audio call selection** built-in
- ✅ **Seamless booking flow** within your app
- ✅ **Fallback to Cal.com native** interface if needed

### **Where It's Used:**
- **Patient Dashboard**: Book new appointments
- **Booking Page**: `/book-appointment`
- **Provider Dashboard**: Schedule for patients

### **Component Location:**
```
src/components/booking/CalcomBooking.tsx
```

## 🔗 **INTEGRATION POINTS**

### **1. User Synchronization**
- **Automatic**: When users register in Fintan, they're synced to Cal.com
- **Webhook**: Cal.com bookings create appointments in Fintan
- **Shared Database**: Both systems use your Neon PostgreSQL

### **2. Booking Flow**
```
Patient selects event type → Chooses date/time → Selects video/audio → Books → 
Cal.com creates booking → Webhook notifies Fintan → Appointment created in Fintan
```

### **3. Video Call Integration**
- **Daily.co**: Pre-configured in both systems
- **Room Creation**: Automatic when appointment starts
- **Audio/Video**: Patient can choose during booking

## 🛠️ **CUSTOMIZATION**

### **Styling the Booking Component**

The booking component uses your existing theme:

```typescript
// File: src/components/booking/CalcomBooking.tsx
// Uses your UI components:
- Card, CardContent, CardHeader (your theme)
- Button (your primary colors)
- Badge (your accent colors)
- RadioGroup (your form styling)
```

### **Adding Custom Event Types**

1. **Create in Cal.com**: http://localhost:3002/event-types
2. **Set URL slug**: e.g., `specialist-consultation`
3. **Configure duration**: e.g., 60 minutes
4. **Set location**: Daily.co Video Call
5. **Save** - automatically appears in Fintan booking

### **Custom Booking Fields**

To add custom fields (e.g., symptoms, medical history):

1. **In Cal.com**: Event Type → Booking Questions
2. **Add fields**: Text, dropdown, checkbox
3. **Mark required**: If needed
4. **Save** - fields appear in booking form

## 🔧 **TROUBLESHOOTING**

### **No Event Types Showing**
1. **Check Cal.com**: http://localhost:3002/event-types
2. **Create at least one** event type
3. **Make it public** (not private)
4. **Refresh** your Fintan app

### **Booking Fails**
1. **Check logs**: `docker-compose -f docker-compose.calcom.yml logs -f`
2. **Verify database**: Both apps using same Neon DB
3. **Check webhooks**: Cal.com → Settings → Webhooks

### **Video Calls Not Working**
1. **Daily.co API key**: Check in .env file
2. **Cal.com Daily.co app**: Must be enabled
3. **Event type location**: Set to Daily.co Video Call

### **Styling Issues**
1. **Component styling**: Check `src/components/booking/CalcomBooking.tsx`
2. **Theme consistency**: Uses your existing UI components
3. **CSS conflicts**: Check for conflicting styles

## 📊 **TESTING THE INTEGRATION**

### **1. Test Event Type Creation**
```bash
# 1. Start Cal.com
./start-calcom.sh

# 2. Create event type at http://localhost:3002
# 3. Check it appears in Fintan booking component
```

### **2. Test Booking Flow**
```bash
# 1. Start your Fintan app
cd backend && npm run dev
npm run dev

# 2. Go to booking page
# 3. Select event type, date, time
# 4. Complete booking
# 5. Check appointment appears in both systems
```

### **3. Test Video Integration**
```bash
# 1. Create a booking
# 2. Start the appointment
# 3. Verify Daily.co room is created
# 4. Test video/audio functionality
```

## 🎯 **PRODUCTION CHECKLIST**

### **Before Going Live:**
- [ ] **Event types created** and configured
- [ ] **Availability set** for your schedule
- [ ] **Daily.co integration** tested
- [ ] **Webhook endpoints** configured
- [ ] **Payment integration** set up (if needed)
- [ ] **Email notifications** configured
- [ ] **Booking component** styled and tested
- [ ] **User synchronization** working
- [ ] **Database backup** strategy in place

### **Required Environment Variables:**
```bash
# Already configured in your .env:
DATABASE_URL="your_neon_database_url"
DAILY_API_KEY="your_daily_api_key"
CALCOM_NEXTAUTH_SECRET="your_calcom_secret"
CALCOM_ENCRYPTION_KEY="your_encryption_key"
```

## 🎉 **WHAT'S ALREADY WORKING**

✅ **Database Integration**: Cal.com shares your Neon database  
✅ **Booking Component**: Styled and embedded in your app  
✅ **Video Integration**: Daily.co pre-configured  
✅ **User Sync**: Automatic between systems  
✅ **Webhook Handling**: Real-time appointment creation  
✅ **Theme Matching**: Uses your existing UI components  
✅ **Audio/Video Options**: Built into booking flow  

## 🚀 **NEXT STEPS**

1. **Run** `./start-calcom.sh`
2. **Create** your event types at http://localhost:3002
3. **Set** your availability schedule
4. **Test** the booking flow in your Fintan app
5. **Customize** event types as needed

**Your Cal.com integration is complete and ready to use!** 🎯

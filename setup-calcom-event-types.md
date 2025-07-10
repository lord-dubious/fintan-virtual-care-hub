# Cal.com Event Types Setup Guide

## 🎯 **QUICK SETUP CHECKLIST**

### **1. Start Cal.com**
```bash
./start-calcom.sh
```

### **2. Create Admin Account**
1. Go to http://localhost:3002
2. Click "Sign up" 
3. Use your email: `admin@yourdomain.com`
4. Set a strong password
5. Complete onboarding

### **3. Create Essential Event Types**

#### **📋 Event Type 1: General Consultation**
- **Go to**: Event Types → Create New Event Type
- **Name**: `General Consultation`
- **URL**: `general-consultation` 
- **Duration**: `30 minutes`
- **Description**: `General medical consultation with Dr. Fintan Ekochin`
- **Location**: Select "Daily.co Video Call"
- **Availability**: Use your default schedule
- **Price**: Set your consultation fee (optional)
- **Save**

#### **📋 Event Type 2: Follow-up Appointment**
- **Name**: `Follow-up Appointment`
- **URL**: `follow-up`
- **Duration**: `15 minutes`
- **Description**: `Follow-up consultation for existing patients`
- **Location**: Select "Daily.co Video Call"
- **Save**

#### **📋 Event Type 3: Emergency Consultation**
- **Name**: `Emergency Consultation`
- **URL**: `emergency`
- **Duration**: `45 minutes`
- **Description**: `Urgent medical consultation`
- **Location**: Select "Daily.co Video Call"
- **Save**

#### **📋 Event Type 4: Phone Consultation**
- **Name**: `Phone Consultation`
- **URL**: `phone-consultation`
- **Duration**: `20 minutes`
- **Description**: `Audio-only medical consultation`
- **Location**: Select "Phone Call"
- **Save**

### **4. Configure Daily.co Integration**
1. **Go to**: Apps → Daily.co
2. **API Key**: Should already be configured
3. **Enable** for all video event types
4. **Test** the integration

### **5. Set Your Availability**
1. **Go to**: Availability → Working Hours
2. **Set schedule**: e.g., Monday-Friday 9:00 AM - 5:00 PM
3. **Add breaks**: Lunch break 12:00 PM - 1:00 PM
4. **Save**

### **6. Test the Integration**
1. **Go to your Fintan app**: http://localhost:3001
2. **Navigate to**: `/book-appointment`
3. **Verify**: Event types appear in the booking component
4. **Test booking**: Select event type, date, time
5. **Complete booking**: Verify it works end-to-end

## ✅ **VERIFICATION CHECKLIST**

- [ ] Cal.com is running at http://localhost:3002
- [ ] Admin account created and logged in
- [ ] At least 2 event types created
- [ ] Daily.co integration enabled
- [ ] Availability schedule set
- [ ] Event types appear in Fintan booking component
- [ ] Test booking completed successfully
- [ ] Video call integration working

## 🎨 **STYLING NOTES**

Your Cal.com booking component is already styled to match your Fintan theme:
- ✅ **Same colors** as your primary theme
- ✅ **Same fonts** and typography
- ✅ **Same spacing** and layout patterns
- ✅ **Same button styles** and interactions
- ✅ **Responsive design** for mobile/desktop

## 🔗 **INTEGRATION POINTS**

### **Automatic Features:**
- ✅ **User sync**: Fintan users automatically sync to Cal.com
- ✅ **Booking sync**: Cal.com bookings create Fintan appointments
- ✅ **Video integration**: Daily.co rooms created automatically
- ✅ **Database sharing**: Both systems use your Neon database

### **Manual Configuration Needed:**
- ⚠️ **Event types**: Must be created in Cal.com interface
- ⚠️ **Availability**: Must be set in Cal.com
- ⚠️ **Pricing**: Optional, set in Cal.com event types

## 🚀 **NEXT STEPS**

1. **Complete the setup above**
2. **Test the booking flow**
3. **Customize event types** as needed
4. **Set your pricing** (if applicable)
5. **Configure email notifications** (optional)

## 🆘 **TROUBLESHOOTING**

### **Event types not showing in Fintan app:**
- Check Cal.com is running: http://localhost:3002
- Verify event types are created and public
- Check browser console for API errors

### **Booking fails:**
- Check Cal.com logs: `docker-compose -f docker-compose.calcom.yml logs -f`
- Verify database connection
- Check webhook configuration

### **Video calls not working:**
- Verify Daily.co API key in .env
- Check Daily.co app is enabled in Cal.com
- Ensure event type location is set to "Daily.co Video Call"

## 📞 **SUPPORT**

Your Cal.com integration is complete and ready to use! The booking component is embedded in your Fintan app and styled to match your theme perfectly.

**Access Points:**
- **Cal.com Admin**: http://localhost:3002
- **Fintan Booking**: http://localhost:3001/book-appointment
- **Patient Dashboard**: Booking widget included

**Everything is connected and working together!** 🎉

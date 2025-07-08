const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

// CORS configuration - Allow all origins
app.use(cors({
  origin: true, // Allow all origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-csrf-token'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
}));

app.use(express.json());

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'CORS test successful!',
    timestamp: new Date().toISOString()
  });
});

// Providers endpoint
app.get('/api/providers', (req, res) => {
  res.json({
    success: true,
    data: {
      providers: [{
        id: 'cmcskh5uw0003jhvff9r7utpw',
        userId: 'test-user-id',
        specialization: 'General Medicine',
        isActive: true,
        isVerified: true,
        approvalStatus: 'APPROVED',
        consultationFee: 75.00,
        user: {
          id: 'test-user-id',
          name: 'Dr. John Smith',
          email: 'dr.smith@example.com',
          phone: '+1234567890'
        }
      }],
      total: 1,
      page: 1,
      totalPages: 1
    }
  });
});

// Calendar availability endpoint
app.get('/api/calendar/availability', (req, res) => {
  const { providerId, dateFrom, dateTo, consultationType } = req.query;
  
  console.log('📅 Availability request:', { providerId, dateFrom, dateTo, consultationType });
  
  // Generate mock availability for the next 7 days
  const availability = [];
  const startDate = new Date(dateFrom);
  const endDate = new Date(dateTo);
  
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dayOfWeek = d.getDay();
    
    // Only weekdays (Monday-Friday)
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      const timeSlots = [];
      
      // Generate time slots from 9 AM to 5 PM
      for (let hour = 9; hour < 17; hour++) {
        timeSlots.push({
          time: `${hour.toString().padStart(2, '0')}:00`,
          available: true,
          duration: 30
        });
        timeSlots.push({
          time: `${hour.toString().padStart(2, '0')}:30`,
          available: true,
          duration: 30
        });
      }
      
      availability.push({
        date: d.toISOString().split('T')[0],
        dayOfWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek],
        isAvailable: true,
        timeSlots
      });
    }
  }
  
  res.json({
    success: true,
    data: availability,
    message: 'Availability retrieved successfully'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Test server running on port ${PORT}`);
  console.log(`✅ CORS enabled for all origins`);
  console.log(`🔗 Test URL: http://50.118.225.14:${PORT}/api/test`);
  console.log(`👥 Providers URL: http://50.118.225.14:${PORT}/api/providers`);
  console.log(`📅 Availability URL: http://50.118.225.14:${PORT}/api/calendar/availability`);
});

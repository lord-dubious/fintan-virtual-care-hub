require('dotenv').config();

console.log('Environment Variables Test:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID);
console.log('APPLE_CLIENT_ID:', process.env.APPLE_CLIENT_ID);
console.log('MICROSOFT_CLIENT_ID:', process.env.MICROSOFT_CLIENT_ID);
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');

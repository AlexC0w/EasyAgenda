import dotenv from 'dotenv';
import sendWhatsApp from '../src/lib/sendWhatsApp.js';

dotenv.config();

console.log('--- Script Start ---');
console.log('Testing sendWhatsApp directly...');

const run = async () => {
  try {
    const result = await sendWhatsApp(
      '526141234567', 
      'Test message from debug script', 
      { 
        whatsappSender: '521234567890',
        whatsappToken: process.env.WHATSAPP_API_KEY || 'test-token' 
      }
    );
    console.log('Result:', result);
  } catch (error) {
    console.error('Script Error:', error);
  }
};

run();

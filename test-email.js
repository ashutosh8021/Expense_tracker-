#!/usr/bin/env node

/**
 * 📧 Email Test Script for Expense Tracker
 * 
 * This script helps you test email delivery configuration
 * Run: node test-email.js
 */

require('dotenv').config();
const nodemailer = require('nodemailer');

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

const log = (color, message) => console.log(`${color}${message}${colors.reset}`);

async function testEmailConfiguration() {
  log(colors.blue + colors.bold, '\n📧 Testing Email Configuration...\n');

  // Check environment variables
  const sendgridKey = process.env.SENDGRID_API_KEY;
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  const fromEmail = process.env.FROM_EMAIL;
  const nodeEnv = process.env.NODE_ENV;

  log(colors.yellow, '🔍 Environment Variables:');
  console.log(`   SENDGRID_API_KEY: ${sendgridKey ? '✅ Set' : '❌ Not set'}`);
  console.log(`   FROM_EMAIL: ${fromEmail || 'Not set'}`);
  console.log(`   EMAIL_USER (Gmail fallback): ${emailUser ? '✅ Set' : '❌ Not set'}`);
  console.log(`   EMAIL_PASS (Gmail fallback): ${emailPass ? '✅ Set' : '❌ Not set'}`);
  console.log(`   NODE_ENV: ${nodeEnv || 'development'}\n`);

  if (!sendgridKey && (!emailUser || !emailPass)) {
    log(colors.red, '❌ No email credentials found!');
    log(colors.yellow, '\n💡 To fix this, choose one option:');
    console.log('\n📧 Option 1: SendGrid (Recommended)');
    console.log('   1. Sign up at https://sendgrid.com/');
    console.log('   2. Get your API key from Settings → API Keys');
    console.log('   3. Add to .env file:');
    console.log('      SENDGRID_API_KEY=SG.your-api-key-here');
    console.log('      FROM_EMAIL=your-verified-email@domain.com');
    
    console.log('\n📧 Option 2: Gmail (Alternative)');
    console.log('   1. Enable 2FA on Gmail account');
    console.log('   2. Generate App Password');
    console.log('   3. Add to .env file:');
    console.log('      EMAIL_USER=your-email@gmail.com');
    console.log('      EMAIL_PASS=your-app-password');
    
    console.log('\n📖 See EMAIL_SETUP_GUIDE.md for detailed instructions');
    return;
  }

  // Create transporter based on available credentials
  let transporter;
  let emailService;
  
  if (sendgridKey) {
    transporter = nodemailer.createTransport({
      service: 'SendGrid',
      auth: {
        user: 'apikey',
        pass: sendgridKey
      }
    });
    emailService = 'SendGrid';
  } else {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass
      }
    });
    emailService = 'Gmail';
  }

  try {
    // Test connection
    log(colors.yellow, `🔌 Testing ${emailService} connection...`);
    await transporter.verify();
    log(colors.green, `✅ ${emailService} connection successful!\n`);

    // Send test email
    log(colors.yellow, '📤 Sending test email...');
    
    const testEmailAddress = fromEmail || emailUser;
    const testEmail = {
      from: `"Expense Tracker Test" <${testEmailAddress}>`,
      to: testEmailAddress, // Send to yourself for testing
      subject: `🧪 Test Email from Expense Tracker (${emailService})`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 15px;">
          <div style="background: rgba(255,255,255,0.95); padding: 30px; border-radius: 15px;">
            <h2 style="color: #333; text-align: center;">🎉 ${emailService} Email Test Successful!</h2>
            <p style="color: #555; font-size: 16px;">Congratulations! Your ${emailService} email configuration is working correctly.</p>
            <p style="color: #555; font-size: 16px;">Your Expense Tracker app can now send password reset emails using ${emailService}.</p>
            <div style="text-align: center; margin: 20px 0;">
              <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; border-left: 4px solid #4caf50;">
                <strong style="color: #2e7d32;">✅ ${emailService} email delivery is working!</strong>
              </div>
            </div>
            <div style="background: #f0f8ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h4 style="color: #1976d2; margin: 0 0 10px 0;">📊 Email Service Details:</h4>
              <p style="margin: 5px 0; color: #555;">Service: ${emailService}</p>
              <p style="margin: 5px 0; color: #555;">From: ${testEmailAddress}</p>
              <p style="margin: 5px 0; color: #555;">Test Date: ${new Date().toLocaleString()}</p>
              ${sendgridKey ? '<p style="margin: 5px 0; color: #555;">Daily Limit: 100 emails (free tier)</p>' : ''}
            </div>
            <p style="color: #888; font-size: 14px; text-align: center; margin-top: 20px;">
              Your password reset emails will be delivered via ${emailService}
            </p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(testEmail);
    
    log(colors.green, '✅ Test email sent successfully!');
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   Service: ${emailService}`);
    console.log(`   To: ${testEmailAddress}\n`);
    
    log(colors.blue, '📬 Check your inbox (and spam folder) for the test email.\n');
    log(colors.green + colors.bold, `🎉 ${emailService} email configuration is working perfectly!`);
    
    if (sendgridKey) {
      log(colors.blue, '\n📊 SendGrid Benefits:');
      console.log('   • 100 emails/day on free tier');
      console.log('   • Better deliverability than Gmail');
      console.log('   • Professional email infrastructure');
      console.log('   • Detailed analytics and tracking');
    }
    
  } catch (error) {
    log(colors.red, `❌ ${emailService} test failed!`);
    console.log(`   Error: ${error.message}\n`);
    
    log(colors.yellow, '🔧 Common solutions:');
    
    if (emailService === 'SendGrid') {
      if (error.message.includes('401') || error.message.includes('authentication')) {
        console.log('   • Check your SendGrid API key is correct');
        console.log('   • Make sure the API key has "Mail Send" permissions');
        console.log('   • Verify your SendGrid account is active');
      } else if (error.message.includes('403')) {
        console.log('   • Verify your sender email in SendGrid dashboard');
        console.log('   • Check if your account is suspended');
      } else {
        console.log('   • Check your internet connection');
        console.log('   • Verify SendGrid service status');
      }
    } else {
      if (error.message.includes('Authentication failed')) {
        console.log('   • Make sure you\'re using an App Password (not your regular password)');
        console.log('   • Enable 2-Factor Authentication on your Gmail account');
        console.log('   • Double-check your EMAIL_USER and EMAIL_PASS values');
      } else if (error.message.includes('ECONNREFUSED')) {
        console.log('   • Check your internet connection');
        console.log('   • Verify firewall settings');
        console.log('   • Try SendGrid instead of Gmail');
      }
    }
    
    console.log('   • See EMAIL_SETUP_GUIDE.md for detailed troubleshooting');
  }
}

// Run the test
testEmailConfiguration().catch(console.error);

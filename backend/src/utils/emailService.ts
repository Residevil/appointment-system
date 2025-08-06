import nodemailer from 'nodemailer';
import { IAppointment } from '../models/Appointment';

// Check if email credentials are configured
const isEmailConfigured = () => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  
  console.log('🔍 Checking email configuration:');
  console.log(`   EMAIL_USER: ${emailUser ? 'Set' : 'Not set'}`);
  console.log(`   EMAIL_PASS: ${emailPass ? 'Set' : 'Not set'}`);
  
  return emailUser && emailPass;
};

// Email configuration
const createTransporter = () => {
  if (!isEmailConfigured()) {
    console.warn('⚠️ Email credentials not configured. Email functionality will be disabled.');
    console.warn('To enable email notifications, add EMAIL_USER and EMAIL_PASS to your .env file');
    return null;
  }

  console.log('✅ Email credentials found, creating transporter...');
  
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Create transporter at runtime instead of startup
const getTransporter = () => {
  return createTransporter();
};

// Helper function to format date consistently
const formatAppointmentDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Email template for appointment confirmation
const generateConfirmationEmail = (appointment: IAppointment) => {
  const appointmentDate = formatAppointmentDate(appointment.appointmentDate);
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const managementUrl = `${frontendUrl}/manage/${appointment.bookingId}`;

  return {
    subject: `Appointment Confirmed - Booking ID: ${appointment.bookingId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0;">
          <h1>Appointment Confirmed!</h1>
        </div>
        
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px;">
          <h2>Hello ${appointment.customerName},</h2>
          
          <p>Your appointment has been successfully scheduled. Here are the details:</p>
          
          <div style="background-color: white; padding: 15px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #4CAF50;">
            <h3>Appointment Details:</h3>
            <p><strong>Booking ID:</strong> ${appointment.bookingId}</p>
            <p><strong>Date:</strong> ${appointmentDate}</p>
            <p><strong>Time:</strong> ${appointment.appointmentTime}</p>
            <p><strong>Duration:</strong> ${appointment.duration} minutes</p>
            ${appointment.notes ? `<p><strong>Notes:</strong> ${appointment.notes}</p>` : ''}
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${managementUrl}" 
               style="background-color: #2196F3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Click here to manage your booking
            </a>
          </div>
          
          <p>Please arrive 5 minutes before your scheduled time.</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p style="color: #666; font-size: 14px;">
              Need to reschedule or cancel? Use the link above to manage your appointment online, or contact us directly.
            </p>
            <p style="color: #666; font-size: 14px;">
              Thank you for choosing our service!
            </p>
          </div>
        </div>
      </div>
    `,
    text: `
      Appointment Confirmed - Booking ID: ${appointment.bookingId}
      
      Hello ${appointment.customerName},
      
      Your appointment has been successfully scheduled.
      
      Appointment Details:
      - Booking ID: ${appointment.bookingId}
      - Date: ${appointmentDate}
      - Time: ${appointment.appointmentTime}
      - Duration: ${appointment.duration} minutes
      ${appointment.notes ? `- Notes: ${appointment.notes}` : ''}
      
      Manage your booking: ${managementUrl}
      
      Please arrive 5 minutes before your scheduled time.
      
      Need to reschedule or cancel? Use the link above to manage your appointment online, or contact us directly.
      
      Thank you for choosing our service!
    `
  };
};

// Send confirmation email
export const sendConfirmationEmail = async (appointment: IAppointment): Promise<boolean> => {
  try {
    // Check if email is configured at runtime
    const transporter = getTransporter();
    
    if (!transporter) {
      console.log('📧 Email not configured - skipping confirmation email');
      console.log(`📋 Appointment created successfully for ${appointment.customerName} (${appointment.customerEmail})`);
      console.log(`📅 Date: ${formatAppointmentDate(appointment.appointmentDate)}, Time: ${appointment.appointmentTime}`);
      console.log(`🆔 Booking ID: ${appointment.bookingId}`);
      return true; // Return true since the appointment was created successfully
    }

    const emailContent = generateConfirmationEmail(appointment);
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: appointment.customerEmail,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Confirmation email sent to ${appointment.customerEmail}`);
    return true;

  } catch (error) {
    console.error('❌ Error sending confirmation email:', error);
    
    // Log helpful debugging information
    if (error && typeof error === 'object' && 'code' in error && error.code === 'EAUTH') {
      console.error('🔐 Authentication failed. Please check your email credentials:');
      console.error('   - Make sure EMAIL_USER and EMAIL_PASS are set in your .env file');
      console.error('   - For Gmail, use an App Password (not your regular password)');
      console.error('   - Enable 2-factor authentication and generate an App Password at:');
      console.error('     https://myaccount.google.com/apppasswords');
    }
    
    return false;
  }
};

// Send reminder email (for future implementation)
export const sendReminderEmail = async (appointment: IAppointment): Promise<boolean> => {
  try {
    // Check if email is configured at runtime
    const transporter = getTransporter();
    
    if (!transporter) {
      console.log('📧 Email not configured - skipping reminder email');
      return true;
    }

    const appointmentDate = formatAppointmentDate(appointment.appointmentDate);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: appointment.customerEmail,
      subject: `Reminder: Your appointment tomorrow at ${appointment.appointmentTime}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Appointment Reminder</h2>
          <p>Hello ${appointment.customerName},</p>
          <p>This is a friendly reminder about your appointment tomorrow:</p>
          <p><strong>Date:</strong> ${appointmentDate}</p>
          <p><strong>Time:</strong> ${appointment.appointmentTime}</p>
          <p><strong>Booking ID:</strong> ${appointment.bookingId}</p>
          <p>Please arrive 5 minutes before your scheduled time.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Reminder email sent to ${appointment.customerEmail}`);
    return true;

  } catch (error) {
    console.error('❌ Error sending reminder email:', error);
    return false;
  }
}; 
// services/emailService.js
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class EmailService {
  constructor() {
    this.transporter = null;
    this.initialized = false;
    this.initializeTransporter();
  }

  initializeTransporter() {
    try {
      // Check if email configuration exists
      const hasEmailConfig = process.env.EMAIL_USER && process.env.EMAIL_PASSWORD;
      
      if (!hasEmailConfig) {
        console.warn('⚠️  EMAIL_USER or EMAIL_PASSWORD not set. Emails will be logged but not sent.');
        this.initialized = false;
        return;
      }

      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT) : 587,
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      // Verify transporter configuration
      this.transporter.verify((error) => {
        if (error) {
          console.error('❌ Email transporter verification failed:', error);
          this.initialized = false;
        } else {
          console.log('✅ Email transporter initialized and verified');
          this.initialized = true;
        }
      });

    } catch (error) {
      console.error('❌ Failed to initialize email transporter:', error);
      this.initialized = false;
    }
  }

  async sendMail({ to, subject, html, attachments = [] }) {
    // Log email attempt regardless of transporter status
    console.log(`📧 Attempting to send email to: ${to}, Subject: ${subject}`);

    if (!this.initialized || !this.transporter) {
      console.warn('⚠️  Email transporter not available. Email would have been sent to:', to);
      console.warn('📧 Email content:', { to, subject, html: html.substring(0, 100) + '...' });
      return { 
        messageId: 'simulated-' + Date.now(),
        previewUrl: null,
        simulated: true 
      };
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || `"Black Pearl Tours" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      attachments,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email sent to ${to} | Message ID: ${info.messageId}`);
      
      // Only log preview URL for Ethereal (test service)
      if (process.env.EMAIL_HOST === 'smtp.ethereal.email') {
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
          console.log('📧 Preview URL:', previewUrl);
        }
      }
      
      return info;
    } catch (error) {
      console.error('❌ Failed to send email:', error);
      
      // Don't throw error in production - just log it
      if (process.env.NODE_ENV === 'production') {
        console.warn('📧 Email failed but continuing execution');
        return null;
      } else {
        throw error;
      }
    }
  }

  async sendQuoteEmail(quote, finalPrice, adminNotes, approvalToken) {
    const acceptLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/quote-accept/${quote._id}?token=${approvalToken}`;
    const dashboardLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/profile`;

    let attachments = [];
    
    // Safely check for terms file (might not exist in production)
    try {
      const termsPath = path.join(__dirname, '../public/terms-and-conditions.pdf');
      if (fs.existsSync(termsPath)) {
        attachments = [{
          filename: 'terms-and-conditions.pdf',
          path: termsPath,
          contentType: 'application/pdf'
        }];
      } else {
        console.log('📄 Terms and conditions PDF not found at:', termsPath);
      }
    } catch (error) {
      console.warn('⚠️  Could not attach terms and conditions:', error.message);
    }

    const html = this.getQuoteEmailTemplate(quote, finalPrice, adminNotes, acceptLink, dashboardLink);

    return this.sendMail({
      to: quote.customerEmail,
      subject: `Your Quote from Black Pearl Tours - R ${finalPrice}`,
      html,
      attachments
    });
  }

  async sendBookingConfirmation(quote, action) {
    const isAccepted = action === 'accepted';
    const subject = isAccepted 
      ? 'Booking Confirmed - Black Pearl Tours' 
      : 'Quote Declined - Black Pearl Tours';

    const html = this.getConfirmationEmailTemplate(quote, action);

    return this.sendMail({
      to: quote.customerEmail,
      subject,
      html
    });
  }

  async sendAdminReplyEmail(toEmail, subject, replyContent) {
    const html = this.getAdminReplyEmailTemplate(replyContent);

    return this.sendMail({
      to: toEmail,
      subject: `RE: ${subject}`,
      html
    });
  }

  // Email templates
  getQuoteEmailTemplate(quote, finalPrice, adminNotes, acceptLink, dashboardLink) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
          .header { background: #2c3e50; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f8f9fa; }
          .button { background: #27ae60; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; }
          .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Black Pearl Tours</h1>
          <h2>Your Quote is Ready!</h2>
        </div>
        
        <div class="content">
          <h3>Quote Details</h3>
          <p><strong>Customer:</strong> ${quote.customerName}</p>
          <p><strong>Trip Type:</strong> ${quote.tripType}</p>
          <p><strong>Route:</strong> ${quote.pickupLocation} → ${quote.dropoffLocation}</p>
          <p><strong>Final Price:</strong> R ${finalPrice}</p>
          ${adminNotes ? `<p><strong>Admin Notes:</strong> ${adminNotes}</p>` : ''}
          
          <div style="margin: 20px 0;">
            <a href="${acceptLink}" class="button">Accept Quote</a>
          </div>
        </div>

        <div class="footer">
          <p>Black Pearl Coach Charters and Tours</p>
          <p>Contact: ${process.env.CONTACT_EMAIL || 'info@blackpearltours.co.za'} | 011 762 1858</p>
        </div>
      </body>
      </html>
    `;
  }

  getConfirmationEmailTemplate(quote, action) {
    const isAccepted = action === 'accepted';
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
          .header { background: ${isAccepted ? '#27ae60' : '#e74c3c'}; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f8f9fa; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Black Pearl Tours</h1>
          <h2>${isAccepted ? 'Booking Confirmed' : 'Quote Declined'}</h2>
        </div>
        
        <div class="content">
          <p>Your quote has been <strong>${action}</strong>.</p>
          ${isAccepted ? `
            <p><strong>Booking Details:</strong></p>
            <p>Customer: ${quote.customerName}</p>
            <p>Trip: ${quote.tripType}</p>
            <p>Route: ${quote.pickupLocation} → ${quote.dropoffLocation}</p>
            <p>Price: R ${quote.finalPrice || 'N/A'}</p>
          ` : `
            <p>We're sorry to see you decline this quote. If you change your mind, please contact us.</p>
          `}
        </div>
      </body>
      </html>
    `;
  }

  getAdminReplyEmailTemplate(replyContent) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
          .header { background: #2c3e50; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f8f9fa; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Black Pearl Tours</h1>
          <h2>Response to Your Inquiry</h2>
        </div>
        
        <div class="content">
          <p>Dear Customer,</p>
          <p>Thank you for contacting us. Here is our response:</p>
          <div style="background: white; padding: 15px; border-left: 4px solid #2c3e50; margin: 15px 0;">
            <p>${replyContent}</p>
          </div>
          <p>If you have any further questions, please don't hesitate to contact us.</p>
        </div>
      </body>
      </html>
    `;
  }
}

// Create singleton instance
const emailService = new EmailService();

// Export both the class and instance
export { EmailService };
export default emailService;
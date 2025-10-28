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
    this.initializeTransporter();
  }

  initializeTransporter() {
    if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
        port: process.env.EMAIL_PORT || 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
      });
    }
  }

  async sendQuoteEmail(quote, finalPrice, adminNotes, approvalToken) {
    if (!this.transporter) {
      console.log('Email transporter not available');
      return null;
    }

    const acceptLink = `${process.env.FRONTEND_URL}/quote-accept/${quote._id}?token=${approvalToken}`;
    const dashboardLink = `${process.env.FRONTEND_URL}/profile`;

    // Read terms and conditions
    const termsPath = path.join(__dirname, '../public/terms-and-conditions.pdf');
    const termsAttachment = fs.existsSync(termsPath) ? {
      filename: 'terms-and-conditions.pdf',
      path: termsPath,
      contentType: 'application/pdf'
    } : null;

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@blackpearltours.co.za',
      to: quote.customerEmail,
      subject: `Your Quote from Black Pearl Tours - R ${finalPrice}`,
      html: this.getQuoteEmailTemplate(quote, finalPrice, adminNotes, acceptLink, dashboardLink),
      attachments: termsAttachment ? [termsAttachment] : []
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('📧 Quote email sent! Message ID:', info.messageId);
      if (process.env.EMAIL_HOST === 'smtp.ethereal.email') {
        console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
      }
      return info;
    } catch (error) {
      console.error('❌ Failed to send quote email:', error);
      throw error;
    }
  }

  async sendBookingConfirmation(quote, action) {
    if (!this.transporter) return null;

    const subject = action === 'accepted'
      ? 'Booking Confirmed - Black Pearl Tours'
      : 'Quote Declined - Black Pearl Tours';

    const termsPath = path.join(__dirname, '../public/terms-and-conditions.pdf');
    const termsAttachment = fs.existsSync(termsPath) ? {
      filename: 'terms-and-conditions.pdf',
      path: termsPath,
      contentType: 'application/pdf'
    } : null;

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@blackpearltours.co.za',
      to: quote.customerEmail,
      subject: subject,
      html: this.getConfirmationEmailTemplate(quote, action),
      attachments: termsAttachment ? [termsAttachment] : []
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log(`📧 Confirmation email sent (${action}):`, info.messageId);
      return info;
    } catch (error) {
      console.error(`❌ Failed to send ${action} confirmation email:`, error);
      throw error;
    }
  }

  async sendAdminReplyEmail(toEmail, subject, replyContent) {
    if (!this.transporter) {
      console.log('Email transporter not available');
      return null;
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@blackpearltours.co.za',
      to: toEmail,
      subject: `RE: ${subject}`,
      html: this.getAdminReplyEmailTemplate(replyContent),
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('📧 Admin reply email sent! Message ID:', info.messageId);
      if (process.env.EMAIL_HOST === 'smtp.ethereal.email') {
        console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
      }
      return info;
    } catch (error) {
      console.error('❌ Failed to send admin reply email:', error);
      throw error;
    }
  }

  getAdminReplyEmailTemplate(replyContent) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2c3e50; color: white; padding: 20px; text-align: center; }
          .content { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ecf0f1; color: #7f8c8d; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Black Pearl Tours</h1>
            <h2>Response to your Message</h2>
          </div>
          
          <div class="content">
            <p>Dear Customer,</p>
            <p>Thank you for contacting us. Here is a response from our administration team:</p>
            <div style="background: white; padding: 15px; border-left: 4px solid #2c3e50; margin: 15px 0;">
              <p>${replyContent}</p>
            </div>
            <p>We hope this addresses your query. If you have any further questions, please do not hesitate to reply to this email or contact us through our website.</p>
          </div>

          <div class="footer">
            <p>Sincerely,</p>
            <p>The Black Pearl Tours Team</p>
            <p>Contact: ${process.env.CONTACT_EMAIL || 'mathapelom@blackpearltours.co.za'} | 011 762 1858</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getQuoteEmailTemplate(quote, finalPrice, adminNotes, acceptLink, dashboardLink) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2c3e50; color: white; padding: 20px; text-align: center; }
          .content { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .button { background: #27ae60; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ecf0f1; color: #7f8c8d; font-size: 12px; }
          .quote-details { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Black Pearl Tours</h1>
            <h2>Your Quote is Ready!</h2>
          </div>
          
          <div class="content">
            <h3>Quote Details</h3>
            <div class="quote-details">
              <p><strong>Customer:</strong> ${quote.customerName}</p>
              <p><strong>Trip Type:</strong> ${quote.tripType}</p>
              <p><strong>Purpose:</strong> ${quote.tripPurpose}</p>
              <p><strong>Route:</strong> ${quote.pickupLocation} → ${quote.dropoffLocation}</p>
              <p><strong>Vehicle:</strong> ${quote.vehicleType}</p>
              <p><strong>Date:</strong> ${new Date(quote.tripDate).toLocaleDateString()}</p>
              <p><strong>Time:</strong> ${quote.tripTime}</p>
              <p><strong>Final Price:</strong> R ${finalPrice}</p>
              ${adminNotes ? `<p><strong>Admin Notes:</strong> ${adminNotes}</p>` : ''}
            </div>

            <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #27ae60; margin-top: 0;">Ready to proceed?</h3>
              
              ${!quote.userId ? `
              <p><strong>You'll need to create an account to accept this quote.</strong> This allows you to:</p>
              <ul>
                <li>Manage your booking online</li>
                <li>Receive loyalty points</li>
                <li>Track your trip history</li>
                <li>Get special offers</li>
              </ul>
              
              <div style="margin: 20px 0;">
                <a href="${acceptLink}" class="button">
                  Create Account & Accept Quote
                </a>
              </div>
              
              <p style="font-size: 14px; color: #666;">
                Already have an account? <a href="${process.env.FRONTEND_URL}/login">Log in here</a> first, then visit your dashboard to accept the quote.
              </p>
              ` : `
              <p><strong>You can accept this quote in your dashboard.</strong></p>
              <div style="margin: 20px 0;">
                <a href="${dashboardLink}" class="button">
                  View Quote in Dashboard
                </a>
              </div>
              `}
            </div>

            <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h4 style="color: #856404; margin-top: 0;">📋 Terms & Conditions</h4>
              <p>Please review the attached Terms and Conditions document before accepting this quote. By accepting, you agree to all terms outlined in the document.</p>
              <p><strong>Key points:</strong></p>
              <ul>
                <li>Full payment is required before departure</li>
                <li>Cancellation fees apply based on notice period</li>
                <li>Driver's meals and accommodation are client's responsibility</li>
                <li>No smoking or alcohol consumption on vehicles</li>
              </ul>
            </div>
          </div>

          <div class="footer">
            <p>Thank you for considering Black Pearl Tours!</p>
            <p>If you have any questions, contact us at ${process.env.CONTACT_EMAIL || 'mathapelom@blackpearltours.co.za'}</p>
            <p>Black Pearl Coach Charters and Tours<br>
            Meurant Street, Witpoortjie, 1724<br>
            011 762 1858</p>
          </div>
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
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: ${isAccepted ? '#27ae60' : '#e74c3c'}; color: white; padding: 20px; text-align: center; }
          .content { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ecf0f1; color: #7f8c8d; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Black Pearl Tours</h1>
            <h2>${isAccepted ? '✅ Booking Confirmed' : '❌ Quote Declined'}</h2>
          </div>
          
          <div class="content">
            <p>Your quote has been <strong>${isAccepted ? 'accepted' : 'declined'}</strong>.</p>
            
            ${isAccepted ? `
            <div style="background: #e8f5e8; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <h3 style="color: #27ae60; margin-top: 0;">Booking Details</h3>
              <p><strong>Customer:</strong> ${quote.customerName}</p>
              <p><strong>Trip:</strong> ${quote.tripType}</p>
              <p><strong>Route:</strong> ${quote.pickupLocation} → ${quote.dropoffLocation}</p>
              <p><strong>Date:</strong> ${new Date(quote.tripDate).toLocaleDateString()}</p>
              <p><strong>Time:</strong> ${quote.tripTime}</p>
              <p><strong>Price:</strong> R ${quote.finalPrice}</p>
            </div>
            
            <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <h4 style="color: #856404;">📋 Terms & Conditions</h4>
              <p>Please review the attached Terms and Conditions document for your booking.</p>
            </div>
            
            <p><strong>Next Steps:</strong></p>
            <ul>
              <li>Payment is due before departure</li>
              <li>You can manage your booking in your dashboard</li>
              <li>Contact us if you need to make any changes</li>
            </ul>
            ` : `
            <p>We're sorry to see you decline this quote. If you change your mind or have any questions, please don't hesitate to contact us.</p>
            `}
          </div>

          <div class="footer">
            <p>Thank you for considering Black Pearl Tours!</p>
            <p>Contact: ${process.env.CONTACT_EMAIL || 'mathapelom@blackpearltours.co.za'} | 011 762 1858</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

export default new EmailService();

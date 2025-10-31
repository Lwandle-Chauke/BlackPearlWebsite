
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter (using Gmail as example) - FIXED: createTransport not createTransporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Your email
    pass: process.env.EMAIL_PASS  // Your app password
  }
});

const quoteEmailTemplate = (quoteData) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #2c3e50, #34495e); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .quote-details { background: white; padding: 25px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .detail-row { display: flex; justify-content: space-between; margin-bottom: 10px; padding: 8px 0; border-bottom: 1px solid #eee; }
        .detail-label { font-weight: bold; color: #555; }
        .detail-value { color: #2c3e50; }
        .price-highlight { background: #27ae60; color: white; padding: 15px; border-radius: 8px; text-align: center; font-size: 24px; font-weight: bold; margin: 20px 0; }
        .button-container { text-align: center; margin: 30px 0; }
        .btn { display: inline-block; padding: 15px 30px; margin: 10px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px; transition: all 0.3s ease; }
        .btn-accept { background: #27ae60; color: white; }
        .btn-accept:hover { background: #219653; }
        .btn-decline { background: #e74c3c; color: white; }
        .btn-decline:hover { background: #c0392b; }
        .benefits { background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 25px 0; }
        .benefits ul { margin: 10px 0; padding-left: 20px; }
        .benefits li { margin-bottom: 8px; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #7f8c8d; font-size: 14px; }
        .urgency { background: #fff3cd; padding: 15px; border-radius: 5px; margin: 15px 0; text-align: center; border-left: 4px solid #ffc107; }
    </style>
</head>
<body>
    <div class="header">
        <h1>BLACK PEARL TOURS</h1>
        <p>Your Adventure Awaits</p>
    </div>

    <div class="content">
        <h2>Your Quote is Ready, ${quoteData.name}!</h2>
        <p>Thank you for requesting a quote with Black Pearl Tours. We're excited to help make your journey unforgettable!</p>

        <div class="quote-details">
            <h3 style="color: #2c3e50; margin-top: 0;">Quote Details</h3>
            
            <div class="detail-row">
                <span class="detail-label">Trip Type:</span>
                <span class="detail-value">${quoteData.tripType}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Vehicle:</span>
                <span class="detail-value">${quoteData.vehicle}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Route:</span>
                <span class="detail-value">${quoteData.route}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Date:</span>
                <span class="detail-value">${new Date(quoteData.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Time:</span>
                <span class="detail-value">${quoteData.time}</span>
            </div>

            <div class="price-highlight">
                Final Price: R ${parseInt(quoteData.price).toLocaleString()}
            </div>
        </div>

        <div class="urgency">
            ⚡ <strong>Quote valid for 7 days</strong> - Secure your booking now!
        </div>

        <div class="button-container">
            <a href="${quoteData.acceptLink}" class="btn btn-accept">
                ✅ Accept Quote & Book Now
            </a>
            <a href="${quoteData.declineLink}" class="btn btn-decline">
                ❌ Decline Quote
            </a>
        </div>

        <div class="benefits">
            <h4 style="color: #27ae60; margin-top: 0;">✨ Create Your Account & Enjoy:</h4>
            <ul>
                <li>📱 Manage your booking online 24/7</li>
                <li>⭐ Earn loyalty points with every trip</li>
                <li>📊 Track your complete travel history</li>
                <li>🎁 Receive exclusive offers and discounts</li>
                <li>⚡ Faster booking for future trips</li>
            </ul>
        </div>

        <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; text-align: center;">
            <p><strong>Already have an account?</strong></p>
            <a href="${quoteData.loginLink}" style="color: #3498db; text-decoration: none; font-weight: bold;">
                Login here first, then visit your dashboard to accept the quote
            </a>
        </div>

        <div style="margin-top: 25px; padding: 15px; background: #f1f1f1; border-radius: 5px; font-size: 12px;">
            <p><strong>If buttons don't work, copy these links:</strong></p>
            <p>Accept: ${quoteData.acceptLink}</p>
            <p>Decline: ${quoteData.declineLink}</p>
        </div>
    </div>

    <div class="footer">
        <p>Black Pearl Tours &copy; ${new Date().getFullYear()}</p>
        <p>📍 JHB, South Africa</p>
        <p>📞 +27 21 123 4567 | ✉️ info@blackpearltours.com</p>
        <p><a href="${quoteData.websiteLink}" style="color: #7f8c8d;">Visit Our Website</a></p>
    </div>
</body>
</html>
`;

const sendQuoteEmail = async (toEmail, quoteData) => {
  try {
    const mailOptions = {
      from: '"Black Pearl Tours" <noreply@blackpearltours.com>',
      to: toEmail,
      subject: `Your Quote - R ${quoteData.price} | Black Pearl Tours`,
      html: quoteEmailTemplate(quoteData)
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Professional quote email sent to:', toEmail, 'Message ID:', result.messageId);
    return result;
  } catch (error) {
    console.error('❌ Error sending professional quote email:', error);
    throw error;
  }
};

// Export as default
export default sendQuoteEmail;

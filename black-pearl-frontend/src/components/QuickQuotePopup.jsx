import React, { useState } from "react";
import "../styles/QuickQuotePopup.css";

const QuickQuotePopup = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    serviceType: '',
    vehicleType: '',
    pickupLocation: '',
    dropoffLocation: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // Validate required fields
    if (!formData.vehicleType || !formData.pickupLocation || !formData.dropoffLocation) {
      setMessage('error: Please fill in all required fields including vehicle type and locations');
      setLoading(false);
      return;
    }

    try {
      // Submit to your existing quotes endpoint
      const response = await fetch('http://localhost:5000/api/quotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Map quick quote data to your existing quote structure
          customerName: formData.name,
          customerEmail: formData.email,
          customerPhone: formData.phone,
          tripType: formData.serviceType,
          tripPurpose: "Quick Quote Request",
          destination: formData.dropoffLocation, // Use dropoff as destination
          pickupLocation: formData.pickupLocation,
          dropoffLocation: formData.dropoffLocation,
          vehicleType: formData.vehicleType,
          message: formData.message,
          isQuickQuote: true, // Flag to identify quick quotes
          status: "pending",
          quoteStatus: "pending_admin", // Use your existing quote status system
          estimatedPrice: 0, // To be set by admin
          finalPrice: 0, // To be set by admin
          tripDate: new Date().toISOString().split('T')[0], // Default to today
          tripTime: "12:00", // Default time
          isOneWay: true // Default to one way for quick quotes
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage('success');
        if (onSubmit) {
          onSubmit(formData);
        }
        // Auto-close after success
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setMessage('error: ' + (data.error || 'Failed to submit request'));
      }
    } catch (error) {
      console.error('Quote submission error:', error);
      setMessage('error: Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="quick-quote-overlay">
      <div className="quick-quote-popup">
        <button className="close-btn" onClick={onClose}>×</button>
        <h3>Get a Quick Quote</h3>
        <p className="popup-subtitle">Fill in your details for an accurate transportation quote</p>
        
        {/* Success/Error Messages */}
        {message === 'success' && (
          <div className="message success">
            ✅ Thank you! We've received your request and will contact you shortly with a detailed quote.
          </div>
        )}
        
        {message.startsWith('error:') && (
          <div className="message error">
            ❌ {message.replace('error: ', '')}
          </div>
        )}

        <form onSubmit={handleSubmit} className="quick-quote-form">
          <div className="form-row">
            <input
              type="text"
              name="name"
              placeholder="Your Name *"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-row">
            <input
              type="email"
              name="email"
              placeholder="Your Email *"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-row">
            <input
              type="tel"
              name="phone"
              placeholder="Your Phone *"
              value={formData.phone}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-row">
            <select 
              name="serviceType" 
              value={formData.serviceType} 
              onChange={handleChange} 
              required
              disabled={loading}
            >
              <option value="">Service Type *</option>
              <option value="Airport Transfers">Airport Transfers</option>
              <option value="Wedding">Wedding</option>
              <option value="Corporate">Corporate</option>
              <option value="Special Event">Special Event</option>
              <option value="Tour">Tour</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-row">
            <select 
              name="vehicleType" 
              value={formData.vehicleType} 
              onChange={handleChange} 
              required
              disabled={loading}
            >
              <option value="">Select Vehicle Type *</option>
              <option value="4 Seater Sedan">4 Seater Sedan</option>
              <option value="Mini Bus Mercedes Viano">Mini Bus Mercedes Viano</option>
              <option value="15 Seater Quantum">15 Seater Quantum</option>
              <option value="17 Seater Luxury Sprinter">17 Seater Luxury Sprinter</option>
              <option value="22 Seater Luxury Coach">22 Seater Luxury Coach</option>
              <option value="28 Seater Luxury Coach">28 Seater Luxury Coach</option>
              <option value="39 Seater Luxury Coach">39 Seater Luxury Coach</option>
              <option value="60 Seater Semi Luxury">60 Seater Semi Luxury</option>
              <option value="70 Seater Semi Luxury">70 Seater Semi Luxury</option>
            </select>
          </div>

          <div className="form-row">
            <input
              type="text"
              name="pickupLocation"
              placeholder="Pickup Location * (e.g., Johannesburg Airport)"
              value={formData.pickupLocation}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-row">
            <input
              type="text"
              name="dropoffLocation"
              placeholder="Dropoff Location * (e.g., Sandton City)"
              value={formData.dropoffLocation}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-row">
            <textarea
              name="message"
              placeholder="Additional details (date, time, special requirements, etc.)"
              value={formData.message}
              onChange={handleChange}
              rows="3"
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading}
          >
            {loading ? "SUBMITTING..." : "GET QUICK QUOTE"}
          </button>
        </form>
        
        <p className="popup-note">
          We'll review your vehicle and route details to provide an accurate quote within 24 hours
        </p>
      </div>
    </div>
  );
};

export default QuickQuotePopup;
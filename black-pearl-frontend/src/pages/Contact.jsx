import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/style.css';
import '../styles/contact.css';

const Contact = ({ onAuthClick, isLoggedIn, onSignOut, currentUser }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubmitMessage('Thank you for your message! We will contact you shortly.');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      setSubmitMessage('Sorry, there was an error sending your message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header 
        onAuthClick={onAuthClick} 
        isLoggedIn={isLoggedIn} 
        user={currentUser}
        onSignOut={onSignOut}
      />

      <main className="quote-page">
        {/* Contact Section */}
        <section className="contact" id="contact">
          <div className="section-title">
            <h2>CONTACT US</h2>
          </div>
          <br />

          <div className="contact-container">
            {/* Contact Information */}
            <div className="contact-info">
              <h2>GET IN TOUCH</h2>
              <div className="contact-details">
                
                <p>
                  <i className="fas fa-mobile-alt mobile-icon"></i> 
                  <a href="tel:011 762 1858">011 762 1858</a>
                </p>
                <br />
                <p>
                  <i className="fas fa-envelope envelope-icon"></i> 
                  <a href="mailto:mathapelom@blackpearltours.co.za">mathapelom@blackpearltours.co.za</a>
                </p>
                <br />
                <p>
                  <i className="fas fa-map-marker-alt map-icon"></i>
                  Meurant Street, Witpoortjie, 1724
                </p>
              </div>

              {/* Google Map */}
              <div className="map">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3581.169832118304!2d27.823949000000002!3d-26.158597899999997!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1e95a2074a069ce3%3A0x151524c062bf4ca1!2sBlack%20Pearl%20Coach%20Charters%20%26%20Tours!5e0!3m2!1sen!2sza!4v1760640105059!5m2!1sen!2sza" 
                  width="600" 
                  height="450"
                  style={{border: 0}} 
                  allowFullScreen="" 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Black Pearl Coach Charters Location"
                ></iframe>
              </div>
            </div>

            {/* Contact Form */}
            <div className="contact-form">
              <h2>SEND US A MESSAGE</h2>
              <form onSubmit={handleSubmit}>
                <input type="hidden" name="_captcha" value="false" />
                <input type="hidden" name="_template" value="table" />

                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input 
                    type="text" 
                    id="name" 
                    name="name" 
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your name" 
                    required 
                    disabled={isSubmitting}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input 
                    type="email" 
                    id="email" 
                    name="email" 
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email" 
                    required 
                    disabled={isSubmitting}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="subject">Subject</label>
                  <input 
                    type="text" 
                    id="subject" 
                    name="subject" 
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="Enter the subject" 
                    required 
                    disabled={isSubmitting}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="message">Message</label>
                  <textarea 
                    id="message" 
                    name="message" 
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Enter your message" 
                    required
                    disabled={isSubmitting}
                  ></textarea>
                </div>

                {submitMessage && (
                  <div className={`submit-message ${submitMessage.includes('error') ? 'error' : 'success'}`}>
                    {submitMessage}
                  </div>
                )}

                <div style={{textAlign: 'center'}}>
                  <button 
                    type="submit" 
                    className="btn-contact"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>
      </main>

      {/* Floating chat icon */}
      <div className="chat-fab" title="Chat with us">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="5" width="20" height="14" rx="3" fill="#fff"/>
          <circle cx="8.5" cy="10.3" r="1.1" fill="#666"/>
          <circle cx="15.5" cy="10.3" r="1.1" fill="#666"/>
          <rect x="9.5" y="13.6" width="5" height="1.3" rx="0.65" fill="#c1c1c1"/>
        </svg>
      </div>

      <Footer />
    </>
  );
};

export default Contact;
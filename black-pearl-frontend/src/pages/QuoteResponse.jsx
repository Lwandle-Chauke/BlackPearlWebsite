import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/style.css';
import '../styles/quote-response.css';

const QuoteResponse = () => {
  const { quoteId, action } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [declineReason, setDeclineReason] = useState('');

  useEffect(() => {
    fetchQuoteDetails();
  }, [quoteId]);

  const fetchQuoteDetails = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/quotes/${quoteId}`);
      const data = await response.json();
      
      if (data.success) {
        setQuote(data.data);
      } else {
        setError('Quote not found');
      }
    } catch (error) {
      console.error('Fetch quote error:', error);
      setError('Failed to load quote details');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!token) {
      setError('Invalid approval link');
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch(`http://localhost:5000/api/quotes/${quoteId}/accept-quote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token })
      });

      const data = await response.json();

      if (data.success) {
        setMessage('Quote accepted successfully! Your booking has been confirmed. You will receive a confirmation email shortly.');
      } else {
        setError(data.error || 'Failed to accept quote');
      }
    } catch (error) {
      console.error('Accept quote error:', error);
      setError('Failed to accept quote. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleDecline = async () => {
    if (!token) {
      setError('Invalid approval link');
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch(`http://localhost:5000/api/quotes/${quoteId}/decline-quote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          token,
          declineReason 
        })
      });

      const data = await response.json();

      if (data.success) {
        setMessage('Quote declined successfully. You will receive a confirmation email shortly.');
      } else {
        setError(data.error || 'Failed to decline quote');
      }
    } catch (error) {
      console.error('Decline quote error:', error);
      setError('Failed to decline quote. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="quote-response-container">
          <div className="loading-spinner">Loading quote details...</div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="quote-response-container">
          <div className="error-message">
            <h2>Error</h2>
            <p>{error}</p>
            <button onClick={() => navigate('/')} className="btn-primary">
              Go to Homepage
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (message) {
    return (
      <>
        <Header />
        <div className="quote-response-container">
          <div className="success-message">
            <h2>Success!</h2>
            <p>{message}</p>
            <button onClick={() => navigate('/')} className="btn-primary">
              Go to Homepage
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      
      <div className="quote-response-container">
        <div className="quote-response-card">
          <div className="response-header">
            <h1>Quote Response</h1>
            <p>Review your quote details below</p>
          </div>

          {quote && (
            <div className="quote-details-section">
              <div className="quote-summary">
                <h3>Quote Summary</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Trip Type:</label>
                    <span>{quote.tripType}</span>
                  </div>
                  <div className="detail-item">
                    <label>Purpose:</label>
                    <span>{quote.tripPurpose}</span>
                  </div>
                  <div className="detail-item">
                    <label>Route:</label>
                    <span>{quote.pickupLocation} → {quote.dropoffLocation}</span>
                  </div>
                  <div className="detail-item">
                    <label>Vehicle:</label>
                    <span>{quote.vehicleType}</span>
                  </div>
                  <div className="detail-item">
                    <label>Date:</label>
                    <span>{new Date(quote.tripDate).toLocaleDateString()}</span>
                  </div>
                  <div className="detail-item">
                    <label>Time:</label>
                    <span>{quote.tripTime}</span>
                  </div>
                  <div className="detail-item highlight">
                    <label>Final Price:</label>
                    <span>R {quote.finalPrice || quote.estimatedPrice}</span>
                  </div>
                </div>

                {quote.adminNotes && (
                  <div className="admin-notes">
                    <h4>Admin Notes:</h4>
                    <p>{quote.adminNotes}</p>
                  </div>
                )}
              </div>

              <div className="action-section">
                {action === 'accept' ? (
                  <div className="accept-section">
                    <h3>Accept Quote</h3>
                    <p>By accepting this quote, you confirm your booking with Black Pearl Tours.</p>
                    <button 
                      onClick={handleAccept}
                      disabled={processing}
                      className="btn-accept-large"
                    >
                      {processing ? 'Processing...' : 'Accept Quote & Confirm Booking'}
                    </button>
                  </div>
                ) : (
                  <div className="decline-section">
                    <h3>Decline Quote</h3>
                    <p>If you'd like to decline this quote, please let us know why:</p>
                    
                    <div className="decline-reason">
                      <textarea
                        value={declineReason}
                        onChange={(e) => setDeclineReason(e.target.value)}
                        placeholder="Optional: Please provide a reason for declining..."
                        rows="4"
                      />
                    </div>
                    
                    <button 
                      onClick={handleDecline}
                      disabled={processing}
                      className="btn-decline-large"
                    >
                      {processing ? 'Processing...' : 'Decline Quote'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="response-footer">
            <p>
              <strong>Need help?</strong> Contact us at {process.env.REACT_APP_CONTACT_EMAIL || 'support@blackpearltours.com'}
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default QuoteResponse;
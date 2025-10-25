import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import "../styles/quote.css";
import "../styles/style.css";
import Header from "../components/Header";
import Footer from "../components/Footer";

const Quote = ({ onAuthClick, isLoggedIn, onSignOut, currentUser }) => {
  const [searchParams] = useSearchParams();
  const [vehicleType, setVehicleType] = useState("");
  const [isOneWay, setIsOneWay] = useState(false);
  const [destination, setDestination] = useState("");
  const [showCustomDestination, setShowCustomDestination] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // 'success' or 'error'

  useEffect(() => {
    const vehicleFromUrl = searchParams.get("vehicle");
    if (vehicleFromUrl) {
      setVehicleType(vehicleFromUrl);
    }

    // Minimum date today
    const today = new Date().toISOString().split("T")[0];
    const dateInput = document.getElementById("tripDate");
    if (dateInput) dateInput.min = today;
  }, [searchParams]);

  const handleDestinationChange = (e) => {
    setDestination(e.target.value);
    setShowCustomDestination(e.target.value === "Other (Specify Below)");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // Get form data
      const formData = {
        tripPurpose: document.getElementById("tripPurpose").value,
        tripType: document.getElementById("tripType").value,
        destination: destination,
        customDestination: showCustomDestination ? document.getElementById("customDestination").value : "",
        pickupLocation: document.getElementById("pickupLocation").value,
        dropoffLocation: document.getElementById("dropoffLocation").value,
        vehicleType: document.getElementById("vehicleType").value,
        isOneWay: isOneWay,
        tripDate: document.getElementById("tripDate").value,
        tripTime: document.getElementById("tripTime").value,
        customerName: document.getElementById("customerName").value,
        customerEmail: document.getElementById("customerEmail").value,
        customerPhone: document.getElementById("customerPhone").value,
        customerCompany: document.getElementById("customerCompany").value,
        userId: currentUser ? currentUser.id : null
      };

      // Validation
      const requiredFields = [
        'tripPurpose', 'tripType', 'destination', 'pickupLocation', 
        'dropoffLocation', 'vehicleType', 'tripDate', 'tripTime',
        'customerName', 'customerEmail', 'customerPhone'
      ];

      let isValid = true;
      requiredFields.forEach(field => {
        const element = document.getElementById(field === 'destination' ? 'destination' : 
                              field === 'tripPurpose' ? 'tripPurpose' :
                              field === 'tripType' ? 'tripType' :
                              field === 'pickupLocation' ? 'pickupLocation' :
                              field === 'dropoffLocation' ? 'dropoffLocation' :
                              field === 'vehicleType' ? 'vehicleType' :
                              field === 'tripDate' ? 'tripDate' :
                              field === 'tripTime' ? 'tripTime' :
                              field === 'customerName' ? 'customerName' :
                              field === 'customerEmail' ? 'customerEmail' :
                              'customerPhone');
        if (!element.value.trim()) {
          isValid = false;
          element.style.borderColor = "red";
        } else {
          element.style.borderColor = "#ccc";
        }
      });

      if (!isValid) {
        setMessageType("error");
        setMessage("Please fill in all required fields.");
        setLoading(false);
        return;
      }

      // Submit to backend
      const response = await fetch('http://localhost:5000/api/quotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setMessageType("success");
        setMessage(data.message || "Thank you for your quote request! We will contact you shortly.");
        
        // Reset form
        e.target.reset();
        setVehicleType("");
        setIsOneWay(false);
        setDestination("");
        setShowCustomDestination(false);
      } else {
        setMessageType("error");
        setMessage(data.error || "Failed to submit quote. Please try again.");
      }
    } catch (error) {
      console.error('Quote submission error:', error);
      setMessageType("error");
      setMessage("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
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
        <section className="quote-section" style={{ marginTop: "60px" }}>
          <h1>GET A QUOTE</h1>
          <p className="subtitle">
            Fast, tailored quotes for private coach charters and shuttle services.
            {vehicleType && (
              <>
                <br />
                <small style={{ color: "green", fontWeight: "600" }}>
                  ✓ {vehicleType} pre-selected
                </small>
              </>
            )}
          </p>

          {message && (
            <div className={`message ${messageType}`} style={{
              padding: "1rem",
              borderRadius: "6px",
              marginBottom: "1rem",
              textAlign: "center",
              fontWeight: "600",
              backgroundColor: messageType === "success" ? "#d4edda" : "#f8d7da",
              color: messageType === "success" ? "#155724" : "#721c24",
              border: `1px solid ${messageType === "success" ? "#c3e6cb" : "#f5c6cb"}`
            }}>
              {message}
            </div>
          )}

          <form id="quoteForm" className="quote-form" onSubmit={handleSubmit} noValidate>
            {/* Trip Details */}
            <div className="form-section">
              <h3>Trip Details</h3>

              {/* Purpose of Trip */}
              <div className="input-group">
                <label htmlFor="tripPurpose">Purpose of Trip *</label>
                <select id="tripPurpose" name="tripPurpose" required>
                  <option value="">Select Purpose</option>
                  <option>Personal Use</option>
                  <option>Business / Corporate</option>
                  <option>School or University Trip</option>
                  <option>Event / Wedding</option>
                  <option>Tourism or Sightseeing</option>
                  <option>Other</option>
                </select>
              </div>

              {/* Trip Type */}
              <div className="input-group">
                <label htmlFor="tripType">Trip Type *</label>
                <select id="tripType" name="tripType" required>
                  <option value="">Select Trip Type</option>
                  <option>Airport Transfers</option>
                  <option>Conference Shuttles</option>
                  <option>Sports Travel</option>
                  <option>Events & Leisure</option>
                  <option>Custom Trip</option>
                </select>
              </div>

              {/* Destination */}
              <div className="input-group">
                <label htmlFor="destination">Destination *</label>
                <select
                  id="destination"
                  name="destination"
                  value={destination}
                  onChange={handleDestinationChange}
                  required
                >
                  <option value="">Select Destination</option>
                  <option>Johannesburg</option>
                  <option>Cape Town</option>
                  <option>Durban</option>
                  <option>Bloemfontein</option>
                  <option>Port Elizabeth</option>
                  <option>Pretoria</option>
                  <option>Other (Specify Below)</option>
                </select>
              </div>

              {/* Custom Destination */}
              {showCustomDestination && (
                <input
                  type="text"
                  id="customDestination"
                  placeholder="If 'Other', please specify your destination"
                  style={{ marginBottom: "14px" }}
                />
              )}

              {/* Pickup & Drop-off */}
              <div className="row">
                <input type="text" id="pickupLocation" placeholder="Pickup Location *" required />
                <input type="text" id="dropoffLocation" placeholder="Drop-off Location *" required />
              </div>

              {/* Vehicle Type */}
              <div className="input-group">
                <label htmlFor="vehicleType">Vehicle Type *</label>
                <select
                  id="vehicleType"
                  name="vehicleType"
                  required
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                >
                  <option value="">Select Vehicle Type</option>
                  <option>4 Seater Sedan</option>
                  <option>Mini Bus Mercedes Viano</option>
                  <option>15 Seater Quantum</option>
                  <option>17 Seater Luxury Sprinter</option>
                  <option>22 Seater Luxury Coach</option>
                  <option>28 Seater Luxury Coach</option>
                  <option>39 Seater Luxury Coach</option>
                  <option>60 Seater Semi Luxury</option>
                  <option>70 Seater Semi Luxury</option>
                </select>
              </div>

              {/* Trip Direction Toggle */}
              <div className="toggle-container">
                <span>{isOneWay ? "Both Ways" : "One Way"}</span>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={isOneWay}
                    onChange={() => setIsOneWay(!isOneWay)}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              {/* Date & Time */}
              <div className="row">
                <input type="date" id="tripDate" required />
                <input type="time" id="tripTime" required />
              </div>
            </div>

            <hr />

            {/* Contact Info */}
            <div className="form-section">
              <h3>Contact Info & Details</h3>
              <div className="row">
                <input type="text" id="customerName" placeholder="Name *" required />
                <input type="email" id="customerEmail" placeholder="Email *" required />
                <input type="tel" id="customerPhone" placeholder="Phone *" required />
                <input type="text" id="customerCompany" placeholder="Company" />
              </div>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "SUBMITTING..." : "REQUEST QUOTE"}
            </button>
          </form>
        </section>
      </main>

      {/* Floating Chat Icon */}
      <div className="chat-fab" title="Chat with us">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="5" width="20" height="14" rx="3" fill="#fff" />
          <circle cx="8.5" cy="10.3" r="1.1" fill="#666" />
          <circle cx="15.5" cy="10.3" r="1.1" fill="#666" />
          <rect x="9.5" y="13.6" width="5" height="1.3" rx="0.65" fill="#c1c1c1" />
        </svg>
      </div>

      <Footer />
    </>
  );
};

export default Quote;
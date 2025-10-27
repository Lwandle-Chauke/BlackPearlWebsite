import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import "../styles/quote.css";
import "../styles/style.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ChatWidget from "../chatbot/ChatWidget";

const Quote = ({ onAuthClick, isLoggedIn, onSignOut, currentUser }) => {
  const [searchParams] = useSearchParams();
  const [vehicleType, setVehicleType] = useState("");
  const [tripDirection, setTripDirection] = useState("one-way");
  const [destination, setDestination] = useState("");
  const [showCustomDestination, setShowCustomDestination] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [estimatedPrice, setEstimatedPrice] = useState(0);
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropoffLocation, setDropoffLocation] = useState("");


  useEffect(() => {
    const vehicleFromUrl = searchParams.get("vehicle");
    if (vehicleFromUrl) {
      setVehicleType(vehicleFromUrl);
    }

    // Minimum date today
    const today = new Date().toISOString().split("T")[0];
    const dateInput = document.getElementById("tripDate");
    const returnDateInput = document.getElementById("returnDate");
    if (dateInput) dateInput.min = today;
    if (returnDateInput) returnDateInput.min = today;
  }, [searchParams]);

  const fetchEstimatedPrice = async () => {
    if (!vehicleType || !pickupLocation || !dropoffLocation || !destination) {
      setEstimatedPrice(0);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/quotes/estimate-price', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vehicleType,
          pickupLocation,
          dropoffLocation,
          destination,
          isOneWay: tripDirection === "one-way",
        }),
      });

      const data = await response.json();

      if (data.success) {
        setEstimatedPrice(data.estimatedPrice);
      } else {
        console.error('Failed to fetch estimated price:', data.error);
        setEstimatedPrice(0);
      }
    } catch (error) {
      console.error('Network error fetching estimated price:', error);
      setEstimatedPrice(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEstimatedPrice();
  }, [vehicleType, tripDirection, destination, pickupLocation, dropoffLocation]);

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
        pickupLocation: pickupLocation,
        dropoffLocation: dropoffLocation,
        vehicleType: vehicleType,
        isOneWay: tripDirection === "one-way",
        tripDate: document.getElementById("tripDate").value,
        returnDate: tripDirection === "both-ways" ? document.getElementById("returnDate").value : null,
        tripTime: document.getElementById("tripTime").value,
        customerName: document.getElementById("customerName").value,
        customerEmail: document.getElementById("customerEmail").value,
        customerPhone: document.getElementById("customerPhone").value,
        customerCompany: document.getElementById("customerCompany").value,
        estimatedPrice: estimatedPrice,
        userId: currentUser ? currentUser.id : null
      };

      // Validation
      const requiredFields = [
        'tripPurpose', 'tripType', 'destination', 'pickupLocation',
        'dropoffLocation', 'vehicleType', 'tripDate', 'tripTime',
        'customerName', 'customerEmail', 'customerPhone'
      ];

      if (tripDirection === "both-ways") {
        requiredFields.push('returnDate');
      }

      let isValid = true;
      requiredFields.forEach(field => {
        const element = document.getElementById(field);
        if (element && !element.value.trim()) {
          isValid = false;
          element.style.borderColor = "red";
        } else if (element) {
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
        setTripDirection("one-way");
        setDestination("");
        setShowCustomDestination(false);
        setEstimatedPrice(0);
        setPickupLocation("");
        setDropoffLocation("");
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

          {/* Important Note */}
          <div className="company-note">
            <strong>Important Note:</strong> Our company is based in <strong>Johannesburg and Pretoria</strong>.
            All trips must originate from these areas. Rates for destinations outside Johannesburg and Pretoria
            will be calculated differently and may vary.
          </div>

          {/* Price Estimate Display */}
          {estimatedPrice > 0 && (
            <div className="price-estimate" style={{
              backgroundColor: "#e7f3ff",
              border: "1px solid #b3d9ff",
              borderRadius: "8px",
              padding: "12px 16px",
              marginBottom: "20px",
              fontSize: "16px",
              color: "#0066cc",
              textAlign: "center",
              fontWeight: "600"
            }}>
              Estimated Price: <strong>R {estimatedPrice.toLocaleString()}</strong>
              <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
                {tripDirection === "both-ways" ? "Round trip" : "One way"} • Final price may vary
              </div>
            </div>
          )}

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
                <br />
                <label htmlFor="tripPurpose">Purpose of Trip</label>
                <select id="tripPurpose" name="tripPurpose" required>
                  <option value="">Select Purpose *</option>
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
                <br />
                <label htmlFor="tripType">Trip Type</label>
                <select id="tripType" name="tripType" required>
                  <option value="">Select Trip Type *</option>
                  <option>Airport Transfers</option>
                  <option>Conference Shuttles</option>
                  <option>Sports Travel</option>
                  <option>Events & Leisure</option>
                  <option>Custom Trip</option>
                </select>
              </div>

              {/* Destination */}
              <div className="input-group">
                <br />
                <label htmlFor="destination">Destination</label>
                <select
                  id="destination"
                  name="destination"
                  value={destination}
                  onChange={handleDestinationChange}
                  required
                >
                  <option value="">Select Destination *</option>
                  <option>Johannesburg</option>
                  <option>Pretoria</option>
                  <option>Cape Town</option>
                  <option>Durban</option>
                  <option>Bloemfontein</option>
                  <option>Port Elizabeth</option>
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
                <input
                  type="text"
                  id="pickupLocation"
                  placeholder="Pickup Location *"
                  required
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                />
                <input
                  type="text"
                  id="dropoffLocation"
                  placeholder="Drop-off Location *"
                  required
                  value={dropoffLocation}
                  onChange={(e) => setDropoffLocation(e.target.value)}
                />
              </div>

              {/* Vehicle Type */}
              <div className="input-group">
                <br />
                <label htmlFor="vehicleType">Vehicle Type</label>
                <select
                  id="vehicleType"
                  name="vehicleType"
                  required
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                >
                  <option value="">Select Vehicle Type *</option>
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

              {/* Trip Direction Radio Buttons */}
              <div className="input-group">
                <br />
                <label>Trip Direction</label>
                <div className="radio-group">
                  <label>
                    <input
                      type="radio"
                      name="tripDirection"
                      value="one-way"
                      checked={tripDirection === "one-way"}
                      onChange={() => setTripDirection("one-way")}
                    />
                    One Way
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="tripDirection"
                      value="both-ways"
                      checked={tripDirection === "both-ways"}
                      onChange={() => setTripDirection("both-ways")}
                    />
                    Both Ways
                  </label>
                </div>
              </div>

              {/* Date & Time */}
              <div className="row">
                <input type="date" id="tripDate" required />
                <input type="time" id="tripTime" required />
              </div>

              {/* Return Date for Both Ways */}
              {tripDirection === "both-ways" && (
                <div className="input-group">
                  <br />
                  <label htmlFor="returnDate">Return Date *</label>
                  <input
                    type="date"
                    id="returnDate"
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              )}
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
      <Footer />

      <ChatWidget />

    </>
  );
};

export default Quote;

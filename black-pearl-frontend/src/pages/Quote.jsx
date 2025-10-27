import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import "../styles/quote.css";
import "../styles/style.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ChatWidget from "../chatbot/ChatWidget";

const Quote = ({ onAuthClick, isLoggedIn, onSignOut, currentUser }) => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [estimatedPrice, setEstimatedPrice] = useState(0);

  // Form state - all fields managed by React
  const [formData, setFormData] = useState({
    vehicleType: "",
    tripDirection: "one-way",
    destination: "",
    customDestination: "",
    showCustomDestination: false,
    pickupLocation: "",
    dropoffLocation: "",
    tripPurpose: "",
    tripType: "",
    tripDate: "",
    returnDate: "",
    tripTime: "",
    customerName: currentUser?.name || "",
    customerEmail: currentUser?.email || "",
    customerPhone: currentUser?.phone || "",
    customerCompany: ""
  });

  useEffect(() => {
    const vehicleFromUrl = searchParams.get("vehicle");
    if (vehicleFromUrl) {
      setFormData(prev => ({ ...prev, vehicleType: vehicleFromUrl }));
    }

    // Set minimum dates
    const today = new Date().toISOString().split("T")[0];
    setFormData(prev => ({
      ...prev,
      tripDate: prev.tripDate || today,
      returnDate: prev.returnDate || today
    }));
  }, [searchParams, currentUser]);

  // Handle all input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Special handling for destination
    if (name === 'destination') {
      const showCustom = value === "Other (Specify Below)";
      setFormData(prev => ({
        ...prev,
        destination: value,
        showCustomDestination: showCustom,
        customDestination: showCustom ? prev.customDestination : ""
      }));
    }
  };

  const fetchEstimatedPrice = async () => {
    const { vehicleType, pickupLocation, dropoffLocation, destination, tripDirection } = formData;

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
          destination: formData.showCustomDestination ? formData.customDestination : destination,
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
  }, [formData.vehicleType, formData.tripDirection, formData.destination, formData.customDestination, formData.pickupLocation, formData.dropoffLocation]);

  // Enhanced validation
  const validateForm = () => {
    const errors = [];
    const {
      tripPurpose, tripType, destination, pickupLocation, dropoffLocation,
      vehicleType, tripDate, tripTime, customerName, customerEmail, customerPhone,
      tripDirection, returnDate, showCustomDestination, customDestination
    } = formData;

    // Required fields validation
    if (!tripPurpose) errors.push("Trip purpose is required");
    if (!tripType) errors.push("Trip type is required");
    if (!destination) errors.push("Destination is required");
    if (showCustomDestination && !customDestination) errors.push("Please specify your custom destination");
    if (!pickupLocation) errors.push("Pickup location is required");
    if (!dropoffLocation) errors.push("Drop-off location is required");
    if (!vehicleType) errors.push("Vehicle type is required");
    if (!tripDate) errors.push("Trip date is required");
    if (!tripTime) errors.push("Trip time is required");
    if (!customerName) errors.push("Name is required");
    if (!customerEmail) errors.push("Email is required");
    if (!customerPhone) errors.push("Phone is required");
    if (tripDirection === "both-ways" && !returnDate) errors.push("Return date is required for round trips");

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (customerEmail && !emailRegex.test(customerEmail)) {
      errors.push("Please enter a valid email address");
    }

    // Date validation
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(tripDate);
    if (selectedDate < today) {
      errors.push("Trip date cannot be in the past");
    }

    if (tripDirection === "both-ways" && returnDate) {
      const returnDateObj = new Date(returnDate);
      const tripDateObj = new Date(tripDate);
      if (returnDateObj < tripDateObj) {
        errors.push("Return date cannot be before trip date");
      }
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // Validate form
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setMessageType("error");
      setMessage(validationErrors.join(". "));
      setLoading(false);
      return;
    }

    try {
      // Prepare submission data
      const submissionData = {
        ...formData,
        // Use custom destination if "Other" was selected
        destination: formData.showCustomDestination ? formData.customDestination : formData.destination,
        isOneWay: formData.tripDirection === "one-way",
        estimatedPrice: estimatedPrice,
        userId: currentUser ? currentUser.id : null,
        // Remove internal state fields
        showCustomDestination: undefined
      };

      // Submit to backend
      const response = await fetch('http://localhost:5000/api/quotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      const data = await response.json();

      if (data.success) {
        setMessageType("success");
        setMessage(data.message || "Thank you for your quote request! We will contact you shortly.");

        // Reset form
        setFormData({
          vehicleType: "",
          tripDirection: "one-way",
          destination: "",
          customDestination: "",
          showCustomDestination: false,
          pickupLocation: "",
          dropoffLocation: "",
          tripPurpose: "",
          tripType: "",
          tripDate: "",
          returnDate: "",
          tripTime: "",
          customerName: currentUser?.name || "",
          customerEmail: currentUser?.email || "",
          customerPhone: currentUser?.phone || "",
          customerCompany: ""
        });
        setEstimatedPrice(0);
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

  // Get today's date for min attribute
  const today = new Date().toISOString().split('T')[0];

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
            {formData.vehicleType && (
              <>
                <br />
                <small style={{ color: "green", fontWeight: "600" }}>
                  ✓ {formData.vehicleType} pre-selected
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
            <div className="price-estimate">
              Estimated Price: <strong>R {estimatedPrice.toLocaleString()}</strong>
              <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
                {formData.tripDirection === "both-ways" ? "Round trip" : "One way"} • Final price may vary
              </div>
            </div>
          )}

          {message && (
            <div className={`message ${messageType}`}>
              {message}
            </div>
          )}

          <form className="quote-form" onSubmit={handleSubmit} noValidate>
            {/* Trip Details */}
            <div className="form-section">
              <h3>Trip Details</h3>

              {/* Purpose of Trip */}
              <div className="input-group">
                <label htmlFor="tripPurpose">Purpose of Trip</label>
                <select
                  id="tripPurpose"
                  name="tripPurpose"
                  value={formData.tripPurpose}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Purpose *</option>
                  <option value="Personal Use">Personal Use</option>
                  <option value="Business / Corporate">Business / Corporate</option>
                  <option value="School or University Trip">School or University Trip</option>
                  <option value="Event / Wedding">Event / Wedding</option>
                  <option value="Tourism or Sightseeing">Tourism or Sightseeing</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Trip Type */}
              <div className="input-group">
                <label htmlFor="tripType">Trip Type</label>
                <select
                  id="tripType"
                  name="tripType"
                  value={formData.tripType}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Trip Type *</option>
                  <option value="Airport Transfers">Airport Transfers</option>
                  <option value="Conference Shuttles">Conference Shuttles</option>
                  <option value="Sports Travel">Sports Travel</option>
                  <option value="Events & Leisure">Events & Leisure</option>
                  <option value="Custom Trip">Custom Trip</option>
                </select>
              </div>

              {/* Destination */}
              <div className="input-group">
                <label htmlFor="destination">Destination</label>
                <select
                  id="destination"
                  name="destination"
                  value={formData.destination}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Destination *</option>
                  <option value="Johannesburg">Johannesburg</option>
                  <option value="Pretoria">Pretoria</option>
                  <option value="Cape Town">Cape Town</option>
                  <option value="Durban">Durban</option>
                  <option value="Bloemfontein">Bloemfontein</option>
                  <option value="Port Elizabeth">Port Elizabeth</option>
                  <option value="Other (Specify Below)">Other (Specify Below)</option>
                </select>
              </div>

              {/* Custom Destination */}
              {formData.showCustomDestination && (
                <input
                  type="text"
                  name="customDestination"
                  placeholder="Please specify your destination *"
                  value={formData.customDestination}
                  onChange={handleInputChange}
                  required
                />
              )}

              {/* Pickup & Drop-off */}
              <div className="row">
                <input
                  type="text"
                  name="pickupLocation"
                  placeholder="Pickup Location *"
                  value={formData.pickupLocation}
                  onChange={handleInputChange}
                  required
                />
                <input
                  type="text"
                  name="dropoffLocation"
                  placeholder="Drop-off Location *"
                  value={formData.dropoffLocation}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Vehicle Type */}
              <div className="input-group">
                <label htmlFor="vehicleType">Vehicle Type</label>
                <select
                  id="vehicleType"
                  name="vehicleType"
                  value={formData.vehicleType}
                  onChange={handleInputChange}
                  required
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

              {/* Trip Direction Radio Buttons */}
              <div className="input-group">
                <label>Trip Direction</label>
                <div className="radio-group">
                  <label>
                    <input
                      type="radio"
                      name="tripDirection"
                      value="one-way"
                      checked={formData.tripDirection === "one-way"}
                      onChange={handleInputChange}
                    />
                    One Way
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="tripDirection"
                      value="both-ways"
                      checked={formData.tripDirection === "both-ways"}
                      onChange={handleInputChange}
                    />
                    Both Ways
                  </label>
                </div>
              </div>

              {/* Date & Time */}
              <div className="row">
                <input
                  type="date"
                  name="tripDate"
                  value={formData.tripDate}
                  onChange={handleInputChange}
                  min={today}
                  required
                />
                <input
                  type="time"
                  name="tripTime"
                  value={formData.tripTime}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Return Date for Both Ways */}
              {formData.tripDirection === "both-ways" && (
                <div className="input-group">
                  <label htmlFor="returnDate">Return Date *</label>
                  <input
                    type="date"
                    name="returnDate"
                    value={formData.returnDate}
                    onChange={handleInputChange}
                    min={formData.tripDate || today}
                    required
                  />
                </div>
              )}
            </div>

            <hr />

            {/* Contact Info */}
            <div className="form-section">
              <h3>Contact Info & Details</h3>
              <div className="row">
                <input
                  type="text"
                  name="customerName"
                  placeholder="Name *"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  required
                />
                <input
                  type="email"
                  name="customerEmail"
                  placeholder="Email *"
                  value={formData.customerEmail}
                  onChange={handleInputChange}
                  required
                />
                <input
                  type="tel"
                  name="customerPhone"
                  placeholder="Phone *"
                  value={formData.customerPhone}
                  onChange={handleInputChange}
                  required
                />
                <input
                  type="text"
                  name="customerCompany"
                  placeholder="Company"
                  value={formData.customerCompany}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "SUBMITTING..." : "REQUEST QUOTE"}
            </button>
          </form>
        </section>
      </main>

      <Footer />
      <ChatWidget />
    </>
  );
};

export default Quote;
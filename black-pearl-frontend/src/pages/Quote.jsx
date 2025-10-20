import React, { useEffect } from "react";
import "../styles/quote.css";
import "../styles/style.css"; // Move all your styles from <style> to this file
import Header from "../components/Header";
import Footer from "../components/Footer";
import AuthModal from "../components/AuthModal";


const Quote = () => {

  // Helper to get URL parameter
  const getUrlParameter = (name) => {
    const params = new URLSearchParams(window.location.search);
    return params.get(name) || "";
  };

  useEffect(() => {
    // Pre-select vehicle type if provided in URL
    const vehicleType = getUrlParameter("vehicle");
    if (vehicleType) {
      const vehicleSelect = document.getElementById("vehicleType");
      if (vehicleSelect) {
        Array.from(vehicleSelect.options).forEach((opt, idx) => {
          if (opt.text === vehicleType) {
            vehicleSelect.selectedIndex = idx;
            const subtitle = document.querySelector(".subtitle");
            if (subtitle) {
              subtitle.innerHTML += ` <br><small style="color: green; font-weight: 600;">✓ ${vehicleType} pre-selected</small>`;
            }
          }
        });
      }
    }

    // Set minimum date to today
    const today = new Date().toISOString().split("T")[0];
    const dateInput = document.getElementById("tripDate");
    if (dateInput) dateInput.min = today;

    // Form submission handler
    const quoteForm = document.getElementById("quoteForm");
    if (quoteForm) {
      quoteForm.addEventListener("submit", (e) => {
        e.preventDefault();
        let isValid = true;
        quoteForm.querySelectorAll("[required]").forEach((field) => {
          if (!field.value.trim()) {
            isValid = false;
            field.style.borderColor = "red";
          } else {
            field.style.borderColor = "#ccc";
          }
        });

        if (isValid) {
          alert("Thank you for your quote request! We will contact you shortly.");
          quoteForm.reset();
          const vehicleSelect = document.getElementById("vehicleType");
          if (vehicleSelect) vehicleSelect.selectedIndex = 0;
        } else {
          alert("Please fill in all required fields.");
        }
      });
    }
  }, []);

  return (
    <>
      <Header />
      <AuthModal />

      <main className="quote-page">
        <section className="quote-section" style={{ marginTop: "60px" }}>
          <div className="section-title">
            <h1>GET A QUOTE</h1>
            <p className="subtitle">
              Fast, tailored quotes for private coach charters and shuttle services.
            </p>
          </div>

          <form id="quoteForm" className="quote-form" noValidate>
            {/* Trip Details */}
            <div className="form-section">
              <h3>Trip Details</h3>

              <div className="input-group">
                <label htmlFor="tripType">Trip Type</label>
                <select id="tripType" name="tripType" required>
                  <option value="">Select Trip Type</option>
                  <option>Airport Transfers</option>
                  <option>Conference Shuttles</option>
                  <option>Sports Travel</option>
                  <option>Events & Leisure</option>
                </select>
              </div>

              <div className="row">
                <input type="text" id="pickupLocation" placeholder="Pickup Location" required />
                <input type="text" id="dropoffLocation" placeholder="Drop-off Location" required />
              </div>

              <div className="input-group">
                <label htmlFor="vehicleType">Vehicle Type</label>
                <select id="vehicleType" name="vehicleType" required>
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

              <div className="toggle-container">
                <span>One-Way</span>
                <label className="switch">
                  <input type="checkbox" id="oneWay" />
                  <span className="slider"></span>
                </label>
              </div>

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
                <input type="text" id="customerName" placeholder="Name" required />
                <input type="email" id="customerEmail" placeholder="Email" required />
                <input type="tel" id="customerPhone" placeholder="Phone (required)" required />
                <input type="text" id="customerCompany" placeholder="Company" />
              </div>
            </div>

            <button type="submit" className="submit-btn">REQUEST QUOTE</button>
          </form>
        </section>
      </main>

      {/* Floating Chat Icon */}
      <div className="chat-fab" title="Chat with us">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
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

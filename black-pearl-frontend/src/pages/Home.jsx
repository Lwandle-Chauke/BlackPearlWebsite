
import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/style.css'; // Global/Utility styles
import '../styles/home.css'; // Specific styles for this component
import ChatWidget from "../chatbot/ChatWidget";

const Home = ({ onAuthClick, isLoggedIn, onSignOut, currentUser }) => {
  return (
    <>
      {/* FIXED: Added missing onSignOut prop */}
      <Header 
        onAuthClick={onAuthClick} 
        isLoggedIn={isLoggedIn} 
        user={currentUser}
        onSignOut={onSignOut}
      />
      
      {/* HERO - Uses styles from Home.css */}
      <section className="hero" role="banner" aria-label="Welcome hero">
        <div className="hero-inner wrap">
          <div className="eyebrow">WELCOME TO,</div>
          <h1> 
            <b>BLACK PEARL COACH CHARTERS</b>
            <br /> 
            AND TOURS 
          </h1>
          <Link className="cta" to="/quote">REQUEST A QUOTE</Link>
        </div>
      </section>

      {/* Main content */}
      <main className="wrap">
        
        {/* About Us - This section MUST wrap the Tours div to match the old HTML DOM structure */}
        <section className="about-section">
          <div className="section-title">
            <h2>ABOUT US</h2>
          </div>
          
          {/* Paragraph 1: Replaces inline style: font-weight:700;margin:0 0 8px 0; */}
          <p className="about-intro"> 
            At Black Pearl Coach Charters and Tours, we believe arranging passenger transport should be a simple, stress-free experience. To deliver on this promise, we have partnered with a nationwide network of reputable providers, allowing us to offer you affordable rates and exceptional value for money.
          </p>

          {/* Paragraph 2: Replaces inline style: margin-top:10px; */}
          <p className="about-body">
            We go out of our way to present a variety of options to suit your specific needs and budget. Our core mission is to provide safe, reliable, and comfortable transport for any occasion, underpinned by our commitment to trust and customer satisfaction.
          </p>

          {/* The original HTML also had a misplaced closing </div> here, which closed a container 
              around the text but was followed by the CTA-read and then the tours section, 
              which was still *inside* <section class="about-section"> in the HTML.
              We simplify by placing the CTA outside the text block.
          */}
          <Link className="cta-read" to="/about" aria-label="Read more about us">
            READ MORE
          </Link>

          {/* Tours Section - KEPT INSIDE <section className="about-section"> as per original HTML structure */}
          <div className="tours">
            <div className="section-title">
              <h2>TOURS</h2>
            </div>

            <p>
              We specialise in tailored transport for every group need. Our services include comfortable sports team travel, efficient conference shuttles, memorable leisure group tours, and reliable airport transfers, all designed for safety, comfort, and punctuality.
            </p>

            {/* Paragraph 2: Replaces inline style: font-weight:600; */}
            <p className="tours-callout"> 
              See our fleet in action! Browse our gallery to view real photos from our completed tours and events.
            </p>

            <Link className="cta-read" to="/fleet" aria-label="View our fleet">
              VIEW OUR FLEET
            </Link>
            <br />
          </div>

          {/* Terms and Conditions Section - ADDED AFTER TOURS */}
          <div className="terms-section">
            <div className="section-title">
              <h2>TERMS & CONDITIONS</h2>
            </div>

            <p>
              Please review our comprehensive Terms and Conditions of Hire before booking our services. Our terms cover important information about payments, cancellations, refund policies, liabilities, and your responsibilities as a customer.
            </p>

            <button 
              className="terms-pdf-btn"
              onClick={() => window.open('/documents/terms-and-conditions.pdf', '_blank')}
            >
              📄 View Terms and Conditions PDF
            </button>
          </div>
        </section> {/* </section> now closes the entire content block */}

        {/* spacer - Keeping for layout */}
        <div style={{ height: '22px' }}></div>
      </main>

      {/* Floating chat icon - Now uses Home.css for styling */}
      <Footer />
      <ChatWidget />
    </>
  );
};

export default Home;

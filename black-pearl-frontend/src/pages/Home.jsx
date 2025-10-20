import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AuthModal from '../components/AuthModal';
import '../styles/style.css'; // Global/Utility styles
import '../styles/home.css'; // Specific styles for this component

const Home = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  return (
    <>
      <Header onSignInClick={openAuthModal} />
      
      {isAuthModalOpen && <AuthModal onClose={closeAuthModal} />}

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
            <hr />
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
              <hr />
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
          </div>
        </section> {/* </section> now closes the entire content block */}

        {/* spacer - Keeping for layout */}
        <div style={{ height: '22px' }}></div>
      </main>

      {/* Floating chat icon - Now uses Home.css for styling */}
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

export default Home;
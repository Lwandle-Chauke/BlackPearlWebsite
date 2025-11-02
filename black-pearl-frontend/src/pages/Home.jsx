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
      <Header 
        onAuthClick={onAuthClick} 
        isLoggedIn={isLoggedIn} 
        user={currentUser}
      />
      
      {/* HERO */}
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

      {/* MAIN CONTENT */}
      <main className="wrap">
        
        <section className="about-section">

          {/* ✅ OUR FLEET SECTION */}
<div className="fleet-preview">
  <div className="section-title">
    <h2>OUR FLEET</h2>
  </div>

  <div className="home-fleet-grid">
    {/* First 3 vehicles */}
    <div className="vehicle-card">
      <img src="/_images/4 seater sedan.png" alt="4 Seater Sedan" />
      <div className="card-content">
        <h3>4 Seater Sedan</h3>
        <p>Compact and affordable option for small groups or individuals</p>
        <Link 
          to="/quote?vehicle=4%20Seater%20Sedan" 
          className="explore-btn"
          aria-label="Book 4 Seater Sedan"
        >
          Book Now
        </Link>
        <br />
        <br />
      </div>
    </div>

    <div className="vehicle-card">
      <img src="/_images/minibus mercedes viano.png" alt="Minibus Mercedes Viano" />
      <div className="card-content">
        <h3>Minibus Mercedes Viano</h3>
        <p>Ideal for smaller groups with luxury comfort</p>
        <Link 
          to="/quote?vehicle=Minibus%20Mercedes%20Viano" 
          className="explore-btn"
          aria-label="Book Minibus Mercedes Viano"
        >
          Book Now
        </Link>
        <br />
      </div>
    </div>

    <div className="vehicle-card">
      <img src="/_images/15 seater quantum.png" alt="15 Seater Quantum" />
      <div className="card-content">
        <h3>15 Seater Quantum</h3>
        <p>Versatile for group and family use</p>
        <br />
        <Link 
          to="/quote?vehicle=15%20Seater%20Quantum" 
          className="explore-btn"
          aria-label="Book 15 Seater Quantum"
        >
          Book Now
        </Link>
      </div>
    </div>
  </div>
  <br />

  <div className="explore-btn-wrap">
    <Link to="/fleet" className="explore-btn" aria-label="Explore full fleet">
      Explore More
    </Link>
  </div>
</div>

          
          <div className="section-title">
            <h2>ABOUT US</h2>
          </div>
          
          <p className="about-intro"> 
            BlackPearl Coach Charters and Tours is an exceptional passenger transport company based in Roodepoort, Gauteng. We specialise in providing safe, reliable, and comfortable transportation services for corporate, government, and private clients.
          </p>

          <p className="about-body">
            We go out of our way to present a variety of options to suit your specific needs and budget. Our core mission is to provide safe, reliable, and comfortable transport for any occasion, underpinned by our commitment to trust and customer satisfaction.
          </p>

          <Link className="cta-read" to="/about" aria-label="Read more about us">
            READ MORE
          </Link>

          {/* TOURS SECTION */}
          <div className="tours">
            <div className="section-title">
              <h2>TOURS</h2>
            </div>

            <p>
              We specialise in tailored transport for every group need. Our services include comfortable sports team travel, efficient conference shuttles, memorable leisure group tours, and reliable airport transfers, all designed for safety, comfort, and punctuality.
            </p>

            <p className="tours-callout"> 
              See our fleet in action! Browse our gallery to view real photos from our completed tours and events.
            </p>

            <Link className="cta-read" to="/fleet" aria-label="View our fleet">
              VIEW OUR FLEET
            </Link>
            <br />
          </div>


          {/* TERMS & CONDITIONS */}
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
        </section>

        <div style={{ height: '22px' }}></div>
      </main>

      <Footer />
      <ChatWidget />
    </>
  );
};

export default Home;
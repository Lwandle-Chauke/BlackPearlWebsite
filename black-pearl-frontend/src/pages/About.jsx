import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AuthModal from '../components/AuthModal';
import "../styles/about.css";
import "../styles/style.css";

const About = () => {
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    const openAuthModal = () => setIsAuthModalOpen(true);
    const closeAuthModal = () => setIsAuthModalOpen(false);

    return (
        <>
            <Header onSignInClick={openAuthModal} />
            
            {isAuthModalOpen && <AuthModal onClose={closeAuthModal} />}

            <div className="about-container">
                <article className="about-panel">
                    {/* Replaced inline style with class 'main-title' */}
                    <h1 className="main-title">ABOUT US</h1>

                    <section>
                        <h2 className="section-title">Our Mission</h2>
                        <p>At Black Pearl Coach Charters and Tours, our mission is simple: to make passenger transport arranging a seamless, reliable, and affordable experience. We believe that whether you're travelling for business, sports, or leisure, your journey should be comfortable, safe, and stress-free from start to finish.</p>
                    </section>

                    <section>
                        <h2 className="section-title">Who We Are?</h2>
                        <p>We are a trusted provider of luxury coach charters and shuttle services based in Roodepoort, serving clients across South Africa. To achieve our goal of offering nationwide, value-driven services, we have strategically affiliated ourselves with a network of reputable service providers. This allows us to present our customers with various options to perfectly suit their specific needs and budget, without compromising on quality or reliability.</p>
                    </section>

                    <section>
                        <h2 className="section-title">Our Promise</h2>
                        <ul className="promises">
                            <li><strong>Reliability:</strong> We pride ourselves on being on time, every time.</li>
                            <li><strong>Affordability:</strong> Competitive and affordable rates.</li>
                            <li><strong>Custom Solutions:</strong> Tailored transport solutions for groups of any size.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="section-title">Commitment to Transformation</h2>
                        <p>Black Pearl Consultancy (PTY) Ltd is a proud Vericom-rated Level 3 BEE Contributor. This status allows corporate clients to claim a portion of their procurement spend on bookings with us, making us not just a transport partner, but a strategic choice for your business.</p>
                    </section>

                    <section>
                        <h2 className="section-title">Why Choose Us?</h2>
                        <ul>
                            <li><strong>Nationwide Coverage:</strong> Reliable services across the country.</li>
                            <li><strong>Professional Drivers:</strong> Experienced and safety-focused drivers.</li>
                            <li><strong>Diverse Fleet:</strong> Well-maintained vehicles for small groups up to full-size coaches.</li>
                            <li><strong>Customer-Centric Approach:</strong> Simple booking and exceptional service from first inquiry to destination.</li>
                        </ul>
                        {/* Ensure links use the React <Link> component */}
                        <p>Ready to experience reliable and luxurious transport? <Link to="/quote">Get a Free Quote</Link> or <Link to="/contact">Contact Us</Link> today to discuss your needs.</p>
                    </section>
                </article>
            </div>

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

export default About;
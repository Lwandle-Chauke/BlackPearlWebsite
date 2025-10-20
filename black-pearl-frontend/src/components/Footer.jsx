import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="wrap footer-inner">
        <div className="footer-block">
          <div className="logo-sm">BLACK PEARL COACH CHARTERS AND TOURS</div>
        </div>

        <div className="footer-block">
          <h3>QUICK LINKS</h3>
          <Link to="/fleet">View Our Fleet</Link>
          <Link to="/gallery">Browse Gallery</Link>
          <Link to="/quote">Get A Quote</Link>
          <Link to="/contact">Contact Us</Link>
        </div>

        <div className="footer-block">
          <h3>OUR SERVICES</h3>
          <Link to="#">Airport Transfers</Link>
          <Link to="#">Conference Shuttle Hire</Link>
          <Link to="#">Sports Tours</Link>
          <Link to="#">Events & Leisure Travel</Link>
        </div>
      </div>

      <div className="bottom-bar">2025 Black Pearl Coach Charters and Tours | All Rights Reserved</div>
    </footer>
  );
};

export default Footer;

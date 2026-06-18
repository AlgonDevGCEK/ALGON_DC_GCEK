import React from "react";
import "./Footer.css";
import { FaInstagram, FaGithub, FaLinkedinIn } from "react-icons/fa";
import { NavLink } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="footer">
      {/* Top social bar */}
      <div className="footer-top animate-fade-in">
        <span>Get connected with us on social networks:</span>
        <div className="social-icons">
           <a href="https://www.instagram.com/algondc_gcek/" target="_blank" rel="noopener noreferrer" className="social-icon-link" style={{ animationDelay: '0.1s' }}>
            <FaInstagram />
           </a>
           <a href="https://github.com/AlgonDevGCEK" target="_blank" rel="noopener noreferrer" className="social-icon-link" style={{ animationDelay: '0.2s' }}>
            <FaGithub />
          </a>
          <a href="https://www.linkedin.com/company/algon-dc-gcek/" target="_blank" rel="noopener noreferrer" className="social-icon-link" style={{ animationDelay: '0.3s' }}>
            <FaLinkedinIn />
          </a>
        </div>
      </div>

      {/* Main footer */}
      <div className="footer-content">
        
        {/* Column 1: About Platform */}
        <div className="footer-column animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <h4>Algon Solutions</h4>
          <p>
            A modern technology company building digital platforms, AI solutions, web experiences, cybersecurity systems, and growth focused products
          </p>
          <br />
          <a href="https://algonsolutions.com/" target="_blank" rel="noopener noreferrer" className="footer-ghost-btn">
            Know more
          </a>
        </div>

        {/* Column 2: Policies */}
        <div className="footer-column animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <h4>Policies</h4>
          <ul>
            <li><NavLink to="/terms-and-conditions">Terms & Conditions</NavLink></li>
            <li><NavLink to="/privacy-policy">Privacy Policy</NavLink></li>
            <li><NavLink to="/refund-policy">Refund Policy</NavLink></li>
            <li><NavLink to="/code-of-conduct">Code of Conduct</NavLink></li>
          </ul>
        </div>

        {/* Column 3: Creators */}
        <div className="footer-column animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <h4>Creators</h4>
          <div className="creators">
              <a href="https://github.com/Amal-nellanhi" target="_blank" rel="noopener noreferrer" className="creator-link" style={{ animationDelay: '0.5s' }}>
              <img src="https://github.com/Amal-nellanhi.png" alt="Amal GitHub" className="creator-icon" />
            </a>
              <a href="https://github.com/Alan-AJ-dev" target="_blank" rel="noopener noreferrer" className="creator-link" style={{ animationDelay: '0.6s' }}>
              <img src="https://github.com/Alan-AJ-dev.png" alt="Alan GitHub" className="creator-icon" />
            </a>
          </div>
        </div>

      </div>

      {/* Bottom bar */}
      <div className="footer-bottom animate-fade-in" style={{ animationDelay: '0.7s' }}>
        © {new Date().getFullYear()} ALGON DC GCEK • All Rights Reserved
      </div>
    </footer>
  );
};

export default Footer;
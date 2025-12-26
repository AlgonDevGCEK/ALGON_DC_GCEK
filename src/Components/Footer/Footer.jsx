import React from "react";
import "./Footer.css";
import { FaInstagram, FaGithub, FaLinkedinIn } from "react-icons/fa";
import { NavLink, useNavigate } from "react-router-dom";
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
        <div className="footer-column animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <h4>Algon Developer Community</h4>
          <p>
            Multidisciplinary platform integrating business, media, finance, fasion, development, marketing, coding, and more
          </p>
          <br></br>
          <a href="https://algondevelopercommunity.com/" className="footer-btn">Know more</a>
        </div>

        <div className="footer-column animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <h4>Policies</h4>
          <ul>
            <li><NavLink to="/terms-and-conditions">Terms & Conditions</NavLink></li>
            <li><NavLink to="/privacy-policy">Privacy Policy</NavLink></li>
            <li><NavLink to="/refund-policy">Refund Policy</NavLink></li>
            <li><NavLink to="/code-of-conduct">Code of Conduct</NavLink></li>
          </ul>
        </div>

        <div className="footer-column animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <h4>Useful Links</h4>
          <ul>
            <li><NavLink to="/about">About Us</NavLink></li>
           <li><NavLink to="/gallery">Gallery</NavLink></li>
            <li><NavLink to="/contact">Contact Us</NavLink></li>
            <li><NavLink to="/signup">Join Us</NavLink></li>
          </ul>
        </div>

        <div className="footer-column animate-slide-up" style={{ animationDelay: '0.5s' }}>
          <h4>Contact</h4>
          <p>📍 Government College of Engineering Kannur</p>
            <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Mangattuparamba</p>
            <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Parassinikadavu P.O.</p>
            <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Kannur, Kerala</p>
            <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;670563</p>
          <br></br>
          <p>✉️&nbsp;&nbsp;adcgcek25@gmail.com</p><br></br>
        </div>

        <div className="footer-column animate-slide-up" style={{ animationDelay: '0.6s' }}>
          <h4>Creators</h4>
          <div className="creators">
              <a href="https://github.com/Amal-nellanhi" target="_blank" rel="noopener noreferrer" className="creator-link" style={{ animationDelay: '0.7s' }}>
              <img src="https://github.com/Amal-nellanhi.png" alt="Amal GitHub" className="creator-icon" />
            </a>
              <a href="https://github.com/alanaj77" target="_blank" rel="noopener noreferrer" className="creator-link" style={{ animationDelay: '0.8s' }}>
              <img src="https://github.com/alanaj77.png" alt="Alan GitHub" className="creator-icon" />
            </a>
          </div>
      </div>
    </div>

      {/* Bottom bar */}
      <div className="footer-bottom animate-fade-in" style={{ animationDelay: '0.9s' }}>
        © {new Date().getFullYear()} ALGON DC GCEK • All Rights Reserved
      </div>
    </footer>
  );
};

export default Footer;
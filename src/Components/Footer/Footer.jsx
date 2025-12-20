import React from "react";
import "./Footer.css";
import { FaInstagram, FaGithub, FaLinkedinIn } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="footer">
      {/* Top social bar */}
      <div className="footer-top">
        <span>Get connected with us on social networks:</span>
        <div className="social-icons">
           <a href="https://instagram.com/algondc" target="_blank" rel="noopener noreferrer">
            <FaInstagram />
           </a>
           <a href="https://github.com/AlgonDevGCEK" target="_blank" rel="noopener noreferrer">
            <FaGithub />
          </a>
          <a href="https://linkedin.com/company/algondc" target="_blank" rel="noopener noreferrer">
            <FaLinkedinIn />
          </a>
        </div>
      </div>

      {/* Main footer */}
      <div className="footer-content">
        <div className="footer-column">
          <h4>ALGON DC</h4>
          <p>
            A student-driven tech community focused on learning, building,
            and growing together through real-world projects.
          </p>
        </div>

        <div className="footer-column">
          <h4>Programs</h4>
          <ul>
            <li>Workshops</li>
            <li>Hackathons</li>
            <li>Projects</li>
            <li>Community Events</li>
          </ul>
        </div>

        <div className="footer-column">
          <h4>Useful Links</h4>
          <ul>
            <li>About Us</li>
            <li>Gallery</li>
            <li>Contact</li>
            <li>Join Us</li>
          </ul>
        </div>

        <div className="footer-column">
          <h4>Contact</h4>
          <p>📍 Government College of Engineering Kannur</p>
            <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Mangattuparamba</p>
            <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Parassinikadavu P.O.</p>
            <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Kannur, Kerala</p>
            <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;670563</p>
          <p>✉️ algondc@example.com</p>
          <p>📞 +91 98765 43210</p>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="footer-bottom">
        © {new Date().getFullYear()} ALGON DC • All Rights Reserved
      </div>
    </footer>
  );
};

export default Footer;

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
           <a href="https://www.instagram.com/algondc_gcek/" target="_blank" rel="noopener noreferrer">
            <FaInstagram />
           </a>
           <a href="https://github.com/AlgonDevGCEK" target="_blank" rel="noopener noreferrer">
            <FaGithub />
          </a>
          <a href="https://www.linkedin.com/company/algon-dc-gcek/" target="_blank" rel="noopener noreferrer">
            <FaLinkedinIn />
          </a>
        </div>
      </div>

      {/* Main footer */}
      <div className="footer-content">
        <div className="footer-column">
          <h4>Algon Developer Community</h4>
          <p>
            Multidisciplinary platform integrating business, media, finance, fasion, development, marketing, coding, and more
          </p>
          <br></br>
          <a href="https://algondevelopercommunity.com/" className="footer-btn">Know more</a>

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
          <br></br>
          <p>✉️&nbsp;&nbsp;adcgcek25@gmail.com</p><br></br>
        </div>

        <div className="footer-column">
          <h4>Creators</h4>
          <div className="creators">
              <a href="https://github.com/Amal-nellanhi" target="_blank" rel="noopener noreferrer">
              <img src="https://github.com/Amal-nellanhi.png" alt="Amal GitHub" className="creator-icon" />
            </a>
              <a href="https://github.com/alanaj77" target="_blank" rel="noopener noreferrer">
              <img src="https://github.com/alanaj77.png" alt="Alan GitHub" className="creator-icon" />
            </a>
          </div>
      </div>
    </div>

      {/* Bottom bar */}
      <div className="footer-bottom">
        © {new Date().getFullYear()} ALGON DC GCEK • All Rights Reserved
      </div>
    </footer>
  );
};

export default Footer;

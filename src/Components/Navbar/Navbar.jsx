import React, { useState } from 'react';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav>
      {/* Hamburger button (only visible on mobile) */}
      <button className="hamburger" onClick={() => setIsOpen(!isOpen)}>
        ☰
      </button>

      {/* Navigation links */}
      <ul className={`nav-links ${isOpen ? 'open' : ''}`}>
        <li><a href="#home">Home</a></li>
        <li><a href="#upcomming-programs">Programs</a></li>
        <li><a href="#about">About us</a></li>
        <li><a href="#campus">Gallery</a></li>
        <li><a href="#testimonials">Contact us</a></li>
        <li><button className="btn">Login</button></li>
      </ul>
    </nav>
  );
};

export default Navbar;
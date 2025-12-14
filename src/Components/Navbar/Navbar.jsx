import React, { useState , useEffect, useRef} from 'react';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navRef = useRef(null);
   useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setIsOpen(false); // close menu if click is outside
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav ref = {navRef}>
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
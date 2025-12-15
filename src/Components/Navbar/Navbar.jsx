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
      {/* Hamburger button */}
      <button
        className={`hamburger ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* Navigation links */}
      <ul className={`nav-links ${isOpen ? 'open' : ''}`}>
        <li><a href="#home" onClick={() => setIsOpen(false)}>Home</a></li>
        <li><a href="#upcomming-programs" onClick={() => setIsOpen(false)}>Programs</a></li>
        <li><a href="#about" onClick={() => setIsOpen(false)}>About us</a></li>
        <li><a href="#campus" onClick={() => setIsOpen(false)}>Gallery</a></li>
        <li><a href="#testimonials" onClick={() => setIsOpen(false)}>Contact us</a></li>
        <li><button className="btn">Login</button></li>
      </ul>
    </nav>
  );
};

export default Navbar;
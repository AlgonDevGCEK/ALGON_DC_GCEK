import React, { useState , useEffect, useRef} from 'react';
import './Navbar.css';
import { NavLink } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navRef = useRef(null);
   useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setIsOpen(false); 
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
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
  <li>
    <NavLink to="/" end>Home</NavLink>
  </li>

  <li>
    <NavLink to="/upcoming-programs">Programs</NavLink>
  </li>

  <li>
    <NavLink to="/about">About Us</NavLink>
  </li>

  <li>
    <NavLink to="/gallery">Gallery</NavLink>
  </li>

  <li>
    <NavLink to="/contact">Contact Us</NavLink>
  </li>

  <li>
    <button className="btn">Login</button>
  </li>
</ul>

    </nav>
    <div
        className={`menu-overlay ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(false)}
      />
    </>

  );
};

export default Navbar;
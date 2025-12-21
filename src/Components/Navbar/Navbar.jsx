import React, { useState, useEffect, useRef } from 'react';
import './Navbar.css';
import { NavLink ,useNavigate} from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navRef = useRef(null);
  const navigate = useNavigate();

  // Close menu when clicking outside
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
      <nav ref={navRef}>
        {/* Hamburger button */}
        <button
          className={`hamburger ${isOpen ? 'open' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* 👇 CHANGE MADE HERE:
            Added onClick={() => setIsOpen(false)} to the ul. 
            Now, clicking ANY child (Link or Button) will close the menu.
        */}
        <ul 
          className={`nav-links ${isOpen ? 'open' : ''}`} 
          onClick={() => setIsOpen(false)} 
        >
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

          {/* ✅ Button that navigates */}
          <li>
            <button 
              className="btn" 
              onClick={() => navigate("/login")}
            >
              Login
            </button>
          </li>

        </ul>
      </nav>

      {/* Overlay to close menu when clicking the background dim area */}
      <div
        className={`menu-overlay ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(false)}
      />
    </>
  );
};

export default Navbar;
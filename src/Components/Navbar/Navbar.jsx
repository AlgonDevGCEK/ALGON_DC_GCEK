import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../../supabaseClient"; 
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [session, setSession] = useState(null);
  
  const navRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // --- 1. HANDLE SCROLL LOCK & CLICK OUTSIDE ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isOpen]);

  // --- 2. AUTHENTICATION CHECK ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsOpen(false);
    navigate("/"); 
  };

  const closeMenu = () => setIsOpen(false);

  return (
    <nav ref={navRef} className="navbar">
      
      {/* LEFT: Logo */}
      <div className="nav-logo" onClick={() => { navigate('/'); closeMenu(); }}>
        <img src="/logo.png" alt="Algon DC GCEK" className="logo-img" />
      </div>

      {/* CENTER & RIGHT WRAPPER (Handles Desktop Flex vs Mobile Fullscreen) */}
      <div className={`nav-menu-container ${isOpen ? 'open' : ''}`}>
        
        {/* CENTER: Navigation Links */}
        <ul className="nav-links">
          <li><NavLink to="/" end onClick={closeMenu}>Home</NavLink></li>
          <li><NavLink to="/upcoming-programs" onClick={closeMenu}>Programs</NavLink></li>
          <li><NavLink to="/competitions" onClick={closeMenu}>Competitions</NavLink></li>
          <li><NavLink to="/insightx" onClick={closeMenu}>InsightX</NavLink></li>
          <li><NavLink to="/about" onClick={closeMenu}>About Us</NavLink></li>
          <li><NavLink to="/gallery" onClick={closeMenu}>Gallery</NavLink></li>
          <li><NavLink to="/contact" onClick={closeMenu}>Contact Us</NavLink></li>
        </ul>

        {/* RIGHT: Auth Actions */}
        <div className="nav-actions">
          {session ? (
            <>
              <NavLink to="/dashboard" className="nav-ghost-btn" onClick={closeMenu}>
                Dashboard
              </NavLink>
              <button className="nav-ghost-btn logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <button className="nav-ghost-btn" onClick={() => { navigate("/login"); closeMenu(); }}>
              Login
            </button>
          )}
        </div>
      </div>

      {/* MOBILE HAMBURGER ICON */}
      <button
        className={`hamburger ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

    </nav>
  );
};

export default Navbar;
import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient"; // Ensure path is correct
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const navRef = useRef(null);
  const navigate = useNavigate();

  // --- 1. HANDLE CLICK OUTSIDE (Mobile Menu) ---
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
      // Lock scrolling on both body and html
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      // Unlock scrolling (clear inline styles)
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }

    // Cleanup: Ensure scroll is restored if component unmounts
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isOpen]);

  // --- 2. AUTHENTICATION CHECK ---
  useEffect(() => {
    // Check active session immediately
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) checkUserRole(session.user.id);
    });

    // Listen for changes (Login/Logout events)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        checkUserRole(session.user.id);
      } else {
        setIsAdmin(false); // Reset admin status on logout
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Check if user is an Admin
  const checkUserRole = async (userId) => {
    const { data } = await supabase
      .from('members')
      .select('role')
      .eq('user_id', userId)
      .single();
    
    if (data?.role === 'admin') setIsAdmin(true);
  };

  // Logout Handler
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsOpen(false); // Close menu on mobile
    navigate("/");    // Redirect to home
  };

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

        {/* Menu Links */}
        <ul 
          className={`nav-links ${isOpen ? 'open' : ''}`} 
          onClick={() => setIsOpen(false)} // Closes menu when any link is clicked
        >
          <li><NavLink to="/" end>Home</NavLink></li>
          <li><NavLink to="/upcoming-programs">Programs</NavLink></li>
          <li><NavLink to="/about">About Us</NavLink></li>
          <li><NavLink to="/gallery">Gallery</NavLink></li>
          <li><NavLink to="/contact">Contact Us</NavLink></li>

          {/* 👇 DYNAMIC AUTH BUTTONS 👇 */}
          {session ? (
            <>
              {/* 👑 ADMIN LINK (Only for Admins) */}
              {isAdmin && (
                <li>
                  <NavLink to="/admin" className="nav-admin-link" style={{color: '#d8b4fe'}}>
                    Admin Hub
                  </NavLink>
                </li>
              )}

              {/* DASHBOARD */}
              <li>
                <NavLink to="/dashboard">Dashboard</NavLink>
              </li>

              {/* LOGOUT */}
              <li>
                <button 
                  className="btn logout-btn" 
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent bubbling if needed, though ul onClick handles closure
                    handleLogout();
                  }}
                  style={{background: 'transparent', border: '1px solid #ef4444', color: '#ef4444'}}
                >
                  Logout
                </button>
              </li>
            </>
          ) : (
            // NOT LOGGED IN? SHOW LOGIN
            <li>
              <button 
                className="btn" 
                onClick={() => navigate("/login")}
              >
                Login
              </button>
            </li>
          )}
        </ul>
      </nav>

      {/* Overlay */}
      <div
        className={`menu-overlay ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(false)}
      />
    </>
  );
};

export default Navbar;
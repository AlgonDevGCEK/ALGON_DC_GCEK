import React, { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation
} from "react-router-dom";

// Components
import Navbar from './Components/Navbar/Navbar';
import Hero from './Components/Hero/Hero';
import Footer from "./Components/Footer/Footer";
import Gallery from './Components/gallery/Gallery';
import AdminUpload from './pages/admin/AdminUpload';
import AdminMemberManager from './Components/Admin/AdminMemberManager'; // From Snippet 1
import UpcomingPrograms from './Components/Programs/UpcomingPrograms';
import EventRegistration from './Components/Programs/EventRegistration'; // From Snippet 1

// Pages
import AboutPage from "./pages/AboutPage";
import Contact from './pages/Contact/Contact';
import Login from "./pages/login-page/Login";
import Signup from "./pages/signup-page/Signup";
import ForgotPassword from "./pages/password/ForgotPassword";
import UpdatePassword from "./pages/password/UpdatePassword";
import Dashboard from "./pages/dashboard-page/Dashboard";
import VerifyUser from "./pages/qr-verify-page/VerifyUser";
import AdminDashboard from "./pages/admin/AdminDashboard";

import './index.css';

/**
 * Utility Component: Resets scroll to top on every route change
 * (From Snippet 2)
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Moves the window back to the top-left corner
    window.scrollTo(0, 0);
  }, [pathname]); // Fires every time the URL path changes

  return null;
};

const App = () => {
  return (
    <Router>
      {/* This must be inside <Router> to work */}
      <ScrollToTop /> 

      <div className='nav-hero'>
        <Navbar />
      </div>

      <div>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Hero />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/upcoming-programs" element={<UpcomingPrograms />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/gallery" element={<Gallery />} />
          
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/update-password" element={<UpdatePassword />} />
          
          {/* Protected / App Routes */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin-upload" element={<AdminUpload />} />
          <Route path="/verify/:userId" element={<VerifyUser />} />
          <Route path="/admin" element={<AdminDashboard />} />
          
          {/* Extra Routes from Snippet 1 */}
          <Route path="/admin-member-manager" element={<AdminMemberManager />} />
          <Route path="/register/:id" element={<EventRegistration />} />
        </Routes>
      </div>

      <Footer />
    </Router>
  );
}

export default App;
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Components
import Navbar from './Components/Navbar/Navbar';
import Hero from './Components/Hero/Hero';
import UpcomingPrograms from './Components/Programs/UpcommingPrograms';
import Footer from "./Components/Footer/Footer";
import Gallery from './Components/gallery/Gallery';
import AdminUpload from './Components/gallery/AdminUpload';

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

const App = () => {
  return (
    <Router>
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
        </Routes>
      </div>

      <Footer />
    </Router>
  );
}

export default App;
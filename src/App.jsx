import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

// Components
import Navbar from './Components/Navbar/Navbar';
import Hero from './Components/Hero/Hero';
import Footer from "./Components/Footer/Footer";
import Gallery from './Components/gallery/Gallery';
import AdminUpload from './pages/admin/AdminUpload';
import AdminMemberManager from './Components/Admin/AdminMemberManager';
import UpcomingPrograms from './Components/Programs/UpcomingPrograms';
import EventRegistration from './Components/Programs/EventRegistration';
import AdminGuard from './Components/Admin/AdminGuard'; 

// Pages
import AboutPage from "./pages/AboutPage";
import Contact from './pages/Contact/Contact';
import Login from "./pages/login-page/Login";
import Signup from "./pages/signup-page/Signup";
import ForgotPassword from "./pages/password_temp/Forgotpassword";
import UpdatePassword from "./pages/password_temp/Updatepassword";
import Dashboard from "./pages/dashboard-page/Dashboard";
import VerifyUser from "./pages/qr-verify-page/VerifyUser";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminPrograms from './Components/Admin/AdminPrograms';
import TermsModal from './pages/Terms_and_conditions/TermsModal';
import PrivacyPolicy from './pages/Privacypolicy-page/PrivacyPolicy';
import RefundPolicy from './pages/Refund-policy-page/RefundPolicy';
import CodeOfConduct from './pages/Code-of-conduct-page/CodeofConduct';
import JoinInfo from './pages/Join-us-page/JoinInfo';
import './index.css';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const App = () => {
  return (
    <Router>
      <ScrollToTop /> 
      <div className='nav-hero'>
        <Navbar />
      </div>

      <div>
        <Routes>
          {/* --- 1. PUBLIC ROUTES (Anyone can see) --- */}
          <Route path="/" element={<Hero />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/upcoming-programs" element={<UpcomingPrograms />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/register/:id" element={<EventRegistration />} />
          <Route path="/verify/:userId" element={<VerifyUser />} />
          <Route path="/terms-and-conditions" element={<TermsModal />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />
          <Route path="/code-of-conduct" element={<CodeOfConduct />} />
          <Route path="/join-us" element={<JoinInfo />} />
          
          {/* --- 2. AUTH ROUTES (Login/Signup) --- */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/update-password" element={<UpdatePassword />} />
          
          {/* --- 3. MEMBER ROUTES (Logged-in Users) --- */}
          {/* Note: You could add a UserGuard here later if you want to force login */}
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* --- 4. ADMIN ROUTES --- */}
          {/* These 4 routes are now fully protected */}
          <Route path="/admin" element={
            <AdminGuard><AdminDashboard /></AdminGuard>
          } />
          <Route path="/admin/programs" element={
            <AdminGuard><AdminPrograms /></AdminGuard>
          } />
          <Route path="/admin-upload" element={
            <AdminGuard><AdminUpload /></AdminGuard>
          } />
          <Route path="/admin-member-manager" element={
            <AdminGuard><AdminMemberManager /></AdminGuard>
          } />
        </Routes>
      </div>

      <Footer />
    </Router>
  );
}

export default App;
import React from 'react'
import Navbar from './Components/Navbar/Navbar'
import Hero from './Components/Hero/Hero'
import AboutUs from './Components/AboutUs/AboutUs'
import UpcomingPrograms from './Components/Programs/UpcommingPrograms'
import './index.css'
import AboutPage from "./pages/AboutPage";
import Footer from "./Components/Footer/Footer";
import Login from "./pages/login-page/Login";
import Signup from "./pages/signup-page/Signup";
import Contact from './pages/Contact/Contact';
import ForgotPassword from "./pages/password/ForgotPassword";
import UpdatePassword from "./pages/password/UpdatePassword";
import Dashboard from "./pages/dashboard-page/Dashboard";
import VerifyUser from "./pages/qr-verify-page/VerifyUser";

import {
  BrowserRouter as Router,
  Routes,
  Route
} from "react-router-dom";

const App = () => {
  return (
   <Router>
    <div className='nav-hero'>
      <Navbar />
    </div>
  

  <div>
    <Routes>
      <Route path="/" element={<Hero />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/upcoming-programs" element={<UpcomingPrograms />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/update-password" element={<UpdatePassword />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/verify/:userId" element={<VerifyUser />} />
    </Routes>
  </div>
     <Footer />
</Router>

  )
}

export default App

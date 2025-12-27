import React, { useState } from "react";
import { supabase } from "../../supabaseClient";
import { ArrowLeft } from "lucide-react"; // Optional: Adds a nice back icon
import { useNavigate } from "react-router-dom";
import "./ForgotPassword.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false); // 1. Add Loading State
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true); // 2. Disable button
    setMessage("");   // Clear old messages

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Password reset email sent! Check your inbox.");
    }
    setLoading(false); // 3. Re-enable button
  };

  return (
    <section className="forgot-wrapper">
      <div className="forgot-card">
        {/* Optional: Back Button */}
        <button onClick={() => navigate('/login')} className="back-link">
             <ArrowLeft size={18} /> Back to Login
        </button>

        <h2>Forgot Password 🔑</h2>
        <p className="instruction-text">Enter your email to receive a reset link.</p>

        <form onSubmit={handleReset}>
          <div className="input-group">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          {/* 4. Button with Disabled Logic */}
          <button type="submit" className="reset-btn" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        {message && (
            <p className={`status ${message.includes("sent") ? "success" : "error"}`}>
                {message}
            </p>
        )}
      </div>
    </section>
  );
};

export default ForgotPassword;
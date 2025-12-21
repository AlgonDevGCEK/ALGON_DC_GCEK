import React, { useState } from "react";
import { supabase } from "../../supabaseClient";
import "./Signup.css";

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    year: "",
    password: "",
    confirmPassword: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    // Supabase signup with email + password
    const { data: { user }, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
    });

    if (error) {
      setErrorMessage(error.message);
      setSuccessMessage("");
    } else {
      // Insert into members table
      const { error: insertError } = await supabase
        .from("members")
        .insert([
          {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            department: formData.department,
            year: parseInt(formData.year),
          },
        ]);

      if (insertError) {
        setErrorMessage(insertError.message);
        setSuccessMessage("");
      } else {
        setSuccessMessage("Registration successful! Please check your email to confirm.");
        setErrorMessage("");
        setFormData({
          name: "",
          email: "",
          phone: "",
          department: "",
          year: "",
          password: "",
          confirmPassword: "",
        });
      }
    }
  };

  return (
    <div className="signup-wrapper">
      <div className="signup-card">
        <h2 className="signup-title">Join Our Community 🚀</h2>
        <p className="signup-subtitle">Create your member account and stay connected</p>

        {errorMessage && <p className="error">{errorMessage}</p>}
        {successMessage && <p className="success">{successMessage}</p>}

        <form onSubmit={handleSignup}>
          <div className="input-group">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <input
              type="email"
              name="email"
              placeholder="Email address"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <input
              type="text"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <input
              type="text"
              name="department"
              placeholder="Department"
              value={formData.department}
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <input
              type="number"
              name="year"
              placeholder="Year of Study"
              value={formData.year}
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="signup-btn">Sign Up</button>
        </form>

        <div className="signup-footer">
          <span>Already a member?</span>
          <a href="/login"> Log in here</a>
        </div>
      </div>
    </div>
  );
};

export default Signup;
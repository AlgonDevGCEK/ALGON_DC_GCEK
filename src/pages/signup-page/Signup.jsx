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
    course: "",
    password: "",
    confirmPassword: "",
    college: false,
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }
    if (!formData.college) {
      setErrorMessage("You must confirm your college affiliation.");
      return;
    }

    const { data: { user }, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
    });

    if (error) {
      setErrorMessage(error.message);
      setSuccessMessage("");
    } else {
      const { error: insertError } = await supabase
  .from("members")
  .insert([
    {
      // 👇 ADD THIS LINE FOR REAL 👇
      user_id: user.id, 
      
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      department: formData.department,
      year: formData.year,
      course: formData.course,
      college: formData.college
        ? "Government College of Engineering Kannur"
        : null,
    },
  ]);

      if (insertError) {
        setErrorMessage(insertError.message);
        setSuccessMessage("");
      } else {
        setSuccessMessage(
          "Registration successful! Please check your email to confirm."
        );
        setErrorMessage("");
        setFormData({
          name: "",
          email: "",
          phone: "",
          department: "",
          year: "",
          course: "",
          password: "",
          confirmPassword: "",
          college: false,
        });
      }
    }
  };

  return (
    <div className="signup-wrapper">
      <div className="signup-card">
        <h2 className="signup-title">Join Our Community 🚀</h2>
        <p className="signup-subtitle">
          Create your member account and stay connected
        </p>

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
              required
            />
          </div>

          <div className="input-group">
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              required
            >
              <option value="">Select Department</option>
              <option value="CSE">CSE</option>
              <option value="ECE">ECE</option>
              <option value="EEE">EEE</option>
              <option value="ME">ME</option>
              <option value="CE">CE</option>
            </select>
          </div>

          <div className="input-group">
            <select
              name="year"
              value={formData.year}
              onChange={handleChange}
              required
            >
              <option value="">Select Year of Study</option>
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
            </select>
          </div>

          <div className="input-group">
            <select
              name="course"
              value={formData.course}
              onChange={handleChange}
              required
            >
              <option value="">Select Course</option>
              <option value="B.Tech">B.Tech</option>
              <option value="M.Tech">M.Tech</option>
            </select>
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

          {/* Moved Checkbox Here */}
          <div className="input-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="college"
                checked={formData.college}
                onChange={handleChange}
              />
              I belong to Government College of Engineering Kannur
            </label>
          </div>

          <button type="submit" className="signup-btn">
            Sign Up
          </button>
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
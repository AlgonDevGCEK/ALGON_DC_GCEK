import React from "react";
import "./Aboutus.css";

const AboutUs = ({ title, content, gradient }) => {
  return (
    <div
      className="card"
      style={{ background: gradient }}
    >
      {/* Logo / Header */}
      <div className="card-logo">
        <span className="dot"></span>
        <h3>ALGON DC</h3>
        <p>GCEK</p>
      </div>

      {/* Title */}
      <h2 className="card-title">{title}</h2>

      {/* Text */}
      <p className="card-text">{content}</p>
    </div>
  );
};

export default AboutUs;
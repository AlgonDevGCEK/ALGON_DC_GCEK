import React from "react";
import AboutUs from "../Components/AboutUs/Aboutus";
import "./AboutPage.css";

const AboutPage = () => {
  return (
    <div className="about-page">
      <AboutUs
        title="Our Vision"
        content="To create an ecosystem where students can collaborate across disciplines, gain hands-on experience, and grow into industry-ready professionals through real-world projects and mentorship."
      />

      <AboutUs
        title="Community Focus"
        content="Algon DC GCEK focuses on accelerating the next generation of changemakers. Through hands-on projects and collaborative problem-solving, we transform GCEK's brightest minds into agile developers and visionary tech leaders."
      />

      <AboutUs
        title="What We Do"
        content="Algon DC serves as the ultimate ecosystem for GCEK’s innovators. We curate immersive learning experiences across development, design, and marketing—bridging the gap between student projects and industry-standard products through a culture of peer-to-peer mentorship."
      />

      <AboutUs
        title="Our Mission"
        content="Our mission is to democratize technology and innovation. We are dedicated to building a supportive community of lifelong learners who empower each other through shared knowledge, collective building, and a relentless drive to shape the future together."
      />
    </div>
  );
};

export default AboutPage;
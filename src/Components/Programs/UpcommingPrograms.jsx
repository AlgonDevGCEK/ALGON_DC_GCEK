
import React from 'react';
import './Program.css';
import './UpcommingPrograms.css';
const UpcomingPrograms = () => {
  const upcomingPrograms = [
    {
      type: "Workshop",
      title: "GIT & GitHub for Beginners",
      description: "Learn modern web development with React, Node.js, and MongoDB. Build real-world projects from scratch.",
      date: "November 8, 2026",
      time: "9:00 AM - 12:00PM",
      location: "GCEK Campus, High tech Lab",
      seats: "seats available",
      badge: "badge-workshop"
    },
    {
      type: "Webinar",
      title: "Logo Quest",
      description: "Get ready to put your brand knowledge to the ultimate test! ",
      date: "November 6, 2025",
      time: "8:00 PM",
      location: "ONLINE",
      seats: "seats available",
      badge: "badge-webinar"
     
    },
    {
      type: "Project Expo",
      title: "InsightX",
      description: "",
      date: "December",
      time: "",
      location: "",
      seats: "seats available",
      badge: "badge-webinar"
    },
    {
      type: "Meetup",
      title: "Tech Talk: Cloud Computing",
  description: "Comming soon!",
      badge: "badge-meetup"
    },
    {
      type: "Workshop",
        title: "Full-Stack Web Development",
        description: "Comming soon!",
      badge: "badge-workshop"
    },
    {
      type: "Hackathon",
      title: "Innovation Challenge 2025",
      description: "Comming soon!",
      badge: "badge-hackathon"
    }
  ];

  return (
    <div id= "upcomming-programs" className="upcoming-section">
      <div className="upcoming-container">
        {/* Section Header */}
        <div className="upcoming-header">
          <h2 className="upcoming-title">Upcoming Programs</h2>
          <p className="upcoming-subtitle">
            Join our exciting events and level up your skills
          </p>
        </div>

        {/* Program Cards Grid */}
        <div className="upcoming-grid">
          {upcomingPrograms.map((program, index) => (
            <div key={index} className="program-card">
              {/* Badge */}
              <span className={`program-badge ${program.badge}`}>
                {program.type}
              </span>

              {/* Title */}
              <h3 className="program-title">{program.title}</h3>

              {/* Description */}
              <p className="program-description">{program.description}</p>

              {/* Meta Information */}
              <div className="program-meta">
                <div className="meta-item">
                  <svg className="meta-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{program.date}</span>
                </div>
                <div className="meta-item">
                  <svg className="meta-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{program.time}</span>
                </div>
                <div className="meta-item">
                  <svg className="meta-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{program.location}</span>
                </div>
              </div>

              {/* Footer */}
              <div className="program-footer">
                <div className="program-seats">
                  <span className="seats-indicator"></span>
                  <span>{program.seats}</span>
                </div>
                <button className="register-btn">Register Now</button>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="view-all-container">
          <button className="view-all-btn">
            <span>View All Programs</span>
            <svg className="meta-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpcomingPrograms;

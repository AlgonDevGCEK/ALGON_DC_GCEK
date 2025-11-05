import React from 'react'
import Navbar from './Components/Navbar/Navbar'

import Hero from './Components/Hero/Hero'
import AboutUs from './Components/AboutUs/Aboutus'

import './index.css'
import UpcomingPrograms from './Components/Programs/UpcommingPrograms'

const App = () => {
  return (
    <div>
       <div className='nav-hero'>
      <Navbar></Navbar>
      <Hero></Hero>
       </div>
    
     <UpcomingPrograms></UpcomingPrograms>
        <AboutUs
        title="Our Vision"
        content="To create an ecosystem where students can collaborate across disciplines, gain hands-on experience, and grow into industry-ready professionals through real-world projects and mentorship."
        gradient="linear-gradient(135deg, rgba(0, 255, 255, 0.1), rgba(0, 0, 128, 0.3))"
      />
        <AboutUs
        title="Community Focus"
        content="ADC focuses on creating an inclusive space where members can enhance their technical skills, develop problem-solving abilities, and connect with like-minded peers. By fostering a culture of innovation and collaboration, the community aims to empower students to transform ideas into impactful solutions."
        gradient="linear-gradient(135deg, rgba(2, 28, 200, 0.1), rgba(20, 20, 170, 0.3))"
      />
        <AboutUs
        title="what we do"
        content="The Algon Developer Community (ADC) is a student-driven tech community that brings together developers, innovators, and enthusiasts to learn, build, and grow together. It serves as a platform for students to explore emerging technologies, collaborate on real-world projects, and share knowledge through workshops, hackathons, and discussions."
        gradient="linear-gradient(135deg, rgba(37, 81, 81, 0.1), rgba(57, 57, 143, 0.3))"
      />
        <AboutUs
        title="Our Mission"
        content="A space for curious minds, builders & innovators! From workshops to hackathons, we're here to learn, create & grow together. Let's turn ideas into impact one project at a time."
        gradient="linear-gradient(135deg, rgba(179, 112, 82, 0.1), rgba(213, 12, 29, 0.3))"
      />
    </div>
  )
}

export default App

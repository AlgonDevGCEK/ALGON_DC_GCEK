import React from 'react'
import './Hero.css'
import dark_arrow from '../../assets/dark-arrow.png'
const Hero = () => {
  return (
     

<div id="home" className="hero container">
  <div className="hero-text">
    <h1 className="logo-title">ALGON DC</h1>
    <h1 className="logo-subtitle">GCEK</h1>

    <h2>Our Vision</h2>
    <p>
      To create an ecosystem where students can collaborate across disciplines,
      gain hands-on experience, and grow into industry-ready professionals
      through real-world projects and mentorship.
    </p>

    <button className="btn">
      Join us <img src={dark_arrow} alt="" />
    </button>
  </div>
</div>


  )
}

export default Hero

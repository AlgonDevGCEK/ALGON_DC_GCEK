import React from 'react'
import './Navbar.css'
import adclogo from '../../assets/adclogo.png'
const Navbar = () => {
  return (
   <nav className='container'>
    
    <ul>
        <li><a href="#home">Home</a>
           
        </li>
        <li ><a href="#upcomming-programs"> Program</a></li>
        <li ><a href="#about">About us</a></li>
        <li>Campus</li>
        <li>Testimonials</li>
        
        <li><button className='btn'>Contact us</button></li>
    </ul>
   </nav>
  )
}

export default Navbar

import React from 'react'
import './Aboutus.css'
function Aboutus({title,subtitle,content,gradient}){
    return (

     <div id='about' className='card' style={{background:gradient}}>
        <div className='card-logo'>
        <span className='dot'></span>
        <div>
            <h3>ALGON DC</h3>
            <p>GCEK</p>

        </div>
        </div>
        <h2 className='cardTitle'>{title}</h2>
        <p className='cardDescription'>{content}</p>
    </div>
    );
}
  
export default Aboutus;

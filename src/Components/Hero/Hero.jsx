import React from 'react';
import { useNavigate } from "react-router-dom";
import { Canvas } from '@react-three/fiber';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import ParticleSphere from '../ParticleSphere';
import CosmicDust from '../CosmicDust';
import './Hero.css';

const Hero = () => {
  const navigate = useNavigate();

  // Framer Motion setup for smooth page loads
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <section id="home" className="hero-wrapper">
      <CosmicDust />
      
      {/* 3D Canvas Background */}
      <div className="hero-canvas-container">
        <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
          <ParticleSphere />
        </Canvas>
      </div>

      {/* Text Content */}
      <div className="hero-content">
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <motion.h1 variants={itemVariants} className="hero-title">
            ALGON <span>DC GCEK</span>
          </motion.h1>
          
          <motion.h2 variants={itemVariants} className="hero-subtitle">
            Build. Learn. Collaborate.
          </motion.h2>

          <motion.p variants={itemVariants} className="hero-desc">
            ALGON DC GCEK is a student developer community focused on technical learning, coding competitions, workshops, projects, and peer-driven growth. Take the leap from learning to doing.
          </motion.p>

          <motion.div variants={itemVariants} className="hero-btn-group">
            <button className="btn btn-primary" onClick={() => navigate("/about")}>
              About Us
            </button>
            <button className="btn btn-secondary" onClick={() => navigate("/join-us")}>
              Join the Community <ArrowRight size={18} />
            </button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
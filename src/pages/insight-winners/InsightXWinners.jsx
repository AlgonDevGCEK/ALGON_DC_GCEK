import React, { useEffect, useRef } from 'react';
import { Trophy, Medal } from 'lucide-react';
import confetti from 'canvas-confetti';
import './InsightXWinners.css';

const winners = [
  { rank: 1, img: "/pentagonim.webp", label: "1st Place" },
  { rank: 2, img: "/Byteforceim.webp", label: "2nd Place" },
  { rank: 3, img: "/cyberim.webp", label: "3rd Place" }
];

// Custom Cinematic Scroll Function with Mobile Awareness
const cinematicScrollTo = (element, duration = 2000) => {
  const isMobile = window.innerWidth <= 992;
  const targetPosition = element.getBoundingClientRect().top + window.scrollY;
  
  // Mobile: Scroll to slightly above the top card. Desktop: Center the whole horizontal podium.
  const alignmentOffset = isMobile 
    ? 120 // Leaves breathing room above the 1st place card on mobile
    : (window.innerHeight / 2) - (element.offsetHeight / 2); 
    
  const offsetPosition = targetPosition - alignmentOffset;
  const startPosition = window.scrollY;
  const distance = offsetPosition - startPosition;
  let startTime = null;

  const easeInOutQuart = (time) => {
    return time < 0.5 ? 8 * time * time * time * time : 1 - Math.pow(-2 * time + 2, 4) / 2;
  };

  const animation = (currentTime) => {
    if (startTime === null) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const progress = Math.min(timeElapsed / duration, 1);
    
    window.scrollTo(0, startPosition + distance * easeInOutQuart(progress));

    if (timeElapsed < duration) {
      requestAnimationFrame(animation);
    }
  };

  requestAnimationFrame(animation);
};

const InsightXWinners = () => {
  const podiumRef = useRef(null);

  useEffect(() => {
    
    // --- CINEMATIC CAMERA PAN ---
    const scrollTimer = setTimeout(() => {
      if (podiumRef.current) {
        cinematicScrollTo(podiumRef.current, 2000); 
      }
    }, 4200);

    // --- EPIC FIREWORKS EFFECT (Mobile Optimized) ---
    const confettiTimer = setTimeout(() => {
      const isMobile = window.innerWidth <= 768;
      
      // Dynamic settings based on device
      const particleMultiplier = isMobile ? 0.6 : 1; // 40% less particles on phone to prevent lag
      const popSpread = isMobile ? 100 : 160; // Tighter blast arc for narrow screens
      const popOriginY = isMobile ? 0.3 : 0.4; // Fire higher up on phones to hit the 1st place card

      // The Big Center Pop
      confetti({
        particleCount: Math.floor(250 * particleMultiplier),      
        spread: popSpread,             
        origin: { x: 0.5, y: popOriginY }, 
        colors: ['#00bfff', '#facc15', '#ffffff', '#8b5cf6'], 
        startVelocity: isMobile ? 35 : 45, // Softer blast on smaller screens      
        gravity: 0.8,            
        ticks: 300               
      });

      // Secondary dramatic pop
      setTimeout(() => {
        confetti({
          particleCount: Math.floor(100 * particleMultiplier),
          spread: popSpread - 40,
          origin: { x: 0.5, y: popOriginY + 0.05 },
          colors: ['#00bfff', '#facc15', '#ffffff'],
          startVelocity: isMobile ? 25 : 35,
          gravity: 0.8,
        });
      }, 400);

    }, 6800); 

    return () => {
      clearTimeout(scrollTimer);
      clearTimeout(confettiTimer);
    };
  }, []);

  return (
    <div className="winners-page-wrapper">
      <div className="container">
        
        {/* Cinematic Header Sequence */}
        <div className="winners-header">
          <h1 className="section-header animate-title">
            A Legacy of Excellence
          </h1>
          <p className="section-subtitle mx-auto animate-subtitle">
            InSightX 2026 has officially concluded. We extend our deepest gratitude to all participants for their exceptional dedication, ingenuity, and collaborative spirit.
            <br />
            <strong className="epic-reveal">Presenting the ultimate champions.</strong>
          </p>
        </div>

        {/* The Podium */}
        <div className="podium-container" ref={podiumRef}>
          {winners.map((winner) => (
            <div key={winner.rank} className={`podium-card rank-${winner.rank}`}>
              
              <div className="rank-badge">
                {winner.rank === 1 ? <Trophy size={20} /> : <Medal size={20} />}
                <span>{winner.label}</span>
              </div>

              <div className="team-image-wrapper">
                <img src={winner.img} alt={`InsightX ${winner.label} Winners`} loading="lazy" />
              </div>
              
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default InsightXWinners;
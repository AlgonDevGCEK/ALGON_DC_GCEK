import React, { useMemo } from 'react';
import './CosmicDust.css';

const CosmicDust = () => {
  const particles = useMemo(() => {
    return Array.from({ length: 100 }).map((_, i) => ({
      id: i,
      // Randomly scatter them across the entire screen
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      // Random sizes between 1px and 2.5px
      size: `${Math.random() * 1.5 + 1}px`,
      // Random drift speed between 15s and 35s (super slow and elegant)
      duration: `${Math.random() * 20 + 15}s`,
      // Negative delay so they don't all start at the bottom at the same time
      delay: `${Math.random() * -30}s`, 
    }));
  }, []);

  return (
    <div className="cosmic-dust-container">
      {particles.map((p) => (
        <div
          key={p.id}
          className="dust-particle"
          style={{
            top: p.top,
            left: p.left,
            width: p.size,
            height: p.size,
            animationDuration: p.duration,
            animationDelay: p.delay,
          }}
        />
      ))}
    </div>
  );
};

export default CosmicDust;
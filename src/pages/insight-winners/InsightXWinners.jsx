import React from 'react';
import { Trophy, Medal } from 'lucide-react';
import './InsightXWinners.css';

const winners = [
  { rank: 1, img: "/pentagonim.webp", label: "1st Place" },
  { rank: 2, img: "/Byteforceim.webp", label: "2nd Place" },
  { rank: 3, img: "/cyberim.webp", label: "3rd Place" }
];

const InsightXWinners = () => {
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
        <div className="podium-container">
          {winners.map((winner) => (
            <div key={winner.rank} className={`podium-card rank-${winner.rank}`}>
              
              {/* Rank Badge */}
              <div className="rank-badge">
                {winner.rank === 1 ? <Trophy size={20} /> : <Medal size={20} />}
                <span>{winner.label}</span>
              </div>

              {/* Team Image (.webp) */}
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
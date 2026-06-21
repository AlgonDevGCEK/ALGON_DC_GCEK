import React from 'react';

const QuizTerminal = ({ programId, participantEmail }) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#020617', color: '#cbd5e1' }}>
      <div style={{ textAlign: 'center' }}>
        <h2>📝 Quiz Environment Booting Up...</h2>
        <p style={{ color: '#64748b' }}>Standing by to load questions.</p>
      </div>
    </div>
  );
};

export default QuizTerminal;
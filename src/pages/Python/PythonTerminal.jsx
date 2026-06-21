import React from 'react';

const PythonTerminal = ({ programId, participantEmail }) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#0d1117', color: '#c9d1d9' }}>
      <div style={{ textAlign: 'center' }}>
        <h2>🐍 Python Environment Booting Up...</h2>
        <p style={{ color: '#8b949e' }}>Standing by to initialize Pyodide.</p>
      </div>
    </div>
  );
};

export default PythonTerminal;
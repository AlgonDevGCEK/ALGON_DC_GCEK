import React, { useState } from 'react';
import CompetitionTerminal from './CompetitionTerminal'; // Update path if needed
import { Terminal, ArrowRight } from 'lucide-react';

const CompetitionPage = () => {
  // State for the gateway
  const [email, setEmail] = useState('');
  const [isEntered, setIsEntered] = useState(false);

  // The specific ID for this SQL competition
  const programId = "40aba380-f64c-49e6-b373-9cbb8bad10f8";

  const handleEnterArena = (e) => {
    e.preventDefault();
    if (email.trim().includes('@')) {
      setIsEntered(true);
    } else {
      alert("Please enter a valid email address.");
    }
  };

  // If they have entered their email, show the actual terminal
  if (isEntered) {
    return (
      <div style={{ width: '100vw', height: '100vh' }}>
        <CompetitionTerminal 
          programId={programId} 
          participantEmail={email} 
        />
      </div>
    );
  }

  // Otherwise, show the Email Gateway form
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <Terminal size={32} color="#00bfff" />
          <h1 style={styles.title}>InsightX Arena</h1>
          <p style={styles.subtitle}>Ultimate SQL Query Competition</p>
        </div>

        <form onSubmit={handleEnterArena} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Participant Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@example.com"
              style={styles.input}
              required
            />
          </div>

          <button type="submit" style={styles.button}>
            Enter Arena <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

// Inline styles for the gateway to match your dark theme
const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0a0e17',
    fontFamily: "'Inter', sans-serif",
    color: '#e2e8f0'
  },
  card: {
    backgroundColor: '#111827',
    padding: '3rem',
    borderRadius: '12px',
    border: '1px solid rgba(0, 191, 255, 0.2)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
    width: '100%',
    maxWidth: '400px',
    textAlign: 'center'
  },
  header: {
    marginBottom: '2rem'
  },
  title: {
    margin: '1rem 0 0.5rem',
    fontSize: '1.8rem',
    color: '#fff'
  },
  subtitle: {
    margin: 0,
    color: '#94a3b8'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'left',
    gap: '0.5rem'
  },
  label: {
    fontSize: '0.9rem',
    color: '#cbd5e1',
    fontWeight: '600'
  },
  input: {
    padding: '12px 16px',
    borderRadius: '6px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    backgroundColor: '#1f2937',
    color: '#fff',
    fontSize: '1rem',
    outline: 'none'
  },
  button: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px',
    backgroundColor: '#00bfff',
    color: '#000',
    border: 'none',
    borderRadius: '6px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '1rem',
    transition: 'opacity 0.2s'
  }
};

export default CompetitionPage;
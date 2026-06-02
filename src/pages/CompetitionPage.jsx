import React, { useState } from 'react';
import CompetitionTerminal from './CompetitionTerminal'; // Adjust path if your folder structure is different
import { Terminal, ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '../supabaseClient'; 

const CompetitionPage = () => {
  const programId = "40aba380-f64c-49e6-b373-9cbb8bad10f8";

  // 1. LAZY INITIALIZATION: Check local storage on load
  const [email, setEmail] = useState(() => {
    return localStorage.getItem(`insightx_user_${programId}`) || '';
  });
  const [isEntered, setIsEntered] = useState(() => {
    return !!localStorage.getItem(`insightx_user_${programId}`);
  });
  
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleEnterArena = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail.includes('@')) {
      setErrorMsg("Please enter a valid email address.");
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .eq('email', cleanEmail)
        .limit(1);

      if (error) {
        setErrorMsg(`Database error: ${error.message}`);
        setIsLoading(false);
        return;
      }

      if (!data || data.length === 0) {
        setErrorMsg("Access Denied: This email is not registered.");
        setIsLoading(false);
        return;
      }

      // 2. THE ANTI-CHEAT GATEKEEPER
      // Count exactly how many warnings this specific email has
      const { count: strikes, error: strikeError } = await supabase
        .from('competition_warnings')
        .select('*', { count: 'exact', head: true })
        .eq('program_id', programId)
        .eq('participant_email', cleanEmail);

      if (strikeError) {
        console.error("Error checking warning history:", strikeError);
      }

      // 3. THE LOCKOUT
      if (strikes >= 3) {
        setErrorMsg("ACCESS DENIED: You have been disqualified from this competition due to multiple tab-switching violations.");
        setIsLoading(false);
        return; 
      }

      // 4. SAVE TO LOCAL STORAGE ON SUCCESS
      localStorage.setItem(`insightx_user_${programId}`, cleanEmail);
      setIsEntered(true);
      
    } catch (err) {
      console.error("Unexpected error:", err);
      setErrorMsg("An unexpected error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    } 
  };

  // If already entered (or saved in local storage), show the terminal
  if (isEntered) {
    return (
      <div style={{ width: '100%', height: '100%' }}>
        <CompetitionTerminal 
          programId={programId} 
          participantEmail={email} 
        />
      </div>
    );
  }

  // Otherwise, show the login Gateway
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <Terminal size={32} color="#00bfff" />
          <h1 style={styles.title}>SQL Arena</h1>
          <p style={styles.subtitle}>Secure Database Access</p>
        </div>

        <form onSubmit={handleEnterArena} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Registered Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@example.com"
              style={styles.input}
              required
            />
          </div>

          {errorMsg && <div style={{color: '#ff007f', fontSize: '0.9rem'}}>{errorMsg}</div>}

          <button type="submit" style={styles.button} disabled={isLoading}>
            {isLoading ? <Loader2 className="spinner" size={18} /> : 'Authenticate'} <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

// Styles object (MUST be included!)
const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#08111b',
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
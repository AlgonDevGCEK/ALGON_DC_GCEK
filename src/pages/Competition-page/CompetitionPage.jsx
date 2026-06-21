import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Terminal, ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '../../supabaseClient'; 

// Import all three environments
import CompetitionTerminal from '../SQL-terminal/CompetitionTerminal'; 
import PythonTerminal from '../Python/PythonTerminal';
import QuizTerminal from '../Quiz/QuizTerminal';

const CompetitionPage = () => {
  const { id: programId } = useParams();

  // Lazy Initialization for local storage
  const [email, setEmail] = useState(() => {
    return localStorage.getItem(`insightx_user_${programId}`) || '';
  });
  
  const [isEntered, setIsEntered] = useState(() => {
    return !!localStorage.getItem(`insightx_user_${programId}`);
  });

  // New state to hold whether it's 'sql', 'coding' (python), or 'quiz'
  const [competitionType, setCompetitionType] = useState(() => {
    return localStorage.getItem(`insightx_type_${programId}`) || null;
  });
  
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // If they are already in local storage but we lost the type on a hard refresh, fetch it
  React.useEffect(() => {
    if (isEntered && !competitionType) {
      fetchTypeAndBypass();
    }
  }, [isEntered, competitionType]);

  const fetchTypeAndBypass = async () => {
    const { data } = await supabase.from('programs').select('type').eq('id', programId).single();
    if (data) {
      setCompetitionType(data.type);
      localStorage.setItem(`insightx_type_${programId}`, data.type);
    }
  };

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
      // 1. Verify Registration
      const { data: regData, error: regError } = await supabase
        .from('registrations')
        .select('*')
        .eq('email', cleanEmail)
        .limit(1);

      if (regError) {
        setErrorMsg(`Database error: ${regError.message}`);
        setIsLoading(false);
        return;
      }

      if (!regData || regData.length === 0) {
        setErrorMsg("Access Denied: This email is not registered.");
        setIsLoading(false);
        return;
      }

      // 2. Anti-Cheat Check
      const { count: strikes } = await supabase
        .from('competition_warnings')
        .select('*', { count: 'exact', head: true })
        .eq('program_id', programId)
        .eq('participant_email', cleanEmail);

      if (strikes >= 3) {
        setErrorMsg("ACCESS DENIED: You have been disqualified due to multiple security violations.");
        setIsLoading(false);
        return; 
      }

      // 3. Fetch Competition Type
      const { data: progData, error: progError } = await supabase
        .from('programs')
        .select('type')
        .eq('id', programId)
        .single();

      if (progError || !progData) {
        setErrorMsg("Error: Could not determine competition environment.");
        setIsLoading(false);
        return;
      }

      // 4. Grant Access
      localStorage.setItem(`insightx_user_${programId}`, cleanEmail);
      localStorage.setItem(`insightx_type_${programId}`, progData.type);
      setCompetitionType(progData.type);
      setIsEntered(true);
      
    } catch (err) {
      console.error("Unexpected error:", err);
      setErrorMsg("An unexpected error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    } 
  };

  // ==========================================
  // THE TRAFFIC CONTROLLER (ROUTER)
  // ==========================================
  if (isEntered && competitionType) {
    const typeStr = competitionType.toLowerCase();

    if (typeStr === 'sql') {
      return <div style={{ width: '100%', height: '100%' }}><CompetitionTerminal programId={programId} participantEmail={email} /></div>;
    }
    
    if (typeStr === 'coding' || typeStr === 'python') {
      return <div style={{ width: '100%', height: '100%' }}><PythonTerminal programId={programId} participantEmail={email} /></div>;
    }

    if (typeStr === 'quiz' || typeStr === 'trivia') {
      return <div style={{ width: '100%', height: '100%' }}><QuizTerminal programId={programId} participantEmail={email} /></div>;
    }

    // Fallback if type is weird
    return <div style={{ color: 'white', padding: '50px', textAlign: 'center' }}>Error: Unknown Environment Type ({competitionType})</div>;
  }

  // ==========================================
  // THE GATEWAY LOGIN SCREEN
  // ==========================================
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <Terminal size={36} color="#00bfff" style={{ filter: 'drop-shadow(0 0 10px rgba(0, 191, 255, 0.4))' }} />
          <h1 style={styles.title}>Secure Gateway</h1>
          <p style={styles.subtitle}>Authenticate to access your arena</p>
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

          {errorMsg && <div style={{color: '#ef4444', fontSize: '0.9rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.3)'}}>{errorMsg}</div>}

          <button 
            type="submit" 
            style={{
              ...styles.button, 
              ...(isLoading ? { opacity: 0.7, cursor: 'not-allowed' } : {})
            }} 
            disabled={isLoading}
            onMouseOver={(e) => {
              if(!isLoading){
                e.currentTarget.style.backgroundColor = '#00bfff';
                e.currentTarget.style.color = '#020617';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 191, 255, 0.4)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }
            }}
            onMouseOut={(e) => {
              if(!isLoading){
                e.currentTarget.style.backgroundColor = 'rgba(0, 191, 255, 0.1)';
                e.currentTarget.style.color = '#00bfff';
                e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 191, 255, 0.15)';
                e.currentTarget.style.transform = 'translateY(0)';
              }
            }}
          >
            {isLoading ? <Loader2 className="spinner" size={18} /> : 'Authenticate'} <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'radial-gradient(circle at 50% 0%, rgba(0, 191, 255, 0.05) 0%, transparent 70%), #020617',
    fontFamily: "'Poppins', sans-serif",
    color: '#e2e8f0',
    padding: '20px'
  },
  card: {
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    padding: '3rem',
    borderRadius: '20px',
    border: '1px solid rgba(0, 191, 255, 0.15)',
    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 20px rgba(0, 191, 255, 0.05) inset',
    width: '100%',
    maxWidth: '420px',
    textAlign: 'center'
  },
  header: { marginBottom: '2rem' },
  title: { margin: '1rem 0 0.5rem', fontSize: '1.8rem', color: 'white', fontWeight: '700', textShadow: '0 0 10px rgba(255, 255, 255, 0.1)' },
  subtitle: { margin: 0, color: '#94a3b8', fontSize: '0.95rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  inputGroup: { display: 'flex', flexDirection: 'column', textAlign: 'left', gap: '0.5rem' },
  label: { fontSize: '0.9rem', color: '#cbd5e1', fontWeight: '500' },
  input: {
    padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(0, 191, 255, 0.2)',
    backgroundColor: 'rgba(0, 0, 0, 0.3)', color: '#fff', fontSize: '1rem', outline: 'none',
    fontFamily: 'inherit', transition: 'all 0.3s ease'
  },
  button: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px',
    backgroundColor: 'rgba(0, 191, 255, 0.1)', color: '#00bfff', border: '1px solid #00bfff',
    borderRadius: '10px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer',
    marginTop: '0.5rem', transition: 'all 0.3s ease', boxShadow: '0 0 15px rgba(0, 191, 255, 0.15)'
  }
};

export default CompetitionPage;
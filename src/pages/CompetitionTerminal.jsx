import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { supabase } from '../supabaseClient';
import { Terminal, Clock, Play, Database, AlertCircle, CheckCircle, LogOut, ArrowRight, Lock } from 'lucide-react';
import './CompetitionTerminal.css';

const CompetitionTerminal = ({ programId, participantEmail }) => {
  const [question, setQuestion] = useState(null);
  const [isFinished, setIsFinished] = useState(false);
  const [isLocked, setIsLocked] = useState(true); 
  const [terminalOutput, setTerminalOutput] = useState('Waiting for execution...');
  const [status, setStatus] = useState('idle');
  const [sqlQuery, setSqlQuery] = useState('');
  const [isCooldown, setIsCooldown] = useState(false);
  const penaltyCooldown = useRef(false);
  
  const [warnings, setWarnings] = useState(0);
  const [showWarningScreen, setShowWarningScreen] = useState(false);

  // Timers
  const [globalTimeLeft, setGlobalTimeLeft] = useState(0); 
  const [questionTimeLeft, setQuestionTimeLeft] = useState(0); 

  useEffect(() => {
    const bootTerminal = async () => {
      // 1. Check Admin Control Table
      const { data: controlData } = await supabase
        .from('competition_control')
        .select('*')
        .eq('program_id', programId)
        .single();

      if (!controlData || !controlData.is_active) {
        setIsLocked(true);
        return;
      }
      
      setIsLocked(false);

      // 2. Fetch ALL questions for this program to calculate total time
      const { data: questionsData } = await supabase
        .from('competition_questions')
        .select('time_limit_seconds')
        .eq('program_id', programId);

      // Sum the time limits (fallback to 300s per question if missing, or 1200s total if table is empty)
      let totalTimeSeconds = 1200; 
      if (questionsData && questionsData.length > 0) {
        totalTimeSeconds = questionsData.reduce((total, q) => total + (q.time_limit_seconds || 300), 0);
      }

      // Save the dynamically calculated total duration
      localStorage.setItem(`insightx_global_duration_${programId}`, totalTimeSeconds);

      // Handle Global Timer Start Persistence
      let globalStart = localStorage.getItem(`insightx_global_start_${programId}`);
      if (!globalStart) {
        globalStart = Date.now();
        localStorage.setItem(`insightx_global_start_${programId}`, globalStart);
      }

      const savedOrder = parseInt(localStorage.getItem(`insightx_current_order_${programId}`) || '0');
      fetchQuestion(savedOrder, true); 
    };

    bootTerminal();
  }, [programId]);

  useEffect(() => {
    if (isFinished || isLocked || !question) return;

    const logPenalty = () => {
      if (penaltyCooldown.current) return;
      penaltyCooldown.current = true;

      setWarnings((prev) => {
        const newCount = prev + 1;
        
        supabase.from('competition_warnings').insert([
          { 
            program_id: programId,
            participant_email: participantEmail, 
            warning_type: 'focus_loss_or_tab_switch'
          }
        ]).then(({ error }) => {
          if (error) console.error("Failed to log penalty:", error);
        });

        if (newCount >= 3) {
          localStorage.clear();
          window.location.href = '/'; 
        } else {
          setShowWarningScreen(true);
        }
        return newCount;
      });

      setTimeout(() => {
        penaltyCooldown.current = false;
      }, 2000);
    };

    const handleVisibilityChange = () => { if (document.hidden) logPenalty(); };
    const handleWindowBlur = () => { logPenalty(); };
    const handleContextMenu = (e) => e.preventDefault();

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [isFinished, isLocked, question, programId, participantEmail]);

  const fetchQuestion = async (afterOrder = 0, isBoot = false) => {
    if (!isBoot) {
      localStorage.setItem(`insightx_current_order_${programId}`, afterOrder);
    }

    const { data, error } = await supabase
      .from('competition_questions')
      .select('*')
      .eq('program_id', programId)
      .gt('display_order', isBoot ? afterOrder - 1 : afterOrder) 
      .order('display_order', { ascending: true })
      .limit(1)
      .maybeSingle();
      
    if (data) {
      setQuestion(data);
      setStatus('idle');
      setTerminalOutput('Waiting for execution...');
      
      const savedCode = localStorage.getItem(`insightx_code_${programId}_${data.id}`);
      setSqlQuery(savedCode || '-- Write your SQL query here\n');

      let qStart = localStorage.getItem(`insightx_q_start_${programId}_${data.id}`);
      if (!qStart) {
        qStart = Date.now();
        localStorage.setItem(`insightx_q_start_${programId}_${data.id}`, qStart);
      }
    } else {
      setIsFinished(true);
    }
  };

  useEffect(() => {
    if (question && sqlQuery) {
      localStorage.setItem(`insightx_code_${programId}_${question.id}`, sqlQuery);
    }
  }, [sqlQuery, question, programId]);

  useEffect(() => {
    if (isLocked || !question || isFinished) return;

    const tick = setInterval(() => {
      const now = Date.now();

      // Dynamic Global Timer
      const globalStart = parseInt(localStorage.getItem(`insightx_global_start_${programId}`));
      const globalDuration = parseInt(localStorage.getItem(`insightx_global_duration_${programId}`)) || 1200;
      const globalElapsed = Math.floor((now - globalStart) / 1000);
      const gTimeLeft = Math.max(globalDuration - globalElapsed, 0); 
      setGlobalTimeLeft(gTimeLeft);

      if (gTimeLeft <= 0) {
        setIsFinished(true);
        clearInterval(tick);
        return;
      }

      // Dynamic Question Timer (Populated from DB)
      if (status !== 'correct') {
        const qStart = parseInt(localStorage.getItem(`insightx_q_start_${programId}_${question.id}`));
        const qElapsed = Math.floor((now - qStart) / 1000);
        
        // Use the dynamic time_limit_seconds from the DB (fallback to 300s if missing)
        const maxQTime = question.time_limit_seconds || 300; 
        const qTimeLeft = Math.max(maxQTime - qElapsed, 0); 
        
        setQuestionTimeLeft(qTimeLeft);

        if (qTimeLeft <= 0) {
          setTerminalOutput('Time limit reached. Auto-advancing...');
          setTimeout(() => fetchQuestion(question.display_order), 2000);
        }
      }
    }, 1000);

    return () => clearInterval(tick);
  }, [question, isFinished, isLocked, status]);

  const handleExecute = async () => {
    if (!sqlQuery.trim() || isCooldown) return; 
    
    setStatus('executing');
    setIsCooldown(true); 
    setTerminalOutput('Connecting to secure SQL execution engine...');

    try {
      const { data, error } = await supabase.functions.invoke('evaluate-query', {
        body: {
          program_id: programId,
          participant_email: participantEmail,
          question_id: question.id,
          submitted_query: sqlQuery
        }
      });

      if (error) throw error;

      setStatus(data.status); 
      setTerminalOutput(JSON.stringify(data.output, null, 2));

    } catch (err) {
      setStatus('error');
      setTerminalOutput(`Execution Failed: ${err.message}`);
    } finally {
      setTimeout(() => {
        setIsCooldown(false);
      }, 3000); 
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/'; 
  };

  const formatTime = (seconds) => `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;

  // SCREEN: Locked by Admin
  if (isLocked) {
    return (
      <div className="competition-layout" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Lock size={48} color="#64748b" style={{ marginBottom: '1rem' }} />
        <h1 style={{ color: '#f8fafc', fontSize: '1.5rem', fontWeight: '500' }}>Arena is Locked</h1>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>The competition has not been started by the administrator yet.</p>
        <button onClick={() => window.location.reload()} className="action-btn-primary" style={{ marginTop: '2rem' }}>
          Refresh Status
        </button>
      </div>
    );
  }

  // SCREEN: Finished
  if (isFinished) {
    return (
      <div className="competition-layout" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <CheckCircle size={48} color="#10b981" style={{ marginBottom: '1rem' }} />
        <h1 style={{ color: '#f8fafc', fontSize: '1.5rem', fontWeight: '500' }}>Competition Complete</h1>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Your final submissions have been recorded securely.</p>
        <button onClick={handleLogout} className="action-btn-primary" style={{ marginTop: '2rem' }}>
          Exit Arena
        </button>
      </div>
    );
  }

  // SCREEN: Anti-Cheat Warning
  if (showWarningScreen) {
    return (
      <div className="competition-layout" style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' }}>
        <div style={{ textAlign: 'center', maxWidth: '500px', padding: '40px', backgroundColor: '#1e293b', borderRadius: '8px', border: '1px solid #334155' }}>
          <AlertCircle size={48} color="#ef4444" style={{ marginBottom: '20px', margin: '0 auto' }} />
          <h1 style={{ color: '#f8fafc', fontSize: '1.5rem', margin: '15px 0', fontWeight: '600' }}>Tab Switch Detected</h1>
          <p style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '30px' }}>
            Navigating away from the competition arena is strictly prohibited. <br/><br/>
            You have <strong style={{color: '#ef4444'}}>{3 - warnings}</strong> warnings remaining. A penalty has been logged. Further violations will result in immediate disqualification.
          </p>
          <button 
            onClick={() => setShowWarningScreen(false)} 
            className="action-btn-danger"
          >
            Acknowledge & Return
          </button>
        </div>
      </div>
    );
  }

  if (!question) return <div className="loading-screen" style={{ color: '#64748b', textAlign: 'center', marginTop: '20vh' }}>Booting IDE Environment...</div>;

  // SCREEN: Active Arena
  return (
    <div className="competition-layout">
      <header className="terminal-header">
        <div className="brand"><Terminal size={18} /> SQL Environment</div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '600' }}>Global Time</span>
            <div className={`timer ${globalTimeLeft < 300 ? 'text-danger' : 'text-standard'}`}>
              <Clock size={14} /> {formatTime(globalTimeLeft)}
            </div>
          </div>
          
          <div className="points-badge">{question.points} PTS</div>
          <button onClick={handleLogout} className="exit-btn">
            <LogOut size={14} /> Exit
          </button>
        </div>
      </header>

      <main className="terminal-body">
        <div 
          className="question-panel"
          onCopy={(e) => e.preventDefault()}
          style={{ userSelect: 'none', WebkitUserSelect: 'none', msUserSelect: 'none' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 className="question-heading">Question {question.display_order}</h2>
            <div className={`question-timer ${questionTimeLeft < 30 ? 'bg-danger' : 'bg-standard'}`}>
               {formatTime(questionTimeLeft)}
            </div>
          </div>
          <p className="question-text">{question.question_text}</p>
          
          <div className="schema-hint">
            <h3 className="schema-heading"><Database size={14} /> Database Schema</h3>
            <ul>
              <li><code>books</code> (book_id: INT <span className="key-pk">PK</span>, title: TEXT, author_id: INT <span className="key-fk">FK</span>, published_year: INT, genre: TEXT, price: NUMERIC)</li>
              <li><code>authors</code> (author_id: INT <span className="key-pk">PK</span>, name: TEXT, birth_country: TEXT)</li>
              <li><code>library_members</code> (member_id: INT <span className="key-pk">PK</span>, name: TEXT, join_date: DATE, membership_type: TEXT)</li>
              <li><code>borrow_records</code> (record_id: INT <span className="key-pk">PK</span>, book_id: INT <span className="key-fk">FK</span>, member_id: INT <span className="key-fk">FK</span>, borrow_date: DATE, return_date: DATE)</li>
            </ul>
          </div>
        </div>

        <div className="editor-panel">
          <div className="editor-container">
            <Editor 
              height="100%" 
              defaultLanguage="sql" 
              theme="vs-dark" 
              value={sqlQuery} 
              onChange={(value) => setSqlQuery(value)} 
              options={{ 
                minimap: { enabled: false }, 
                fontSize: 14,
                fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
                contextmenu: false, 
                readOnly: false,
                padding: { top: 16 },
                scrollBeyondLastLine: false,
                smoothScrolling: true
              }} 
              onMount={(editor) => {
                editor.onKeyDown((e) => {
                  if ((e.ctrlKey || e.metaKey) && (e.keyCode === 52 || e.keyCode === 33)) {
                    e.preventDefault();
                    e.stopPropagation();
                  }
                });
              }}
            />
          </div>
          
          <div className="action-bar">
            {status === 'correct' ? (
              <button className="run-btn btn-success" onClick={() => fetchQuestion(question.display_order)}>
                Next Question <ArrowRight size={16} />
              </button>
            ) : (
              <button className={`run-btn ${status === 'executing' || isCooldown ? 'btn-disabled' : 'btn-primary'}`}
                  onClick={handleExecute} 
                  disabled={status === 'executing' || questionTimeLeft <= 0 || globalTimeLeft <= 0 || isCooldown}
              >
              {status === 'executing' ? 'Executing...' : (isCooldown ? 'Cooling down...' : <><Play size={14} /> Execute Query</>)}
              </button>
            )}
          </div>

          <div className={`output-terminal status-${status}`}>
            <div className="output-header">
              {status === 'correct' && <><CheckCircle size={14} /> Query Successful</>}
              {status === 'error' && <><AlertCircle size={14} /> Syntax / Execution Error</>}
              {status === 'incorrect' && <><AlertCircle size={14} /> Incorrect Result Set</>}
              {status === 'idle' && 'Console Output'}
            </div>
            <pre className="output-content">{terminalOutput}</pre>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CompetitionTerminal;
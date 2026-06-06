import React, { useState, useEffect ,useRef} from 'react';
import Editor from '@monaco-editor/react';
import { supabase } from '../supabaseClient';
import { Terminal, Clock, Play, Database, AlertCircle, CheckCircle, LogOut, ArrowRight, Lock } from 'lucide-react';
import './CompetitionTerminal.css';

const CompetitionTerminal = ({ programId, participantEmail }) => {
  const [question, setQuestion] = useState(null);
  const [isFinished, setIsFinished] = useState(false);
  const [isLocked, setIsLocked] = useState(true); // Locks terminal until Admin starts it
  const [terminalOutput, setTerminalOutput] = useState('Waiting for execution...');
  const [status, setStatus] = useState('idle');
  const [sqlQuery, setSqlQuery] = useState('');
  const [isCooldown, setIsCooldown] = useState(false);
  const penaltyCooldown = useRef(false);
  // Anti-Cheat State
  const [warnings, setWarnings] = useState(0);
  const [showWarningScreen, setShowWarningScreen] = useState(false);

  // Dual Timers
  const [globalTimeLeft, setGlobalTimeLeft] = useState(1200); // 20 mins = 1200s
  const [questionTimeLeft, setQuestionTimeLeft] = useState(120); // 2 mins = 120s

  // 1. Initial Boot & Admin Control Check
  useEffect(() => {
    const bootTerminal = async () => {
      // Check Admin Control Table
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

      // Handle Global 20-min Timer Persistence
      let globalStart = localStorage.getItem(`insightx_global_start_${programId}`);
      if (!globalStart) {
        globalStart = Date.now();
        localStorage.setItem(`insightx_global_start_${programId}`, globalStart);
      }

      // Handle Current Question Persistence
      const savedOrder = parseInt(localStorage.getItem(`insightx_current_order_${programId}`) || '0');
      fetchQuestion(savedOrder, true); // true = fetching on boot
    };

    bootTerminal();
  }, [programId]);

  // ANTI-CHEAT ENGINE: Detect Tab Switching & Focus Loss
  useEffect(() => {
    if (isFinished || isLocked || !question) return;

    const logPenalty = () => {
      // 1. If the lock is active, ignore the event entirely!
      if (penaltyCooldown.current) return;

      // 2. Lock the gate instantly
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

      // 3. Unlock the gate after 2 seconds so future cheating is caught
      setTimeout(() => {
        penaltyCooldown.current = false;
      }, 2000);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) logPenalty();
    };

    const handleWindowBlur = () => {
      logPenalty();
    };

    const handleContextMenu = (e) => e.preventDefault();

    // Listeners...
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [isFinished, isLocked, question, programId, participantEmail]);
  // 2. Fetch Question Logic
  const fetchQuestion = async (afterOrder = 0, isBoot = false) => {
    // If not booting, we are advancing. Save the new order so refresh doesn't jump back.
    if (!isBoot) {
      localStorage.setItem(`insightx_current_order_${programId}`, afterOrder);
    }

    const { data, error } = await supabase
      .from('competition_questions')
      .select('*')
      .eq('program_id', programId)
      .gt('display_order', isBoot ? afterOrder - 1 : afterOrder) // Adjust for boot vs advance
      .order('display_order', { ascending: true })
      .limit(1)
      .maybeSingle();
      
    if (data) {
      setQuestion(data);
      setStatus('idle');
      setTerminalOutput('Waiting for execution...');
      
      // Load saved code
      const savedCode = localStorage.getItem(`insightx_code_${programId}_${data.id}`);
      setSqlQuery(savedCode || '-- Write your SQL query here\n');

      // Question Timer Persistence (Anti-Cheat)
      let qStart = localStorage.getItem(`insightx_q_start_${programId}_${data.id}`);
      if (!qStart) {
        qStart = Date.now();
        localStorage.setItem(`insightx_q_start_${programId}_${data.id}`, qStart);
      }
    } else {
      setIsFinished(true);
    }
  };

  // 3. Auto-Save Code
  useEffect(() => {
    if (question && sqlQuery) {
      localStorage.setItem(`insightx_code_${programId}_${question.id}`, sqlQuery);
    }
  }, [sqlQuery, question, programId]);

  // 4. The Master Clock Engine (Handles both timers via absolute math)
  useEffect(() => {
    if (isLocked || !question || isFinished) return;

    const tick = setInterval(() => {
      const now = Date.now();

      // Calculate Global Time
      const globalStart = parseInt(localStorage.getItem(`insightx_global_start_${programId}`));
      const globalElapsed = Math.floor((now - globalStart) / 1000);
      const gTimeLeft = Math.max(1200 - globalElapsed, 0); // 1200s = 20m
      setGlobalTimeLeft(gTimeLeft);

      if (gTimeLeft <= 0) {
        setIsFinished(true);
        clearInterval(tick);
        return;
      }

      // Calculate Question Time (Only if they haven't solved it yet)
      if (status !== 'correct') {
        const qStart = parseInt(localStorage.getItem(`insightx_q_start_${programId}_${question.id}`));
        const qElapsed = Math.floor((now - qStart) / 1000);
        const qTimeLeft = Math.max(120 - qElapsed, 0); // 120s = 2m
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
    if (!sqlQuery.trim() || isCooldown) return; // Block if in cooldown
    
    setStatus('executing');
    setIsCooldown(true); // Lock the button!
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
      // Unlock the button after 3 seconds, no matter what happens
      setTimeout(() => {
        setIsCooldown(false);
      }, 3000); 
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/'; 
  };

  // UI FORMATTING HELPER
  const formatTime = (seconds) => `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;

  // SCREEN: Locked by Admin
  if (isLocked) {
    return (
      <div className="competition-layout" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Lock size={64} color="#00bfff" style={{ marginBottom: '1rem' }} />
        <h1 style={{ color: '#fff' }}>Arena is Locked</h1>
        <p style={{ color: '#94a3b8' }}>The competition has not been started by the administrator yet.</p>
        <button onClick={() => window.location.reload()} style={{ marginTop: '2rem', padding: '10px 20px', background: '#00bfff', color: '#000', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          Refresh Status
        </button>
      </div>
    );
  }

  // SCREEN: Finished
  if (isFinished) {
    return (
      <div className="competition-layout" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <CheckCircle size={64} color="#4ade80" style={{ marginBottom: '1rem' }} />
        <h1 style={{ color: '#fff' }}>Competition Complete!</h1>
        <button onClick={handleLogout} style={{ marginTop: '2rem', padding: '10px 20px', background: '#00bfff', color: '#000', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          Exit Arena
        </button>
      </div>
    );
  }

  // SCREEN OVERRIDE: Anti-Cheat Warning
  if (showWarningScreen) {
    return (
      <div className="competition-layout" style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: '#450a0a' }}>
        <div style={{ textAlign: 'center', maxWidth: '600px', padding: '40px', backgroundColor: '#7f1d1d', borderRadius: '12px', border: '2px solid #ef4444' }}>
          <AlertCircle size={64} color="#fca5a5" style={{ marginBottom: '20px' }} />
          <h1 style={{ color: '#fff', fontSize: '2.5rem', margin: '0 0 10px 0' }}>TAB SWITCH DETECTED</h1>
          <p style={{ color: '#fca5a5', fontSize: '1.2rem', lineHeight: '1.6' }}>
            Navigating away from the competition arena is strictly prohibited. <br/><br/>
            You have <strong>{3 - warnings}</strong> warnings remaining. A penalty has been logged to your score. If you switch tabs again, your session will be permanently terminated.
          </p>
          <button 
            onClick={() => setShowWarningScreen(false)} 
            style={{ 
              marginTop: '30px', padding: '15px 30px', background: '#ef4444', color: '#fff', 
              border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem' 
            }}
          >
            I Understand, Return to Arena
          </button>
        </div>
      </div>
    );
  }

  if (!question) return <div className="loading-screen" style={{ color: '#00bfff', textAlign: 'center', marginTop: '20vh' }}>Booting SQL Environment...</div>;

  // SCREEN: Active Arena
  return (
    <div className="competition-layout">
      <header className="terminal-header">
        <div className="brand"><Terminal size={20} /> SQL Engine</div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          {/* Global Timer */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>Total Time Left</span>
            <div className={`timer ${globalTimeLeft < 300 ? 'danger' : ''}`} style={{ color: '#00bfff' }}>
              <Clock size={16} /> {formatTime(globalTimeLeft)}
            </div>
          </div>
          
          <div className="points-badge">{question.points} Points</div>
          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', color: '#ff007f', border: '1px solid #ff007f', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>Question {question.display_order}</h2>
            {/* Question Timer */}
            <div className={`timer ${questionTimeLeft < 30 ? 'danger' : ''}`} style={{ fontSize: '1rem', background: 'rgba(255, 0, 127, 0.1)', padding: '4px 10px', borderRadius: '4px', color: '#ff007f' }}>
               {formatTime(questionTimeLeft)}
            </div>
          </div>
          <p className="question-text">{question.question_text}</p>
          
          <div className="schema-hint">
            <h3><Database size={16} /> Available Tables</h3>
            <ul>
              <li><code>books</code> (book_id: INT <b>[PK]</b>, title: TEXT, author_id: INT <b>[FK]</b>, published_year: INT, genre: TEXT, price: NUMERIC)</li>
              <li><code>authors</code> (author_id: INT <b>[PK]</b>, name: TEXT, birth_country: TEXT)</li>
              <li><code>library_members</code> (member_id: INT <b>[PK]</b>, name: TEXT, join_date: DATE, membership_type: TEXT)</li>
              <li><code>borrow_records</code> (record_id: INT <b>[PK]</b>, book_id: INT <b>[FK]</b>, member_id: INT <b>[FK]</b>, borrow_date: DATE, return_date: DATE)</li>
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
                fontSize: 16,
                contextmenu: false, // Disables right-click inside the editor
                readOnly: false
              }} 
              // Prevent standard keyboard pasting (Ctrl+V / Cmd+V)
              onMount={(editor) => {
                editor.onKeyDown((e) => {
                  if ((e.ctrlKey || e.metaKey) && (e.keyCode === 52 /* V */ || e.keyCode === 33 /* C */)) {
                    e.preventDefault();
                    e.stopPropagation();
                  }
                });
              }}
            />
          </div>
          
          <div className="action-bar">
            {status === 'correct' ? (
              <button className="run-btn" style={{ background: '#4ade80', color: '#000' }} onClick={() => fetchQuestion(question.display_order)}>
                Next Question <ArrowRight size={16} />
              </button>
            ) : (
              <button className="run-btn" 
                  onClick={handleExecute} 
                  disabled={status === 'executing' || questionTimeLeft <= 0 || globalTimeLeft <= 0 || isCooldown}
              >
              {status === 'executing' ? 'Executing...' : (isCooldown ? 'Cooling down...' : <><Play size={16} /> Run Query</>)}
              </button>
            )}
          </div>

          <div className={`output-terminal status-${status}`}>
            <div className="output-header">
              {status === 'correct' && <><CheckCircle size={16} /> Query Successful</>}
              {status === 'error' && <><AlertCircle size={16} /> SQL Error</>}
              {status === 'incorrect' && <><AlertCircle size={16} /> Incorrect Output</>}
              {status === 'idle' && 'Output Console'}
            </div>
            <pre>{terminalOutput}</pre>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CompetitionTerminal;
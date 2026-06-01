import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { supabase } from '../supabaseClient'; // Update this path if needed
import { Terminal, Clock, Play, Database, AlertCircle, CheckCircle } from 'lucide-react';
import './CompetitionTerminal.css';

const CompetitionTerminal = ({ programId, participantEmail }) => {
  const [question, setQuestion] = useState(null);
  const [sqlQuery, setSqlQuery] = useState('-- Write your SQL query here\nSELECT * FROM books;');
  const [terminalOutput, setTerminalOutput] = useState('Waiting for execution...');
  const [status, setStatus] = useState('idle'); // idle, executing, correct, error
  const [timeLeft, setTimeLeft] = useState(300);

  // Fetch the first question on load
  useEffect(() => {
    const fetchQuestion = async () => {
      const { data, error } = await supabase
        .from('competition_questions')
        .select('*')
        .eq('program_id', programId)
        .order('display_order', { ascending: true })
        .limit(1)
        .single();
        
      if (data) {
        setQuestion(data);
        setTimeLeft(data.time_limit_seconds);
      }
    };
    fetchQuestion();
  }, [programId]);

  // Handle the Run Query Button
  const handleExecute = async () => {
    if (!sqlQuery.trim()) return;
    setStatus('executing');
    setTerminalOutput('Connecting to secure InsightX execution engine...');

    try {
      // This is where we call your newly deployed Edge Function!
      const { data, error } = await supabase.functions.invoke('evaluate-query', {
        body: {
          program_id: programId,
          participant_email: participantEmail,
          question_id: question.id,
          submitted_query: sqlQuery
        }
      });

      if (error) throw error;

      setStatus(data.status); // 'correct', 'error', or 'incorrect'
      setTerminalOutput(JSON.stringify(data.output, null, 2));

    } catch (err) {
      setStatus('error');
      setTerminalOutput(`Execution Failed: ${err.message}`);
    }
  };

  if (!question) return <div className="loading-screen">Booting InsightX Environment...</div>;

  return (
    <div className="competition-layout">
      {/* Top Navigation Bar */}
      <header className="terminal-header">
        <div className="brand"><Terminal size={20} /> InsightX SQL Engine</div>
        <div className={`timer ${timeLeft < 60 ? 'danger' : ''}`}>
          <Clock size={18} /> {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
        </div>
        <div className="points-badge">{question.points} Points</div>
      </header>

      <main className="terminal-body">
        {/* Left Side: Question Context */}
        <div className="question-panel">
          <h2>Question {question.display_order}</h2>
          <p className="question-text">{question.question_text}</p>
          
          <div className="schema-hint">
            <h3><Database size={16} /> Available Tables</h3>
            <ul>
              <li><code>books</code> (book_id, title, author_id, genre, price)</li>
              <li><code>authors</code> (author_id, name, birth_country)</li>
              <li><code>library_members</code> (member_id, name, join_date)</li>
              <li><code>borrow_records</code> (record_id, book_id, member_id, borrow_date)</li>
            </ul>
          </div>
        </div>

        {/* Right Side: Code Editor & Output Terminal */}
        <div className="editor-panel">
          <div className="editor-container">
            <Editor
              height="100%"
              defaultLanguage="sql"
              theme="vs-dark"
              value={sqlQuery}
              onChange={(value) => setSqlQuery(value)}
              options={{ minimap: { enabled: false }, fontSize: 16 }}
            />
          </div>
          
          <div className="action-bar">
            <button 
              className="run-btn" 
              onClick={handleExecute} 
              disabled={status === 'executing'}
            >
              {status === 'executing' ? 'Executing...' : <><Play size={16} /> Run Query</>}
            </button>
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
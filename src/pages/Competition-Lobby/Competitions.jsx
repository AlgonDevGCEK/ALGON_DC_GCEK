import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { Clock, Calendar, ChevronRight, Terminal, Code, HelpCircle, Lock } from 'lucide-react';
import './Competitions.css';

// Dummy data for upcoming/planned competitions
const DUMMY_COMPETITIONS = [
  {
    program_id: 'dummy-python-101',
    is_active: false,
    start_time: '2026-07-15T10:00:00Z',
    duration_minutes: 60,
    programs: {
      title: 'Python Algorithmic Challenge',
      description: 'Solve complex data structure and algorithmic problems using Python. Optimize for both time and space complexity in a secure IDE.',
      type: 'coding'
    }
  },
  {
    program_id: 'dummy-quiz-202',
    is_active: false,
    start_time: '2026-08-01T14:00:00Z',
    duration_minutes: 30,
    programs: {
      title: 'Tech Trivia & Logic Quiz',
      description: 'Test your knowledge across multiple technology domains including web development, cloud architecture, and cybersecurity.',
      type: 'quiz'
    }
  }
];

const Competitions = () => {
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCompetitions();
  }, []);

  const fetchCompetitions = async () => {
    try {
      // Fetch real data from Supabase
      const { data, error } = await supabase
        .from('competition_control')
        .select(`
          program_id,
          is_active,
          start_time,
          duration_minutes,
          programs ( title, description )
        `);

      if (error) throw error;

      // Merge real database competitions with our static dummy ones
      const combinedData = [...(data || []), ...DUMMY_COMPETITIONS];
      setCompetitions(combinedData);
      
    } catch (error) {
      console.error("Error fetching competitions:", error.message);
      // Fallback to dummies if DB fails
      setCompetitions(DUMMY_COMPETITIONS);
    } finally {
      setLoading(false);
    }
  };

  const handleEnterCompetition = (programId, isActive) => {
    if (isActive) {
      navigate(`/competition/${programId}`);
    }
  };

  const formatTime = (isoString) => {
    if (!isoString) return 'TBA';
    const date = new Date(isoString);
    return date.toLocaleString('en-US', { 
      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true 
    });
  };

  // Helper to pick an icon based on title/type
  const getIcon = (title = '') => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('python') || lowerTitle.includes('code')) return <Code size={24} />;
    if (lowerTitle.includes('quiz') || lowerTitle.includes('trivia')) return <HelpCircle size={24} />;
    return <Terminal size={24} />; // Default SQL/Terminal icon
  };

  return (
    <div className="competitions-page-wrapper">
      <div className="competitions-container">
        
        <div className="competitions-header animate-fade-in">
          <h1 className="page-title">Active <span className="highlight-azure">Arenas</span></h1>
          <p className="page-subtitle">
            Select your event. Access to the secure IDE and testing environments is restricted until the administrator activates the competition.
          </p>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Initializing arenas...</p>
          </div>
        ) : (
          <div className="competitions-grid">
            {competitions.map((comp) => (
              <div key={comp.program_id} className={`comp-card animate-scale-in ${comp.is_active ? 'is-live' : ''}`}>
                
                <div className="comp-card-header">
                  <div className="comp-icon-wrapper">
                    {getIcon(comp.programs?.title)}
                  </div>
                  <div className={`comp-status-badge ${comp.is_active ? 'badge-live' : 'badge-waiting'}`}>
                    {comp.is_active ? <><span className="pulse-dot"></span> LIVE</> : <><Lock size={12} /> LOCKED</>}
                  </div>
                </div>

                <div className="comp-content">
                  <h2 className="comp-title">{comp.programs?.title || "Untitled Arena"}</h2>
                  <p className="comp-description">
                    {comp.programs?.description || "A secure testing environment for this competition."}
                  </p>

                  <div className="comp-meta-grid">
                    <div className="meta-item">
                      <Calendar size={16} />
                      <span>{formatTime(comp.start_time)}</span>
                    </div>
                    <div className="meta-item">
                      <Clock size={16} />
                      <span>{comp.duration_minutes} Mins</span>
                    </div>
                  </div>

                  <button 
                    className={`comp-action-btn ${comp.is_active ? 'btn-active' : 'btn-disabled'}`}
                    onClick={() => handleEnterCompetition(comp.program_id, comp.is_active)}
                    disabled={!comp.is_active}
                  >
                    {comp.is_active ? 'Enter Gateway' : 'Access Restricted'}
                    <ChevronRight size={18} />
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Competitions;
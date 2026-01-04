import React, { useState, useEffect } from 'react';
import { 
  Calendar, Code, Database, Zap, Trophy, Clock, ArrowRight, 
  Lock, ExternalLink, X, Shield, Cloud, Link as LinkIcon, FileText, BarChart2 
} from 'lucide-react';
import { supabase } from '../../supabaseClient';
import './insightx.css';
import { NavLink } from 'react-router-dom';

const iconMap = { 'Database': Database, 'Zap': Zap, 'Code': Code, 'Shield': Shield };

const InsightXLanding = () => {
  // --- STATE ---
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [eventDate, setEventDate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [domains, setDomains] = useState([]);
  
  // Modal & Submission State
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ teamName: '', projectLink: '' });
  const [status, setStatus] = useState({ loading: false, msg: '', type: '' });

  // --- 1. FETCH PUBLIC DATA ---
  useEffect(() => {
    const init = async () => {
      try {
        const { data: ev } = await supabase.from('insightx_event').select('start_date').single();
        if (ev) setEventDate(new Date(ev.start_date).getTime());

        const { data: d } = await supabase.from('insightx_domains').select('*').order('id');
        if (d) setDomains(d);
      } catch (e) {
        console.error("Setup Error", e);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  // --- 2. TIMER ---
  useEffect(() => {
    if (!eventDate) return;
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const dist = eventDate - now;
      if (dist < 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(interval);
      } else {
        setTimeLeft({
          days: Math.floor(dist / (1000 * 60 * 60 * 24)),
          hours: Math.floor((dist % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((dist % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((dist % (1000 * 60)) / 1000)
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [eventDate]);

  // --- 3. SUBMISSION HANDLER ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.teamName.trim() || !form.projectLink.trim()) return;

    setStatus({ loading: true, msg: 'Verifying Team...', type: 'info' });

    try {
      const { data, error } = await supabase.rpc('submit_project_securely', {
        p_team_name: form.teamName.trim(),
        p_domain_id: selectedDomain.id,
        p_project_link: form.projectLink.trim()
      });

      if (error) throw error;

      if (data.success) {
        setStatus({ loading: false, msg: data.message, type: 'success' });
        setTimeout(() => {
          setIsModalOpen(false);
          setForm({ teamName: '', projectLink: '' });
          setStatus({ loading: false, msg: '', type: '' });
        }, 2000);
      } else {
        setStatus({ loading: false, msg: data.message, type: 'error' });
      }

    } catch (err) {
      console.error(err);
      setStatus({ loading: false, msg: "System Error. Try again.", type: 'error' });
    }
  };

  const openModal = (domain) => {
    if (domain.status === 'upcoming') return;
    setSelectedDomain(domain);
    setIsModalOpen(true);
    setStatus({ loading: false, msg: '', type: '' });
  };

  const renderIcon = (name) => {
    const Icn = iconMap[name] || Database;
    return <Icn size={40} />;
  };

  return (
    <div className="insightx-landing">
      {/* --- HERO --- */}
      <div className="hero-section">
        <div className="container">
          <div className="hero-centered-content">
            <div className="badge"><span>ADC GCEK Presents</span></div>
            <h1 className="main-title">Insight<span className="title-accent">X</span></h1>
            <p className="subtitle">The 6-Week Innovation Marathon</p>
            <p className="description">
              One Team. Six Domains. Infinite Possibilities.<br/>
              Don't just code. Build the future.
            </p>

            <NavLink to="/insightx-register">
              <button className="cta-button">Register Your Team <ArrowRight className="button-icon" /></button>
            </NavLink>

            {/* Countdown */}
            <div className="countdown-wrapper">
               <p className="countdown-label">Challenge Starts In</p>
               {isLoading && !eventDate ? <div className="text-gray-400">Loading...</div> : (
                 <div className="countdown-grid">
                   {Object.entries(timeLeft).map(([unit, val]) => (
                     <div key={unit} className="countdown-item glass-card">
                       <div className="countdown-value">{String(val).padStart(2, '0')}</div>
                       <div className="countdown-label-small">{unit}</div>
                     </div>
                   ))}
                 </div>
               )}
            </div>
          </div>
        </div>
      </div>

      {/* --- DOMAINS GRID --- */}
      <div className="about-section">
        <div className="container">
          <h2 className="section-title">The Battleground</h2>
          
          <div className="domains-grid">
            {domains.map((domain) => (
              <div 
                key={domain.id} 
                className={`domain-card glass-card group ${domain.status}`}
                onClick={() => openModal(domain)}
              >
                <div className={`domain-icon ${domain.status === 'upcoming' ? 'grayscale' : ''}`}>
                  {domain.status === 'upcoming' ? <Lock size={32}/> : renderIcon(domain.icon_name)}
                </div>
                
                <h3 className="domain-title">{domain.title}</h3>
                <p className="domain-description">{domain.short_desc}</p>
                
                <div className={`status-badge ${domain.status}`}>
                  {domain.status === 'upcoming' ? 'Locked' : domain.status === 'live' ? 'View Challenge' : 'Closed'}
                </div>
              </div>
            ))}
          </div>

          {/* --- ROADMAP --- */}
           <div className="how-it-works">
            <h2 className="section-title">The Roadmap</h2>
            <div className="flowchart-container">
              {[
                { step: "1", title: "Register Team", desc: "Lock your unique Team Name" },
                { step: "2", title: "Choose Domain", desc: "Select active challenge" },
                { step: "3", title: "Build", desc: "Access Drive & Resources" },
                { step: "4", title: "Submit", desc: "Verify Team & Upload" },
                { step: "5", title: "Win", desc: "Top the Charts" }
              ].map((item, i) => (
                <div key={i} className="flow-step">
                  <div className="flow-circle">{item.step}</div>
                  <h4>{item.title}</h4>
                  <p>{item.desc}</p>
                  {i < 4 && <div className="flow-line"></div>}
                </div>
              ))}
            </div>
          </div>

          {/* --- NEW LEADERBOARD SECTION --- */}
          <div className="leaderboard-section">
            <div className="leaderboard-banner glass-card">
              <div className="lb-content">
                <Trophy size={48} className="lb-icon" />
                <h2>Hall of Fame</h2>
                <p>Check the live standings. Filter by domain to see who is leading the race.</p>
                
                <NavLink to="/leaderboard">
                   <button className="lb-button">
                     <BarChart2 size={20} /> View Leaderboard
                   </button>
                </NavLink>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* --- SUBMISSION MODAL --- */}
      {isModalOpen && selectedDomain && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content glass-card" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setIsModalOpen(false)}><X size={24}/></button>
            
            <div className="modal-header">
              {renderIcon(selectedDomain.icon_name)}
              <h2>{selectedDomain.title}</h2>
              <span className={`status-badge ${selectedDomain.status}`}>{selectedDomain.status}</span>
            </div>

            <div className="modal-body">
              {/* Objective */}
              <div className="objective-text">
                <p><strong>🎯 Objective:</strong> {selectedDomain.full_desc || "Details coming soon..."}</p>
              </div>

              {/* 📂 RESOURCE DRIVE LINK (NEW) */}
              {selectedDomain.resources_link && (
                <a href={selectedDomain.resources_link} target="_blank" rel="noopener noreferrer" className="resource-link-btn">
                  <ExternalLink size={20} />
                  <span>Access Materials & Problem Statement</span>
                  <p className="sub-text">Open Google Drive / GitHub</p>
                </a>
              )}

              <div className="modal-meta">
                <p><strong>📅 Deadline:</strong> {selectedDomain.deadline ? new Date(selectedDomain.deadline).toDateString() : 'TBA'}</p>
              </div>

              <hr className="divider"/>

              {/* --- SECURE SUBMISSION FORM --- */}
              <div className="submission-section">
                <h3>Submit Solution</h3>
                
                {selectedDomain.status === 'closed' ? (
                  <div className="warning-box">⛔ Submissions Closed</div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    
                    <div className="form-group">
                      <label className="input-label">Team Name (Must match Registration)</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Code Warriors" 
                        required
                        className="input-field"
                        value={form.teamName}
                        onChange={e => setForm({...form, teamName: e.target.value})}
                      />
                    </div>

                    <div className="form-group">
                      <label className="input-label">Project Link</label>
                      <input 
                        type="url" 
                        placeholder="GitHub / Drive Link" 
                        required
                        className="input-field"
                        value={form.projectLink}
                        onChange={e => setForm({...form, projectLink: e.target.value})}
                      />
                    </div>

                    {status.msg && (
                      <div className={`status-msg ${status.type}`}>
                        {status.msg}
                      </div>
                    )}

                    <button type="submit" className="submit-btn" disabled={status.loading}>
                      {status.loading ? 'Verifying...' : 'Verify & Submit'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InsightXLanding;
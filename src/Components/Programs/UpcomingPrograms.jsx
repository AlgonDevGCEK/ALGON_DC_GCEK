import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient'; 
import { X, Clock, MapPin, Calendar, Users, ArrowRight, Sparkles } from 'lucide-react';
import './UpcomingPrograms.css';

const UpcomingPrograms = () => {
  const [programs, setPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPrograms();
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (selectedProgram) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedProgram]);

  const fetchPrograms = async () => {
    try {
      const { data, error } = await supabase
        .from('programs')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;
      setPrograms(data);
    } catch (error) {
      console.error("Error fetching programs:", error);
    } finally {
      setLoading(false);
    }
  };

  const getEventStatus = (dateStr) => {
    const eventDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (eventDate < today) return { label: 'Ended', style: 'badge-ended' };
    if (eventDate.toDateString() === today.toDateString()) return { label: 'Happening Now', style: 'badge-live' };
    return { label: 'Upcoming', style: 'badge-upcoming' };
  };

  const handleCardClick = (program, e) => {
    e.stopPropagation();
    setSelectedProgram(program);
  };

  const handleCloseModal = (e) => {
    e.stopPropagation();
    setSelectedProgram(null);
  };

  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div id="upcoming-programs" className="upcoming-section">
      <div className="upcoming-container">
        
        <div className="upcoming-header animate-fade-in">
          <div className="header-icon">
            <Sparkles size={40} />
          </div>
          <h2 className="upcoming-title">Programs & Events</h2>
          <p className="upcoming-subtitle">Join our exciting events and level up your skills</p>
        </div>

        {loading && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading events...</p>
          </div>
        )}

        <div className="upcoming-grid">
          {programs.map((program, index) => {
            const status = getEventStatus(program.date);

            return (
              <div 
                key={program.id} 
                className="program-card animate-slide-up" 
                onClick={(e) => handleCardClick(program, e)}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="card-glow"></div>
                <span className={`program-badge ${status.style}`}>
                  {status.label}
                </span>

                <h3 className="program-title">{program.title}</h3>
                <p className="program-description">{program.description}</p>

                <div className="program-meta">
                  <div className="meta-item">
                    <Calendar size={16}/>
                    <span>{program.date}</span>
                  </div>
                  <div className="meta-item">
                    <Clock size={16}/>
                    <span>{program.time}</span>
                  </div>
                </div>

                <div className="program-footer">
                  <div className="program-seats">
                    <span className="seats-indicator"></span>
                    <span>{program.total_seats} Seats</span>
                  </div>
                  <button className="register-btn">
                    View Details
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedProgram && (
        <div 
          className="program-modal-overlay animate-fade-in" 
          onClick={handleCloseModal}
        >
          <div 
            className="program-modal animate-scale-in" 
            onClick={handleModalClick}
          >
            <button className="modal-close" onClick={handleCloseModal}>
              <X size={24} />
            </button>

            <div className="modal-content">
              <div className="modal-header">
                <span className="modal-type-badge">{selectedProgram.type}</span>
                <h2>{selectedProgram.title}</h2>
              </div>
              
              <div className="modal-grid">
                <div className="modal-info">
                  <div className="info-row">
                    <Calendar className="icon"/>
                    <span>{selectedProgram.date}</span>
                  </div>
                  <div className="info-row">
                    <Clock className="icon"/>
                    <span>{selectedProgram.time}</span>
                  </div>
                  <div className="info-row">
                    <MapPin className="icon"/>
                    <span>{selectedProgram.location}</span>
                  </div>
                  <div className="info-row">
                    <Users className="icon"/>
                    <span>{selectedProgram.total_seats} Capacity</span>
                  </div>
                </div>
                
                <div className={`status-box ${getEventStatus(selectedProgram.date).style}`}>
                  <strong>Status</strong>
                  <span>{getEventStatus(selectedProgram.date).label}</span>
                </div>
              </div>

              <div className="modal-description">
                <h3>About the Event</h3>
                <p>{selectedProgram.full_details || selectedProgram.description}</p>
              </div>

              <div className="modal-actions">
                <button 
                  className="modal-register-btn"
                  onClick={() => navigate(`/register/${selectedProgram.id}`)}
                  disabled={getEventStatus(selectedProgram.date).label === 'Ended'}
                >
                  {getEventStatus(selectedProgram.date).label === 'Ended' ? (
                    'Event Closed'
                  ) : (
                    <>
                      Proceed to Registration
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpcomingPrograms;
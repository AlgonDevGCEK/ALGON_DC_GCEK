import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient'; 
import { X, Clock, MapPin, Calendar, Users, ArrowRight, ImageIcon, Banknote, } from 'lucide-react'; 
import './UpcomingPrograms.css';

const UpcomingPrograms = () => {
  const [programs, setPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPrograms();
  }, []);

  // Sticky Scroll Fix
  useEffect(() => {
    if (selectedProgram) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [selectedProgram]);

  const fetchPrograms = async () => {
    try {
      setLoading(true);

      // 1. Fetch Programs
      const { data: programsData, error: progError } = await supabase
        .from('programs')
        .select('*')
        .order('display_order', { ascending: true }) 
        .order('date', { ascending: true });

      if (progError) throw progError;

      // Count 'pending' too, to prevent overbooking while admin verifies
      const { data: regData, error: regError } = await supabase
        .from('registrations')
        .select('event_id');

      if (regError) throw regError;

      // 3. Calculate Counts
      const seatCounts = {};
      regData.forEach(reg => {
        seatCounts[reg.event_id] = (seatCounts[reg.event_id] || 0) + 1;
      });

      // 4. Merge Data
      const mergedPrograms = programsData.map(prog => {
        const booked = seatCounts[prog.id] || 0;
        const left = Math.max(0, prog.total_seats - booked);
        return { ...prog, seats_left: left };
      });

      setPrograms(mergedPrograms);
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

  //  Seat Color Logic 
  const getSeatColor = (left, total) => {
    if (left === 0) return '#ef4444'; 
    const ratio = left / total;
    if (ratio < 0.25 || left < 10) return '#f97316'; 
    return '#10b981'; 
  };

  const handleCardClick = (program, e) => {
    e.stopPropagation();
    setSelectedProgram(program);
  };

  const handleCloseModal = (e) => {
    e.stopPropagation();
    setSelectedProgram(null);
  };

  return (
    <div id="upcoming-programs" className="upcoming-section">
      <div className="upcoming-container">
        
        <div className="upcoming-header animate-fade-in">
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
            const isPaid = program.is_paid;
            const isFull = program.seats_left === 0;
            const seatColor = getSeatColor(program.seats_left, program.total_seats);

            return (
              <div 
                key={program.id} 
                className={`program-card animate-slide-up ${isPaid ? 'paid-card' : ''}`} 
                onClick={(e) => handleCardClick(program, e)}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="card-image-container">
                  <span className={`program-badge ${status.style}`}>
                    {status.label}
                  </span>
                  
                  {isPaid && (
                    <span className="paid-badge">
                        <Banknote size={12} /> ₹{program.fee_amount}
                    </span>
                  )}

                  {/* FULL BADGE OVERLAY */}
                  {isFull && (
                    <div className="full-overlay">
                        HOUSE FULL
                    </div>
                  )}

                  {program.image_url ? (
                    <img src={program.image_url} alt={program.title} className="card-img" loading="lazy" />
                  ) : (
                    <div className="card-img-placeholder"><ImageIcon size={40} opacity={0.3} /></div>
                  )}
                  <div className="card-overlay"></div>
                </div>

                <div className="card-content">
                  <h3 className="program-title">
                    {program.title}
                  </h3>
                  <p className="program-description">{program.description}</p>

                  <div className="program-meta">
                    <div className="meta-item"><Calendar size={16}/><span>{program.date}</span></div>
                    <div className="meta-item"><Clock size={16}/><span>{program.time}</span></div>
                  </div>

                  <div className="program-footer">
                    {/* --- DYNAMIC SEATS --- */}
                    <div className="program-seats" style={{ color: isFull ? '#ef4444' : '#94a3b8' }}>
                      <span 
                        className="seats-indicator" 
                        style={{ 
                            backgroundColor: seatColor,
                            boxShadow: `0 0 8px ${seatColor}` 
                        }}
                      ></span>
                      <span>
                        {isFull ? "Sold Out" : `${program.seats_left} Seats Left`}
                      </span>
                    </div>
                    
                    {/* --- BUTTON LOGIC --- */}
                    <button 
                        className={`register-btn ${isPaid ? 'btn-paid' : ''}`}
                        disabled={isFull}
                        style={isFull ? { opacity: 0.5, cursor: 'not-allowed', filter: 'grayscale(1)' } : {}}
                    >
                      {isFull ? "Full" : (isPaid ? "View" : "View")} 
                      {!isFull && <ArrowRight size={16} />}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* --- MODAL --- */}
      {selectedProgram && (
        <div className="program-modal-overlay animate-fade-in" onClick={handleCloseModal}>
          <div className="program-modal animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={handleCloseModal}><X size={24} /></button>

            {selectedProgram.image_url && (
              <div className="modal-hero-image">
                 <img src={selectedProgram.image_url} alt={selectedProgram.title} />
              </div>
            )}

            <div className="modal-content">
              <div className="modal-header">
                <div className="modal-badges">
                    <span className="modal-type-badge">{selectedProgram.type}</span>
                    {selectedProgram.is_paid && <span className="modal-paid-badge">Paid Event</span>}
                </div>
                <h2>{selectedProgram.title}</h2>
              </div>
              
              <div className="modal-grid">
                <div className="modal-info">
                  <div className="info-row"><Calendar className="icon"/><span>{selectedProgram.date}</span></div>
                  <div className="info-row"><Clock className="icon"/><span>{selectedProgram.time}</span></div>
                  <div className="info-row"><MapPin className="icon"/><span>{selectedProgram.location}</span></div>
                  <div className="info-row">
                      <Users className="icon"/>
                      <span style={{ color: getSeatColor(selectedProgram.seats_left, selectedProgram.total_seats) }}>
                          {selectedProgram.seats_left} / {selectedProgram.total_seats} Seats Available
                      </span>
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
                {selectedProgram.is_paid && (
                    <div className="fee-notice">
                        <strong>Registration Fee:</strong> ₹{selectedProgram.fee_amount}
                    </div>
                )}
              </div>

              <div className="modal-actions">
                <button 
                  className="modal-register-btn"
                  onClick={() => navigate(`/register/${selectedProgram.id}`)}
                  disabled={getEventStatus(selectedProgram.date).label === 'Ended' || selectedProgram.seats_left === 0}
                >
                  {selectedProgram.seats_left === 0 
                     ? 'Registrations Closed (House Full)' 
                     : (getEventStatus(selectedProgram.date).label === 'Ended' 
                        ? 'Event Closed' 
                        : (selectedProgram.is_paid ? `Proceed to Registration` : 'Proceed to Registration')
                       )
                  }
                  {selectedProgram.seats_left > 0 && <ArrowRight size={18} />}
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
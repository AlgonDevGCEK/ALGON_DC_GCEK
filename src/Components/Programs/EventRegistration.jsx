import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { MessageCircle, CheckCircle, ArrowLeft, Calendar, MapPin, UserCheck, Smartphone } from 'lucide-react';
import './EventRegistration.css';

const EventRegistration = () => {
  const { id } = useParams(); // Get event ID from URL
  const navigate = useNavigate();
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [isMember, setIsMember] = useState(false); // Track privileges
  
  // Form State
  const [formData, setFormData] = useState({
    full_name: '',
    branch: '',
    year: '1st Year',
    phone_number: '',
    email: ''
  });

  // 1. Fetch Event & Check Member Status
  useEffect(() => {
    const fetchData = async () => {
      // Get Event Info
      const { data: eventData, error } = await supabase
        .from('programs')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error || !eventData) {
        alert("Event not found!");
        navigate('/upcoming-programs');
        return;
      }
      setEvent(eventData);

      // Check Session & Auto-fill
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsMember(true);
        // Fetch Member Details
        const { data: memberData } = await supabase
          .from('members')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        // Autofill Logic
        setFormData(prev => ({
          ...prev,
          email: session.user.email,
          full_name: memberData?.full_name || '',
          branch: memberData?.branch || '',
          phone_number: memberData?.phone_number || ''
        }));
      }
      setLoading(false);
    };

    fetchData();
  }, [id, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Save to Supabase
    const { error } = await supabase
      .from('registrations')
      .insert([{ event_id: id, ...formData }]);

    if (error) {
      alert("Registration failed. Please try again.");
      console.error(error);
    } else {
      setSubmitted(true);
    }
  };

  if (loading) return <div className="loading-screen">Loading details...</div>;

  return (
    <div className="reg-page-wrapper">
      <div className="reg-container">
        
        {/* Back Button */}
        <button onClick={() => navigate(-1)} className="back-nav-btn">
          <ArrowLeft size={18} /> Back
        </button>

        {submitted ? (
          // --- SUCCESS STATE ---
          <div className="success-card">
            <div className="success-icon">
              <CheckCircle size={60} color="#10b981" />
            </div>
            <h2>You're In! 🎉</h2>
            <p>Registration confirmed for <strong>{event.title}</strong>.</p>
            
            {event.whatsapp_link && (
              <a href={event.whatsapp_link} target="_blank" rel="noopener noreferrer" className="whatsapp-btn">
                <MessageCircle size={20} /> Join WhatsApp Group
              </a>
            )}
            <p className="small-note">Please join the group for updates.</p>
          </div>
        ) : (
          // --- FORM STATE ---
          <div className="form-card">
            <div className="form-header">
              <span className="event-type-tag">{event.type}</span>
              <h1>{event.title}</h1>
              <div className="header-meta">
                <span><Calendar size={14}/> {event.date}</span>
                <span><MapPin size={14}/> {event.location}</span>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Member Badge */}
              {isMember && (
                <div className="member-privilege-badge">
                  <UserCheck size={16} /> Member Details Auto-Filled
                </div>
              )}

              <div className="input-group">
                <label>Full Name</label>
                <input 
                  type="text" name="full_name" required 
                  value={formData.full_name} onChange={handleChange}
                  disabled={isMember} // Lock for members
                  className={isMember ? 'locked-input' : ''}
                />
              </div>

              <div className="input-group">
                <label>Email Address</label>
                <input 
                  type="email" name="email" required 
                  value={formData.email} onChange={handleChange}
                  disabled={isMember} // Lock for members
                  className={isMember ? 'locked-input' : ''}
                />
              </div>

              <div className="row-group">
                <div className="input-group">
                  <label>Branch</label>
                  <input 
                    type="text" name="branch" required placeholder="Ex: CSE"
                    value={formData.branch} onChange={handleChange}
                  />
                </div>
                <div className="input-group">
                  <label>Year</label>
                  <select name="year" value={formData.year} onChange={handleChange}>
                    <option>1st Year</option>
                    <option>2nd Year</option>
                    <option>3rd Year</option>
                    <option>4th Year</option>
                  </select>
                </div>
              </div>

              <div className="input-group">
                <label>WhatsApp Number <Smartphone size={14} style={{marginLeft:5}}/></label>
                <input 
                  type="tel" name="phone_number" required placeholder="+91..."
                  value={formData.phone_number} onChange={handleChange}
                />
              </div>

              <button type="submit" className="submit-reg-btn">Confirm Registration</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventRegistration;
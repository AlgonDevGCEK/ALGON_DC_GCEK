import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import QRCode from "react-qr-code"; 
import { 
  MessageCircle, CheckCircle, ArrowLeft, Calendar, 
  MapPin, UserCheck, Smartphone, Edit3, Send, ArrowRight, Ban 
} from 'lucide-react';
import './EventRegistration.css';

const EventRegistration = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // --- STATE ---
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false); 
  
  const [step, setStep] = useState(1); 
  const [isMobile, setIsMobile] = useState(false);

  // Initial Form State
  const initialForm = {
    full_name: '', branch: '', year: '', phone_number: '', email: '', paymentRef: ''
  };

  const [formData, setFormData] = useState(initialForm);

  // --- 1. SETUP & FETCH ---
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    const fetchData = async () => {
      // A. Get Event
      const { data: eventData, error } = await supabase
        .from('programs').select('*').eq('id', id).single();
      
      if (error || !eventData) {
        alert("Event not found!");
        navigate('/upcoming-programs');
        return;
      }
      setEvent(eventData);

      // B. Load Local Storage (Prevention of data loss)
      const savedData = localStorage.getItem(`reg_form_${id}`);
      if (savedData) {
        setFormData(JSON.parse(savedData));
      }

      // C. Get User & Check Duplicates
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setCurrentUser(session.user);
        setIsMember(true);
        
        // 🔒 NEW: Check Duplicates using Secure RPC (No RLS needed)
        const { data: isDup } = await supabase.rpc('check_duplicate_registration', {
            check_event_id: id,
            check_email: session.user.email,
            check_user_id: session.user.id
        });

        if (isDup === true) {
            setAlreadyRegistered(true);
            setLoading(false);
            return; // Stop here
        }

        // Fetch Profile Data...
        if (!savedData) {
            const { data: memberData } = await supabase
            .from('members').select('*').eq('user_id', session.user.id).maybeSingle();

            setFormData(prev => ({
            ...prev,
            email: session.user.email,
            full_name: memberData?.name || '',
            branch: memberData?.department || '',
            year: memberData?.year || '1st Year',
            phone_number: memberData?.phone || ''
            }));
        }
      }
      setLoading(false);
    };

    fetchData();
    return () => window.removeEventListener('resize', checkMobile);
  }, [id, navigate]);

  // --- 2. LOCAL STORAGE SAVER ---
  useEffect(() => {
    if(!loading && !alreadyRegistered) {
        localStorage.setItem(`reg_form_${id}`, JSON.stringify(formData));
    }
  }, [formData, id, loading, alreadyRegistered]);

  // --- 3. HANDLERS ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    let val = value;
    if (name === "paymentRef") {
       val = val.trim(); 
       if (val.length > 12) val = val.slice(0, 12);
    }
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleNextAction = async () => {
    // Extra Duplicate Check for Guests (by Email) before proceeding
    if (!isMember) {
        // 👇 FIXED: Use RPC instead of direct select to bypass RLS issues
        const { data: isDup, error } = await supabase.rpc('check_duplicate_registration', {
            check_event_id: id,
            check_email: formData.email,
            check_user_id: null 
        });

        if (error) {
            console.error("Duplicate check failed:", error);
            
        }

        if (isDup === true) {
            alert("This email is already registered for this event.");
            return; 
        }
    }

    if (event.is_paid) {
        setStep(2.5); 
    } else {
        handleFinalSubmit();
    }
  };

  const handleFinalSubmit = async () => {
    const status = event.is_paid ? 'pending' : 'confirmed';
    
    const submissionData = {
      event_id: id,
      user_id: currentUser ? currentUser.id : null,
      full_name: formData.full_name,
      email: formData.email,
      phone_number: formData.phone_number,
      branch: formData.branch,
      year: formData.year,
      payment_status: status,
      payment_ref: event.is_paid ? formData.paymentRef : null,
      amount_paid: event.is_paid ? event.fee_amount : 0
    };

    const { error } = await supabase.from('registrations').insert([submissionData]);

    if (error) {
      alert("Registration failed: " + error.message);
    } else {
      localStorage.removeItem(`reg_form_${id}`); // Clear storage on success
      setStep(3); 
    }
  };

  const upiUrl = useMemo(() => {
    if (!event) return "";
    return `upi://pay?pa=amalnk286@oksbi&pn=ALGON_DC_GCEK&am=${event.fee_amount}&cu=INR&tn=${event.title}`;
  }, [event]);

  if (loading) return <div className="loading-screen">Loading details...</div>;

  if (alreadyRegistered) return (
      <div className="reg-page-wrapper">
          <div className="status-card error-glow animate-scale-in">
             <div className="status-icon-wrapper red-theme">
                <Ban size={48} />
             </div>
             <h2>Already Registered</h2>
             <p>
                You have already submitted your details for <br/>
                <span className="highlight-event">{event?.title}</span>
             </p>
             <div className="status-actions">
                <button onClick={() => navigate('/upcoming-programs')} className="primary-action-btn">
                    Back to Events
                </button>
             </div>
          </div>
      </div>
  );

  return (
    <div className="reg-page-wrapper">
      <div className="reg-container">
        
        {step < 3 && (
          <button onClick={() => {
              if(step === 2.5) setStep(2);
              else if(step === 2) setStep(1);
              else navigate(-1);
          }} className="back-nav-btn">
            <ArrowLeft size={18} /> {step === 1 ? 'Back' : 'Previous Step'}
          </button>
        )}

        {/* --- STEP 3: SUCCESS --- */}
        {step === 3 && (
          <div className="success-card animate-scale-in">
            <div className="success-icon">
              <CheckCircle size={60} color="#10b981" />
            </div>
            <h2>{event.is_paid ? "Payment Submitted!" : "You're In! 🎉"}</h2>
            <p>
               {event.is_paid 
                 ? "We have received your payment details. Verification usually takes 2-4 hours." 
                 : `Registration confirmed for ${event.title}.`}
            </p>
            {event.whatsapp_link && (
              <a href={event.whatsapp_link} target="_blank" rel="noopener noreferrer" className="whatsapp-btn">
                <MessageCircle size={20} /> Join WhatsApp Group
              </a>
            )}
            <button onClick={() => navigate('/upcoming-programs')} className="secondary-btn">Back to Events</button>
          </div>
        )}

        {/* --- FORM CARD --- */}
        {step < 3 && (
          <div className="form-card">
            <div className="form-header">
              <span className="event-type-tag">{event.type}</span>
              <h1>{event.title}</h1>
              {event.is_paid && <span className="fee-badge">Fee: ₹{event.fee_amount}</span>}
            </div>

            {/* --- STEP 2.5: PAYMENT SCREEN (Updated Styles) --- */}
            {step === 2.5 && (
                <div className="payment-section animate-fade-in">
                    <h3>Complete Payment</h3>
                    <p className="pay-instruction">Scan to pay <strong>₹{event.fee_amount}</strong></p>
                    
                    <div className="qr-box-black">
                        <QRCode 
                            value={upiUrl} 
                            size={180} 
                            bgColor="#000000" 
                            fgColor="#FFFFFF" 
                            level="H"
                        />
                    </div>

                    <div className="mobile-pay-options">
                         <a href={upiUrl} className="upi-app-btn">
                             <Smartphone size={18}/> Pay via UPI App
                         </a>
                    </div>

                    <div className="input-group" style={{marginTop: '25px'}}>
                        <label>Transaction ID (12 Digits)</label>
                        <input 
                            type="text" 
                            name="paymentRef"
                            inputMode="numeric" 
                            placeholder="Enter 12-digit UTR"
                            value={formData.paymentRef} 
                            onChange={handleChange}
                            maxLength={12}
                        />
                        {formData.paymentRef.length > 0 && formData.paymentRef.length !== 12 && (
                            <small style={{color:'#ff4757'}}>Must be exactly 12 digits</small>
                        )}
                    </div>

                    <button 
                        onClick={handleFinalSubmit} 
                        className="verify-btn"
                        disabled={formData.paymentRef.length !== 12}
                    >
                        Submit Verification <Send size={18} />
                    </button>
                </div>
            )}

            {/* --- STEP 2: PREVIEW --- */}
            {step === 2 && (
              <div className="preview-section animate-fade-in">
                <h3>Please review your details</h3>
                <div className="preview-grid">
                  <div className="preview-item"><label>Name</label><div>{formData.full_name}</div></div>
                  <div className="preview-item"><label>Email</label><div>{formData.email}</div></div>
                  <div className="preview-item"><label>Phone</label><div>{formData.phone_number}</div></div>
                  <div className="preview-item"><label>Branch & Year</label><div>{formData.branch} - {formData.year}</div></div>
                </div>
                <div className="form-actions">
                  <button onClick={() => setStep(1)} className="edit-btn"><Edit3 size={18} /> Edit</button>
                  <button onClick={handleNextAction} className="submit-reg-btn">
                    {event.is_paid ? `Proceed to Payment (₹${event.fee_amount || 0})` : "Confirm & Submit"} <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* --- STEP 1: INPUT FORM --- */}
            {step === 1 && (
              <form onSubmit={(e) => { e.preventDefault(); setStep(2); }} className="animate-fade-in">
                {isMember && <div className="member-privilege-badge"><UserCheck size={16} /> Member Details Auto-Filled</div>}
                
                <div className="input-group">
                  <label>Full Name</label>
                  <input type="text" name="full_name" required value={formData.full_name} onChange={handleChange} disabled={isMember} className={isMember ? 'locked-input' : ''}/>
                </div>
                <div className="input-group">
                  <label>Email Address</label>
                  <input type="email" name="email" required value={formData.email} onChange={handleChange} disabled={isMember} className={isMember ? 'locked-input' : ''}/>
                </div>
                <div className="row-group">
                  <div className="input-group">
                    <label>Branch</label>
                    <select name="branch" required value={formData.branch} onChange={handleChange}>
                      <option value="" disabled>Select Branch</option>
                      <option value="CSE">CSE</option><option value="ECE">ECE</option>
                      <option value="EEE">EEE</option><option value="ME">ME</option><option value="CE">CE</option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label>Year</label>
                    <select name="year" value={formData.year} onChange={handleChange}>
                      <option value="" disabled>Select Year</option>
                      <option>1st Year</option><option>2nd Year</option><option>3rd Year</option><option>4th Year</option>
                    </select>
                  </div>
                </div>
                <div className="input-group">
                  <label>WhatsApp Number</label>
                  <input type="tel" name="phone_number" required placeholder="+91..." value={formData.phone_number} onChange={handleChange}/>
                </div>
                <button type="submit" className="review-btn">Review Details</button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventRegistration;
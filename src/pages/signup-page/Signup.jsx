import React, { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import { ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";
import "./Signup.css";

const Signup = () => {
  const [step, setStep] = useState(1);
  const [fees, setFees] = useState([]);
  const [qrCode, setQrCode] = useState("");

  // --- CONFIGURATION ---
  // Your specific UPI ID is hardcoded here for immediate use
  const CLUB_UPI_ID = "alanjoseph52006@okicici"; 
  const CLUB_NAME = "ADC Club";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    year: "",
    course: "",
    password: "",
    confirmPassword: "",
    college: false,
    paymentRef: "",
    duration: 1,
    amountToPay: 0,
    durationLabel: ""
  });

  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    // 1. Fetch Membership Fees
    const fetchFees = async () => {
      const { data, error } = await supabase
        .from('membership_fees')
        .select('*')
        .order('years', { ascending: true });

      if (data && data.length > 0) {
        setFees(data);
        // Set default values based on the first plan
        setFormData(prev => ({
          ...prev,
          duration: data[0].years,
          amountToPay: data[0].amount,
          durationLabel: data[0].label
        }));
      }
    };

    // 2. Fetch QR Code Image (for Desktop users)
    const fetchQR = async () => {
      const { data } = await supabase
        .from('payment_config')
        .select('qr_url')
        .limit(1)
        .single();

      if (data) setQrCode(data.qr_url);
    };

    fetchFees();
    fetchQR();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleDurationChange = (e) => {
    const selectedYears = parseInt(e.target.value);
    const selectedPlan = fees.find(f => f.years === selectedYears);

    if (selectedPlan) {
      setFormData({
        ...formData,
        duration: selectedYears,
        amountToPay: selectedPlan.amount,
        durationLabel: selectedPlan.label
      });
    }
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone || !formData.department || !formData.password) {
      setErrorMessage("Please fill in all personal details first.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }
    if (!formData.college) {
      setErrorMessage("You must confirm your college affiliation.");
      return;
    }
    setErrorMessage("");
    setStep(2);
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!formData.paymentRef) {
      setErrorMessage("Please enter the Transaction ID to verify payment.");
      return;
    }

    setErrorMessage("Submitting application...");

    const { error: insertError } = await supabase.from("pending_members").insert([{
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      department: formData.department,
      year: formData.year,
      course: formData.course,
      payment_ref: formData.paymentRef,
      duration: formData.durationLabel,
      amount_paid: formData.amountToPay
    }]);

    if (insertError) {
      setErrorMessage("Data Error: " + insertError.message);
      return;
    }

    const { error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
    });

    if (authError) {
      setErrorMessage("Auth Error: " + authError.message);
    } else {
      setStep(3);
      setErrorMessage("");
    }
  };

  // --- DYNAMIC UPI LINK GENERATOR ---
  // This creates the link: upi://pay?pa=...&am=...
  const upiLink = `upi://pay?pa=${CLUB_UPI_ID}&pn=${encodeURIComponent(CLUB_NAME)}&am=${formData.amountToPay}&cu=INR&tn=Membership_${formData.department}`;

  return (
    <div className="signup-wrapper">
      <div className="signup-card">

        {step < 3 && (
          <div className="progress-bar" style={{ display: 'flex', gap: '5px', marginBottom: '20px' }}>
            <div style={{ height: '4px', flex: 1, borderRadius: '2px', background: step >= 1 ? '#3b82f6' : '#334155' }}></div>
            <div style={{ height: '4px', flex: 1, borderRadius: '2px', background: step >= 2 ? '#3b82f6' : '#334155' }}></div>
          </div>
        )}

        <h2 className="signup-title">
          {step === 1 ? "Create Account" : step === 2 ? "Select Membership" : "Success! 🎉"}
        </h2>

        {errorMessage && <p className="error">{errorMessage}</p>}

        {/* STEP 1: PERSONAL DETAILS */}
        {step === 1 && (
          <form onSubmit={handleNext}>
            <div className="input-group"><input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required /></div>
            <div className="input-group"><input type="email" name="email" placeholder="Email address" value={formData.email} onChange={handleChange} required /></div>
            <div className="input-group"><input type="text" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} required /></div>

            <div className="input-group">
              <select name="department" value={formData.department} onChange={handleChange} required>
                <option value="">Select Department</option>
                <option value="CSE">CSE</option><option value="ECE">ECE</option><option value="EEE">EEE</option>
                <option value="ME">ME</option><option value="CE">CE</option>
              </select>
            </div>

            <div className="row-group" style={{ display: 'flex', gap: '10px' }}>
              <div className="input-group" style={{ flex: 1 }}>
                <select name="year" value={formData.year} onChange={handleChange} required>
                  <option value="">Year</option><option value="1st Year">1st</option><option value="2nd Year">2nd</option><option value="3rd Year">3rd</option><option value="4th Year">4th</option>
                </select>
              </div>
              <div className="input-group" style={{ flex: 1 }}>
                <select name="course" value={formData.course} onChange={handleChange} required>
                  <option value="">Course</option><option value="B.Tech">B.Tech</option><option value="M.Tech">M.Tech</option>
                </select>
              </div>
            </div>

            <div className="input-group"><input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required /></div>
            <div className="input-group"><input type="password" name="confirmPassword" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} required /></div>

            <div className="toggle-group">
              <span className="toggle-label">I belong to Government College of Engineering Kannur</span>
              <label className="switch">
                <input type="checkbox" name="college" checked={formData.college} onChange={handleChange} />
                <span className="slider"></span>
              </label>
            </div>

            <button type="submit" className="signup-btn">Next <ArrowRight size={18} style={{ marginLeft: '8px' }} /></button>
            <div className="signup-footer"><span>Already a member?</span><a href="/login"> Log in</a></div>
          </form>
        )}

        {/* STEP 2: PAYMENT & CONFIRMATION */}
        {step === 2 && (
          <form onSubmit={handleSignup}>
            <div className="payment-box" style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>

              <label style={{ color: '#94a3b8', fontSize: '13px' }}>Choose Duration:</label>
              <select
                name="duration"
                value={formData.duration}
                onChange={handleDurationChange}
                style={{ width: '100%', padding: '12px', marginTop: '5px', background: '#0f172a', border: '1px solid #3b82f6', color: 'white', borderRadius: '8px' }}
              >
                {fees.map((fee) => (
                  <option key={fee.id} value={fee.years}>{fee.label} - ₹{fee.amount}</option>
                ))}
              </select>

              <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>Amount to Pay</span>
                <h1 style={{ margin: '5px 0', color: '#34d399', fontSize: '32px' }}>₹{formData.amountToPay}</h1>
              </div>

              {/* --- NEW PAYMENT SECTION --- */}
              <div style={{ margin: '20px 0', textAlign: 'center' }}>
                
                {/* 1. SMART PAYMENT BUTTON (For Mobile) */}
                <a
                  href={upiLink}
                  className="signup-btn"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textDecoration: 'none',
                    background: '#10b981', // Green for payment
                    marginBottom: '15px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  Pay ₹{formData.amountToPay} via UPI App
                  <ArrowRight size={18} style={{ marginLeft: '8px' }} />
                </a>

                {/* 2. QR CODE (Backup for Desktop) */}
                <div style={{ padding: '10px', background: 'white', borderRadius: '10px', display: 'inline-block' }}>
                  <div style={{ width: '150px', height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {qrCode ? (
                      <img src={qrCode} alt="QR Code" style={{ maxWidth: '100%', maxHeight: '100%' }} />
                    ) : (
                      <span style={{ fontSize: '12px', color: '#64748b' }}>Loading QR...</span>
                    )}
                  </div>
                  <p style={{ color: '#334155', fontSize: '10px', marginTop: '5px', fontWeight: '600' }}>
                    Scan to Pay Manually
                  </p>
                </div>
                
                <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '10px', fontStyle: 'italic' }}>
                   Verify ID: {CLUB_UPI_ID}
                </p>
              </div>

              <div className="input-group">
                <input
                  type="text" name="paymentRef" placeholder="Enter Transaction ID (UTR)"
                  value={formData.paymentRef} onChange={handleChange} required
                  style={{ textAlign: 'center', letterSpacing: '1px', borderColor: '#f59e0b' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button type="button" onClick={() => setStep(1)} className="signup-btn" style={{ background: '#334155', width: '30%' }}>
                <ArrowLeft size={18} />
              </button>
              <button type="submit" className="signup-btn" style={{ width: '70%' }}>
                Submit Application
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: SUCCESS */}
        {step === 3 && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <CheckCircle size={60} color="#34d399" style={{ margin: '0 auto 20px' }} />
            <h3 style={{ color: 'white' }}>Application Submitted!</h3>
            <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.6', marginTop: '10px' }}>
              1. Check your email to verify your account.<br />
              2. The Admin will verify your payment ID.<br />
              3. You can log in once approved.
            </p>
            <a href="/login" className="signup-btn" style={{ display: 'block', textDecoration: 'none', marginTop: '30px' }}>Go to Login</a>
          </div>
        )}

      </div>
    </div>
  );
};

export default Signup;
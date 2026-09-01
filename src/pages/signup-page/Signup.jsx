import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "../../supabaseClient";
import { 
  ArrowRight, ArrowLeft, CheckCircle, 
  Eye, EyeOff, Smartphone, 
  AlertCircle ,PartyPopper
} from "lucide-react";
import QRCode from "react-qr-code"; 
import "./Signup.css";

const Signup = () => {
  const [step, setStep] = useState(1);
  const [fees, setFees] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [globalError, setGlobalError] = useState("");
  
  // Real-time error tracking
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    year: "",
    course: "", 
    password: "",
    confirmPassword: "",
    termsAccepted: false,
    paymentRef: "",
    duration: 1,
    amountToPay: 0,
    durationLabel: ""
  });

  // --- 1. Setup & Hydration ---
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    const fetchFees = async () => {
      const { data } = await supabase.from('membership_fees').select('*').order('years', { ascending: true });
      if (data && data.length > 0) {
        setFees(data);
        setFormData(prev => {
           if(prev.amountToPay === 0) {
               return { 
                 ...prev, 
                 duration: data[0].years, 
                 amountToPay: data[0].amount, 
                 durationLabel: data[0].label 
               };
           }
           return prev;
        });
      }
    };
    fetchFees();
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // LocalStorage Hydration
  useEffect(() => {
    try {
      const savedData = localStorage.getItem("algon_signup_draft");
      if (savedData) setFormData(prev => ({ ...prev, ...JSON.parse(savedData) }));
    } catch(e) { localStorage.removeItem("algon_signup_draft"); }
  }, []);

  // Auto-Save
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem("algon_signup_draft", JSON.stringify(formData));
    }, 500);
    return () => clearTimeout(timer);
  }, [formData]);

  // --- 2. Real-Time Validation ---
  const validateField = (name, value) => {
    let errorMsg = "";
    switch (name) {
      case "name":
        if (value && value.length < 3) errorMsg = "Name must be at least 3 characters";
        else if (value && !/^[a-zA-Z\s]+$/.test(value)) errorMsg = "Alphabets only (No symbols/numbers)";
        break;
      case "phone":
        if (value && (!/^\d*$/.test(value) || value.length > 10)) errorMsg = "Invalid format";
        else if (value && value.length === 10 && !/^\d{10}$/.test(value)) errorMsg = "Must be 10 digits";
        break;
      case "email":
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) errorMsg = "Invalid email format";
        break;
      case "confirmPassword":
        if (value && value !== formData.password) errorMsg = "Passwords do not match";
        break;
      default: break;
    }
    setErrors(prev => ({ ...prev, [name]: errorMsg }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;

    setFormData(prev => ({ ...prev, [name]: val }));
    validateField(name, val);

    // Special check for password match
    if (name === "password" && formData.confirmPassword) {
       if (val !== formData.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: "Passwords do not match" }));
       else setErrors(prev => ({ ...prev, confirmPassword: "" }));
    }
  };

  // --- 3. Logic Helpers ---
  const passwordMetrics = useMemo(() => {
    const p = formData.password || "";
    return {
      length: p.length >= 8,
      upper: /[A-Z]/.test(p),
      lower: /[a-z]/.test(p),
      number: /[0-9]/.test(p),
      special: /[!@#$%^&*.,<>/?;:'"\[\]{}|`~()_\-+=]/.test(p), // Expanded slightly for better support
    };
  }, [formData.password]);
  
  const strengthScore = Object.values(passwordMetrics).filter(Boolean).length;

  // FIXED: Explicitly check that ALL conditions are met, not just a score of 4
  const isFormValid = useMemo(() => {
    const isPasswordStrong = 
      passwordMetrics.length && 
      passwordMetrics.upper && 
      passwordMetrics.lower && 
      passwordMetrics.number && 
      passwordMetrics.special;

    const isPasswordsMatch = 
      formData.password.length > 0 && 
      formData.password === formData.confirmPassword;

    return (
      formData.name && !errors.name &&
      formData.email && !errors.email &&
      formData.phone && !errors.phone && formData.phone.length === 10 &&
      isPasswordStrong &&
      isPasswordsMatch &&
      formData.department && formData.year && formData.course &&
      formData.termsAccepted
    );
  }, [formData, errors, passwordMetrics]);

  const upiUrl = useMemo(() => {
    return `upi://pay?pa=anciaalusb@oksbi&pn=ALGON_DC_GCEK&am=${formData.amountToPay}&cu=INR&tn=${formData.durationLabel}`;
  }, [formData.amountToPay, formData.durationLabel]);

  // --- 4. Submit Handlers ---
  const handleNext = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setLoading(true);
    // Check for duplicate EMAIL only
    const { data: existing } = await supabase
        .from("pending_members")
        .select("email")
        .eq("email", formData.email)
        .maybeSingle();
        
    setLoading(false);

    if (existing) {
      setGlobalError("This email has already submitted a registration.");
    } else {
      setGlobalError("");
      setStep(2);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!formData.paymentRef || formData.paymentRef.length < 12) {
      setGlobalError("Invalid Transaction ID (Must be 12 digits)");
      return;
    }
    setLoading(true);
    setGlobalError("");

    // 1. Create Auth User (Required for Login)
    const { error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password
    });

    if (authError) {
       if (!authError.message.includes("already registered")) {
           setGlobalError(authError.message);
           setLoading(false);
           return;
       }
    }

    const { error: dbError } = await supabase.from("pending_members").insert([{
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

    if (dbError) {
      setGlobalError("Database Error: " + dbError.message);
    } else {
      localStorage.removeItem("algon_signup_draft");
      setStep(3);
    }
    setLoading(false);
  };

  // --- 5. Render ---
  return (
    <div className="signup-wrapper">
      <div className="signup-card">
        
        {/* Progress */}
        {step < 3 && (
          <div className="progress-container">
             <div className={`progress-dot ${step >= 1 ? "active" : ""}`}></div>
             <div className={`progress-line ${step >= 2 ? "active" : ""}`}></div>
             <div className={`progress-dot ${step >= 2 ? "active" : ""}`}></div>
          </div>
        )}

        <h2 className="signup-title">
            {step === 1 ? "Create Account" : step === 2 ? "Payment Details" : "Success !!"}  
        </h2>
        
        {globalError && <div className="error-banner"><AlertCircle size={16}/> {globalError}</div>}

        {/* STEP 1 */}
        {step === 1 && (
          <form onSubmit={handleNext}>
            {/* Name */}
            <div className="input-group">
              <label>Full Name</label>
              <input 
                 type="text" name="name" 
                 value={formData.name} onChange={handleChange} 
                 className={errors.name ? "input-error" : ""}
                 placeholder="As per college records"
              />
              {errors.name && <small className="error-text">{errors.name}</small>}
            </div>

            {/* Email */}
            <div className="input-group">
              <label>Email</label>
              <input 
                 type="email" name="email" 
                 value={formData.email} onChange={handleChange}
                 className={errors.email ? "input-error" : ""}
                 placeholder="Verification link will be sent here"
              />
              {errors.email && <small className="error-text">{errors.email}</small>}
            </div>

            {/* Phone */}
            <div className="input-group">
              <label>Phone Number 'Whatsapp'</label>
              <input 
                 type="tel" name="phone" 
                 value={formData.phone} onChange={handleChange} maxLength="10"
                 className={errors.phone ? "input-error" : ""}
                 placeholder="10-digit Number"
              />
              {errors.phone && <small className="error-text">{errors.phone}</small>}
            </div>

            {/* Dept / Year */}
            <div className="row-group">
               <select name="department" value={formData.department} onChange={handleChange} required>
                  <option value="">Department</option>
                  <option value="CSE">CSE</option><option value="ECE">ECE</option>
                  <option value="EEE">EEE</option><option value="ME">ME</option><option value="CE">CE</option>
               </select>
               <select name="year" value={formData.year} onChange={handleChange} required>
                  <option value="">Year</option>
                  <option value="1st Year">1st Year</option><option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option><option value="4th Year">4th Year</option>
               </select>
               <select name="course" value={formData.course} onChange={handleChange} required>
                  <option value ="">Course</option>
                  <option value="B.Tech">B.Tech</option>
               </select>
            </div>

            {/* Password */}
            <div className="password-container">
               <label>Choose a Strong Password</label>
               <div className="input-with-icon">
                  <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} placeholder="e.g., MyPass123!" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}>
                     {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                  </button>
               </div>
               <div className="strength-meter">
                  <div className={`bar ${strengthScore >= 2 ? 'active' : ''}`}></div>
                  <div className={`bar ${strengthScore >= 4 ? 'active' : ''}`}></div>
                  <div className={`bar ${strengthScore >= 5 ? 'active' : ''}`}></div>
               </div>
               {/* FIXED: Added lowercase indicator so the user can easily see all 5 requirements */}
               <div className="rules-list">
                  <span className={passwordMetrics.length ? "met" : ""}>8+ Chars</span>
                  <span className={passwordMetrics.upper ? "met" : ""}>UpperCase</span>
                  <span className={passwordMetrics.lower ? "met" : ""}>LowerCase</span>
                  <span className={passwordMetrics.number ? "met" : ""}>Number</span>
                  <span className={passwordMetrics.special ? "met" : ""}>Symbol</span>
               </div>
            </div>

            {/* Confirm Password Field */}
            <div className="input-group">
               <label>Confirm Password</label>
               <div className="input-with-icon">
                  <input 
                     type={showConfirm ? "text" : "password"} 
                     name="confirmPassword" 
                     value={formData.confirmPassword} 
                     onChange={handleChange}
                     className={errors.confirmPassword ? "input-error" : ""}
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}>
                     {showConfirm ? <EyeOff size={18}/> : <Eye size={18}/>}
                  </button>
               </div>
               {errors.confirmPassword && <small className="error-text">{errors.confirmPassword}</small>}
            </div>

            <div className="input-group" style={{marginTop: '10px'}}>
              <label>College Verification</label>
              <div style={{
                  display: 'flex', alignItems: 'center', gap: '12px', 
                  padding: '12px', background: 'var(--input-bg)', 
                  border: '1px solid var(--border-dim)', borderRadius: '14px'
              }}>
                  <input 
                      type="checkbox" 
                      checked={true} 
                      readOnly 
                      style={{ width: '20px', height: '20px', margin: 0, cursor: 'not-allowed' }}
                  />
                  <span style={{ fontSize: '13px', color: 'var(--text-main)', lineHeight: '1.4' }}>
                      I confirm that I am a student of &nbsp;
                      <strong style={{color: 'var(--neon-blue)'}}>Government College of Engineering Kannur</strong>
                  </span>
              </div>
            </div>

            <div className="terms-check">
              <label className="checkbox-container">
                <input 
                  type="checkbox" 
                  name="termsAccepted" 
                  checked={formData.termsAccepted} 
                  onChange={handleChange} 
                />
                <span className="checkmark"></span>
                <span style={{ fontSize: '12px', lineHeight: '1.5' }}>
                  I have read, understood, and agree to the{' '}
                  <a href="/terms-and-conditions" target="_blank" rel="noopener noreferrer">Terms</a>,{' '}
                  <a href="/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy</a>,{' '}
                  <a href="/refund-policy" target="_blank" rel="noopener noreferrer">Refund Policy</a>, and{' '}
                  <a href="/code-of-conduct" target="_blank" rel="noopener noreferrer">Code of Conduct</a>.
                </span>
              </label>
            </div>

            <button 
              type="submit" 
              className={`signup-btn neon-blue ${!isFormValid ? "disabled" : ""}`} 
              disabled={!isFormValid || loading}
            >
              {loading ? "Checking..." : "Next Step"} <ArrowRight size={18}/>
            </button>
          </form>
        )}

        {/* STEP 2 */}
        {step === 2 && (
           <form onSubmit={handleSignup}>
              <div className="duration-grid">
                  {fees.map(f => (
                      <div key={f.id} onClick={() => setFormData(p => ({...p, duration: f.years, amountToPay: f.amount, durationLabel: f.label}))} className={`duration-card ${formData.duration === f.years ? 'selected' : ''}`}>
                          <span>{f.label}</span><strong>₹{f.amount}</strong>
                      </div>
                  ))}
              </div>

              {/* --- Updated Payment Display (Step 2) --- */}
              <div className="qr-section">
                  <p className="instruction">
                     {isMobile ? "Scan QR or Tap Button" : "Scan QR to Pay"}
                  </p>

                  <div className="qr-wrapper" style={{background:'white', padding:'10px', borderRadius:'10px', display:'inline-block'}}>
                      <QRCode value={upiUrl} size={150} />
                  </div>

                  {isMobile && (
                      <div style={{marginTop: '15px', width: '100%'}}>
                         <a href={upiUrl} className="upi-button">
                            <Smartphone size={18}/> Pay via UPI App
                         </a>
                         <small className="sub-instruction">
                            (If the button doesn't work, screenshot the QR and scan it from your gallery using your UPI app)
                         </small>
                      </div>
                  )}
              </div>
              
              <div className="input-group">
                  <label>Transaction ID (UTR)</label>
                  <input 
                     type="text" name="paymentRef" 
                     value={formData.paymentRef} onChange={handleChange} 
                     placeholder="Enter 12-digit UTR" maxLength={12}
                  />
                  {formData.paymentRef.length > 0 && formData.paymentRef.length !== 12 && (
                   <small className="error-text">
                           Current length: {formData.paymentRef.length} (Must be 12)
                      </small>
                    )}
              </div>

              <div className="btn-group">
                  <button type="button" onClick={() => setStep(1)} className="back-btn"><ArrowLeft/></button>
                  <button type="submit" className="signup-btn neon-green" disabled={loading || formData.paymentRef.length !== 12}>
                     {loading ? "Submitting..." : "Finish Registration"}
                  </button>
              </div>
           </form>
        )}

        {/* STEP 3 */}
        {step === 3 && (
            <div className="success-view">
                <CheckCircle size={80} color="#34d399"/>
                <h3>Application Sent!</h3>
                <p>We've sent a verification email to <strong>{formData.email}</strong>. Please confirm your email address, The admin will approve your membership shortly</p>
                {/* <a href="/login" className="signup-btn neon-blue">Go to Login</a> */}
            </div>
        )}
      </div>
    </div>
  );
};

export default Signup;
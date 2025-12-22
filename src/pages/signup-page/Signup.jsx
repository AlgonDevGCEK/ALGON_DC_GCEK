import React, { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import { ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";
import "./Signup.css";

const Signup = () => {
  const [step, setStep] = useState(1);
  const [fees, setFees] = useState([]); // Stores price options from DB
  
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
    duration: 1,      // Default 1 Year (Integer)
    amountToPay: 0,   // Default Price
    durationLabel: "1 Year Membership" // To save in DB nicely
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // 1. FETCH PRICES FROM SUPABASE ON LOAD
  useEffect(() => {
    const fetchFees = async () => {
      const { data, error } = await supabase
        .from('membership_fees')
        .select('*')
        .order('years', { ascending: true });
      
      if (data && data.length > 0) {
        setFees(data);
        // Set default selection to the first option
        setFormData(prev => ({ 
          ...prev, 
          duration: data[0].years, 
          amountToPay: data[0].amount,
          durationLabel: data[0].label
        }));
      }
    };
    fetchFees();
  }, []);

  // Handle standard input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  // Handle Dropdown Change (Updates Price automatically)
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

  // Validate Step 1
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
    setStep(2); // Move to Payment Step
  };

  // Final Submission
  const handleSignup = async (e) => {
    e.preventDefault();
    
    if (!formData.paymentRef) {
      setErrorMessage("Please enter the Transaction ID to verify payment.");
      return;
    }

    // 1. Sign Up User
    const { data: { user }, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
    });

    if (error) {
      setErrorMessage(error.message);
    } else {
      // 2. Insert Member Data
      const { error: insertError } = await supabase.from("members").insert([{
        user_id: user.id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        department: formData.department,
        year: formData.year,
        course: formData.course,
        college: "Government College of Engineering Kannur",
        
        // Payment Details
        payment_ref: formData.paymentRef,
        duration: formData.durationLabel, // Saves "1 Year Membership" etc.
        status: 'pending',
        position: 'Student Member'
      }]);

      if (insertError) {
        setErrorMessage(insertError.message);
      } else {
        setSuccessMessage("Registration successful!");
        setErrorMessage("");
        setStep(3); // Move to Success Screen
      }
    }
  };

  return (
    <div className="signup-wrapper">
      <div className="signup-card">
        
        {/* PROGRESS BAR */}
        {step < 3 && (
          <div style={{display:'flex', gap:'5px', marginBottom:'20px'}}>
            <div style={{height:'4px', flex:1, borderRadius:'2px', background: step >= 1 ? '#3b82f6' : '#334155'}}></div>
            <div style={{height:'4px', flex:1, borderRadius:'2px', background: step >= 2 ? '#3b82f6' : '#334155'}}></div>
          </div>
        )}

        <h2 className="signup-title">
          {step === 1 ? "Create Account " : step === 2 ? "Select Membership " : "Welcome! 🎉"}
        </h2>
        
        {errorMessage && <p className="error">{errorMessage}</p>}

        {/* --- STEP 1: PERSONAL DETAILS --- */}
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
            
            <div className="row-group" style={{display:'flex', gap:'10px'}}>
              <div className="input-group" style={{flex:1}}>
                <select name="year" value={formData.year} onChange={handleChange} required>
                  <option value="">Year</option><option value="1st Year">1st</option><option value="2nd Year">2nd</option><option value="3rd Year">3rd</option><option value="4th Year">4th</option>
                </select>
              </div>
              <div className="input-group" style={{flex:1}}>
                 <select name="course" value={formData.course} onChange={handleChange} required>
                  <option value="">Course</option><option value="B.Tech">B.Tech</option><option value="M.Tech">M.Tech</option>
                </select>
              </div>
            </div>

            <div className="input-group"><input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required /></div>
            <div className="input-group"><input type="password" name="confirmPassword" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} required /></div>

            <div className="input-group checkbox-group">
              <label>
                <input type="checkbox" name="college" checked={formData.college} onChange={handleChange} /> 
                I am a GCEK student
              </label>
            </div>

            <button type="submit" className="signup-btn">Next <ArrowRight size={18} style={{marginLeft:'8px'}}/></button>
            <div className="signup-footer"><span>Already a member?</span><a href="/login"> Log in</a></div>
          </form>
        )}

        {/* --- STEP 2: PAYMENT & DURATION --- */}
        {step === 2 && (
          <form onSubmit={handleSignup}>
            <div className="payment-box" style={{background:'#1e293b', padding:'20px', borderRadius:'12px', border:'1px solid #334155'}}>
              
              <label style={{color:'#94a3b8', fontSize:'13px'}}>Choose Duration:</label>
              
              {/* DYNAMIC DROPDOWN FETCHED FROM DB */}
              <select 
                name="duration" 
                value={formData.duration} 
                onChange={handleDurationChange}
                style={{width:'100%', padding:'12px', marginTop:'5px', background:'#0f172a', border:'1px solid #3b82f6', color:'white', borderRadius:'8px'}}
              >
                {fees.map((fee) => (
                  <option key={fee.id} value={fee.years}>
                    {fee.label} - ₹{fee.amount}
                  </option>
                ))}
              </select>

              <div style={{marginTop:'20px', textAlign:'center'}}>
                <span style={{fontSize:'12px', color:'#94a3b8'}}>Amount to Pay</span>
                <h1 style={{margin:'5px 0', color:'#34d399', fontSize:'32px'}}>₹{formData.amountToPay}</h1>
              </div>

              <div style={{margin:'20px 0', padding:'15px', background:'white', borderRadius:'10px', textAlign:'center'}}>
                 {/* QR CODE PLACEHOLDER */}
                 <div style={{width:'150px', height:'150px', background:'#e2e8f0', margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'center', color:'black', borderRadius:'8px'}}>
                    QR CODE
                 </div>
              </div>

              <div className="input-group">
                <input 
                  type="text" name="paymentRef" placeholder="Enter UPI Transaction ID (UTR)" 
                  value={formData.paymentRef} onChange={handleChange} required 
                  style={{textAlign:'center', letterSpacing:'1px', borderColor:'#f59e0b'}}
                />
              </div>
            </div>

            <div style={{display:'flex', gap:'10px', marginTop:'20px'}}>
              <button type="button" onClick={() => setStep(1)} className="signup-btn" style={{background:'#334155', width:'30%'}}>
                <ArrowLeft size={18}/>
              </button>
              <button type="submit" className="signup-btn" style={{width:'70%'}}>
                Complete Registration
              </button>
            </div>
          </form>
        )}

        {/* --- STEP 3: SUCCESS --- */}
        {step === 3 && (
          <div style={{textAlign:'center', padding:'20px'}}>
            <CheckCircle size={60} color="#34d399" style={{margin:'0 auto 20px'}}/>
            <h3 style={{color:'white'}}>Application Submitted!</h3>
            <p style={{color:'#94a3b8', fontSize:'14px', lineHeight:'1.6', marginTop:'10px'}}>
              We have received your payment details.<br/>
              Please check your email to verify your account.<br/>
              Once verified, the admin will approve your ID card.
            </p>
            <a href="/login" className="signup-btn" style={{display:'block', textDecoration:'none', marginTop:'30px'}}>Go to Login</a>
          </div>
        )}

      </div>
    </div>
  );
};

export default Signup;
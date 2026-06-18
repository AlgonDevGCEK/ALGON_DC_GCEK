import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "../../supabaseClient";
import { Eye, EyeOff } from "lucide-react";
import "./Updatepassword.css";

const UpdatePassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // --- 1. Session Check Logic ---
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setLoading(false);
      } else {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, session) => {
            if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
              setLoading(false);
            }
          }
        );
        return () => subscription.unsubscribe();
      }
    };
    checkSession();
  }, []);

  // --- 2. Password Strength Logic ---
  const passwordMetrics = useMemo(() => {
    const p = newPassword || "";
    return {
      length: p.length >= 8,
      upper: /[A-Z]/.test(p),
      lower: /[a-z]/.test(p),
      number: /[0-9]/.test(p),
      special: /[!@#$%^&*]/.test(p),
    };
  }, [newPassword]);

  const strengthScore = Object.values(passwordMetrics).filter(Boolean).length;
  // Require at least score 4 (e.g., Length + 3 other traits)
  const isStrong = strengthScore >= 4; 

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (loading) return;
    
    // Safety Block: Prevent weak passwords
    if (!isStrong) {
        setMessage("Password is too weak. Please add numbers/symbols.");
        return;
    }

    setUpdating(true);
    setMessage("");

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Success! Password updated. Redirecting...");
      setNewPassword("");
      // Optional: Redirect to login after 2 seconds
      setTimeout(() => window.location.href = '/login', 2000);
    }
    setUpdating(false);
  };

  return (
    <section className="update-wrapper">
      <div className="update-card">
        <h2>Set New Password </h2>
        
        {loading ? (
          <p className="status" style={{color: '#94a3b8'}}>Verifying security link...</p>
        ) : (
          <form onSubmit={handleUpdate}>
            <div className="input-group">
                <div className="password-wrapper">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="New password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                    <button 
                      type="button" 
                      className="eye-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>

                {/* --- 3. Strength Meter UI --- */}
                <div className="strength-meter">
                  {/* Bar 1: Weak (Red) */}
                  <div className={`bar ${strengthScore >= 1 ? 'active' : ''}`}></div>
                  {/* Bar 2: Moderate (Orange) */}
                  <div className={`bar ${strengthScore >= 3 ? 'active' : ''}`}></div>
                  {/* Bar 3: Strong (Green) */}
                  <div className={`bar ${strengthScore >= 4 ? 'active' : ''}`}></div>
                </div>

                {/* Helper Text */}
                <div className="rules-list">
                    <span className={passwordMetrics.length ? "met" : ""}>8+ Chars</span>
                    <span className={passwordMetrics.upper ? "met" : ""}>UpperCase</span>
                    <span className={passwordMetrics.number ? "met" : ""}>Number</span>
                    <span className={passwordMetrics.special ? "met" : ""}>Symbol</span>
                </div>
            </div>

            <button 
                type="submit" 
                className="update-btn" 
                disabled={updating || !isStrong} // Lock button if weak
            >
                {updating ? "Updating..." : "Update Password"}
            </button>
          </form>
        )}
        
        {message && (
            <p className={`status ${message.includes("Success") ? "success" : "error"}`}>
                {message}
            </p>
        )}
      </div>
    </section>
  );
};

export default UpdatePassword;
import React, { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import "./UpdatePassword.css";

const UpdatePassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // Check if the user is actually logged in via the email link
  useEffect(() => {
    const checkSession = async () => {
      // 1. Check if we already have a session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setLoading(false);
      } else {
        // 2. If not, listen for the "PASSWORD_RECOVERY" or "SIGNED_IN" event
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

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    // Safety check
    if (loading) {
      setMessage("Please wait, verifying your link...");
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Password updated successfully! You can now log in.");
      setNewPassword("");
    }
  };

  return (
    <section className="update-wrapper">
      <div className="update-card">
        <h2>Set New Password 🔒</h2>
        
        {loading ? (
          <p className="status">Verifying link...</p>
        ) : (
          <form onSubmit={handleUpdate}>
            <input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
            />
            <button type="submit" className="update-btn">Update Password</button>
          </form>
        )}
        
        {message && <p className="status">{message}</p>}
      </div>
    </section>
  );
};

export default UpdatePassword;
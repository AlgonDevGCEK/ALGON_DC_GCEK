import React, { useState } from "react";
import { supabase } from "../../supabaseClient";
import "./UpdatePassword.css";

const UpdatePassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleUpdate = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) setMessage(error.message);
    else setMessage("Password updated successfully! You can now log in.");
  };

  return (
    <section className="update-wrapper">
      <div className="update-card">
        <h2>Set New Password 🔒</h2>
        <form onSubmit={handleUpdate}>
          <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <button type="submit">Update Password</button>
        </form>
        {message && <p className="status">{message}</p>}
      </div>
    </section>
  );
};

export default UpdatePassword;
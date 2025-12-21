import React, { useState } from "react";
import { supabase } from "../../supabaseClient";

const UpdatePassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleUpdate = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Password updated successfully! You can now log in.");
    }
  };

  return (
    <div className="update-wrapper">
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
      {message && <p>{message}</p>}
    </div>
  );
};

export default UpdatePassword;
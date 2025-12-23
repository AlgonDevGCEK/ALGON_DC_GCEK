import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { 
  Users, 
  Image, 
  Calendar, 
  ShieldCheck, 
  LogOut,
  ChevronRight 
} from "lucide-react";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [adminName, setAdminName] = useState("Admin");

  useEffect(() => {
    getAdminDetails();
  }, []);

  const getAdminDetails = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('members')
        .select('name')
        .eq('user_id', user.id)
        .single();
      if (data) setAdminName(data.name.split(' ')[0]); // Get first name
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <div className="admin-hub-container">
      {/* --- HEADER --- */}
      <header className="hub-header">
        <div className="admin-welcome">
          <div className="admin-avatar">
            <ShieldCheck size={32} color="#fff" />
          </div>
          <div>
            <h1>Welcome back, {adminName}</h1>
            <p>Algon Admin Command Center</p>
          </div>
        </div>
      </header>

      {/* --- DASHBOARD GRID --- */}
      <div className="hub-grid">
        
        {/* CARD 1: PAYMENTS & MEMBERS */}
        <Link to="/admin-member-manager" className="hub-card purple-card">
          <div className="card-icon-box">
            <Users size={32} />
          </div>
          <div className="card-content">
            <h3>Membership & Approvals</h3>
            <p>Verify payments, approve students, and manage users.</p>
          </div>
          <div className="card-arrow"><ChevronRight /></div>
        </Link>

        {/* CARD 2: GALLERY CONTROL */}
        <Link to="/admin-upload" className="hub-card blue-card">
          <div className="card-icon-box">
            <Image size={32} />
          </div>
          <div className="card-content">
            <h3>Gallery Management</h3>
            <p>Upload new event photos and manage the live gallery.</p>
          </div>
          <div className="card-arrow"><ChevronRight /></div>
        </Link>

        {/* CARD 3: PROGRAM CONTROL */}
        <Link to="/admin/programs" className="hub-card pink-card">
          <div className="card-icon-box">
            <Calendar size={32} />
          </div>
          <div className="card-content">
            <h3>Program Control</h3>
            <p>Create upcoming events, workshops, and registrations.</p>
          </div>
          <div className="card-arrow"><ChevronRight /></div>
        </Link>

      </div>
    </div>
  );
};

export default AdminDashboard;
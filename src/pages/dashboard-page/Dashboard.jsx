import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import QRCode from "react-qr-code";
import html2canvas from "html2canvas";
import { Edit2, Check, X, Download, Calendar, Bell, Camera, LogOut } from "lucide-react";
import "./Dashboard.css";
import clubLogo from "../../assets/club-logo.jpeg";

const Dashboard = () => {
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showIdModal, setShowIdModal] = useState(false);
  const [editingField, setEditingField] = useState(null); 
  const [tempValue, setTempValue] = useState("");
  const [uploading, setUploading] = useState(false);
  
  const idCardRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchMemberData();
  }, [navigate]);

  const fetchMemberData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/login"); return; }
      
      const { data, error } = await supabase
        .from("members")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      setMember(data);
    } catch (error) {
      console.error("Error fetching data:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  // --- IMAGE UPLOAD ---
  const handleAvatarClick = () => fileInputRef.current.click();

  const handleImageUpload = async (event) => {
    try {
      const file = event.target.files[0];
      if (!file) return;
      if (file.size > 500 * 1024) { alert("File too big! Keep under 500KB."); return; }
      
      setUploading(true);
      const fileExt = file.name.split(".").pop();
      const fileName = `${member.user_id}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // UPLOAD to 'avatar' bucket (Singular)
      const { error: uploadError } = await supabase.storage.from("avatar").upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from("avatar").getPublicUrl(filePath);
      
      const { error: updateError } = await supabase.from("members").update({ profile_pic: publicUrl }).eq("user_id", member.user_id);
      if (updateError) throw updateError;

      setMember({ ...member, profile_pic: publicUrl });
      alert("Profile picture updated!");
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  // --- INLINE EDITING ---
  const startEditing = (field, val) => { setEditingField(field); setTempValue(val); };
  const cancelEditing = () => { setEditingField(null); setTempValue(""); };
  const saveEditing = async (field) => {
     const { error } = await supabase.from("members").update({ [field]: tempValue }).eq("user_id", member.user_id);
     if (error) alert("Error updating");
     else { setMember({...member, [field]: tempValue}); setEditingField(null); }
  };

  // --- DOWNLOAD ID ---
  const downloadImage = async () => {
    if (!idCardRef.current) return;
    const canvas = await html2canvas(idCardRef.current, {
      backgroundColor:null, // Ensure white background
      scale: 3, 
      useCORS: true, 
    });
    const image = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = image;
    link.download = `${member.name.replace(/\s+/g, '_')}_ID.png`;
    link.click();
  };

  if (loading) return <div className="dashboard-wrapper"><div className="loader"></div></div>;

  // Pending Screen
  if (member && member.status === 'pending') {
    return (
       <div className="dashboard-wrapper">
         <div className="info-card" style={{textAlign:'center', padding:'40px'}}>
            <h2>⏳ Verification Pending</h2>
            <p>We are verifying your payment Ref: {member.payment_ref}</p>
            <button onClick={handleLogout} className="logout-btn-danger">Log Out</button>
         </div>
       </div>
    );
  }

  const verificationLink = `${window.location.origin}/verify/${member.user_id}`;
  // Use database date or default to 'N/A'
  const validTillDate = member.valid_till 
    ? new Date(member.valid_till).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) 
    : "N/A";

  return (
    <div className="dashboard-wrapper">
      <input type="file" ref={fileInputRef} style={{ display: "none" }} accept="image/*" onChange={handleImageUpload}/>

      {/* HERO SECTION */}
      <div className="dashboard-hero">
        <div className="hero-content">
          <div className="avatar-container" onClick={handleAvatarClick}>
            <div className="avatar-large">
               {member.profile_pic ? <img src={member.profile_pic} alt="Profile" /> : <span>{member.name.charAt(0)}</span>}
            </div>
            <div className="avatar-overlay">{uploading ? <div className="loader-small"></div> : <Camera size={24} color="white" />}</div>
          </div>
          <div className="welcome-text">
            <h1>Welcome back, {member.name.split(" ")[0]}!</h1>
            <div className="badges">
              <span className="badge active">● Active Member</span>
              <span className="badge dept">{member.department}</span>
            </div>
          </div>
        </div>
        <button className="view-id-btn" onClick={() => setShowIdModal(true)}>🪪 View Digital ID</button>
      </div>

      <div className="dashboard-grid">
        {/* PROFILE DETAILS */}
        <div className="info-card">
          <h3>Personal Details</h3>
          <div className="detail-row locked"><label>Email:</label><div className="value">{member.email}</div></div>
          <div className="detail-row locked"><label>Name:</label><div className="value">{member.name}</div></div>
          
          <div className="detail-row">
            <label>Phone:</label>
            {editingField === "phone" ? (
              <div className="edit-mode">
                <input value={tempValue} onChange={(e) => setTempValue(e.target.value)} autoFocus />
                <button onClick={() => saveEditing("phone")} className="save-icon"><Check size={18}/></button>
                <button onClick={cancelEditing} className="cancel-icon"><X size={18}/></button>
              </div>
            ) : (
              <div className="value-group"><span>{member.phone}</span><button onClick={() => startEditing("phone", member.phone)} className="edit-icon"><Edit2 size={16}/></button></div>
            )}
          </div>

          <div className="detail-row">
            <label>Year:</label>
            {editingField === "year" ? (
              <div className="edit-mode">
                 <select value={tempValue} onChange={(e) => setTempValue(e.target.value)}>
                    <option value="1st Year">1st Year</option><option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option><option value="4th Year">4th Year</option>
                 </select>
                 <button onClick={() => saveEditing("year")} className="save-icon"><Check size={18}/></button>
                 <button onClick={cancelEditing} className="cancel-icon"><X size={18}/></button>
              </div>
            ) : (
              <div className="value-group"><span>{member.year}</span><button onClick={() => startEditing("year", member.year)} className="edit-icon"><Edit2 size={16}/></button></div>
            )}
          </div>

          <button onClick={handleLogout} className="logout-btn-danger"><LogOut size={18} style={{marginRight:'8px'}}/> Log Out</button>
        </div>

        {/* UPDATES COLUMN */}
        <div className="updates-column">
          <div className="placeholder-card">
            <div className="card-header"><Calendar size={20} className="icon-blue"/> <h4>Upcoming Events</h4></div>
            <div className="empty-state"><p>No events scheduled for this week.</p><button className="small-btn">View Calendar</button></div>
          </div>
        </div>
      </div>

      {showIdModal && (
        <div className="modal-overlay" onClick={() => setShowIdModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal-btn" onClick={() => setShowIdModal(false)}><X size={24}/></button>
            
            <div className="digital-id-card-light" ref={idCardRef}>
               {/* 1. Header Title */}
               <div className="id-header-light">ALGON DC ID</div>
               
               <div className="id-body-light">
                 {/* 2. Club Logo */}
                 <img src={clubLogo} alt="Club Logo" className="club-logo-img" onError={(e) => e.target.style.display='none'} />

                 {/* User Photo */}
                 <div className="id-photo-frame">
                   {member.profile_pic ? (
                     <img src={member.profile_pic} alt="Profile" crossOrigin="anonymous" />
                   ) : (
                     <div className="initials">{member.name.charAt(0)}</div>
                   )}
                 </div>
                 
                 <h2>{member.name}</h2>

                 {/* 👇 3. UPDATED POSITION LOGIC HERE 👇 */}
                 <p className={`role ${member.position === 'Execom Member' ? 'role-special' : ''}`}>
                   {member.position || "Student Member"}
                 </p>
                 
                 {/* 4. Details (College & Validity) */}
                 <div className="id-meta">
                   <p><strong>ID:</strong> {member.user_id.slice(0, 8).toUpperCase()}</p>
                   <p><strong>Dept:</strong> {member.department} &bull; <strong>Year:</strong> {member.year}</p>
                   <p><strong>College:</strong> GCE Kannur</p>
                   <p className="validity">Valid Till: <span style={{color:'#dc2626'}}>{validTillDate}</span></p>
                 </div>

                 <div className="qr-box">
                    <QRCode value={verificationLink} size={60} bgColor="transparent" fgColor="#000000" />
                 </div>
               </div>
            </div>
            <button className="download-btn-modal" onClick={downloadImage}><Download size={18} /> Download ID Card</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
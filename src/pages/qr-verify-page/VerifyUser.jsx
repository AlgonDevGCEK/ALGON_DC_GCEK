import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";

const VerifyUser = () => {
  const { userId } = useParams(); // Get ID from URL
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("loading"); // loading, valid, expired, invalid

  // --- NEW: INITIALS LOGIC ---
  const getInitials = (name) => {
    if (!name) return "?";
    const names = name.split(" ");
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return names[0][0].toUpperCase();
  };

  useEffect(() => {
    const fetchMember = async () => {
      if (!userId) {
        setStatus("invalid");
        setLoading(false);
        return;
      }

      // 1. Fetch Member Details
      const { data, error } = await supabase
        .from("member_public_info")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error || !data) {
        setStatus("invalid");
      } else {
        setMember(data);
        
        // 2. Check Expiry Date
        const today = new Date();
        const validTill = new Date(data.valid_till);

        if (data.status !== 'approved') {
             setStatus("not_active"); // User exists but Admin hasn't approved yet
        } else if (validTill < today) {
             setStatus("expired");
        } else {
             setStatus("valid");
        }
      }
      setLoading(false);
    };

    fetchMember();
  }, [userId]);

  if (loading) return <div style={{color:'white', textAlign:'center', marginTop:'50px'}}>Verifying...</div>;

  return (
    <div style={{minHeight:'100vh', background:'#0f172a', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px'}}>
      <div style={{background:'#1e293b', padding:'40px', borderRadius:'20px', textAlign:'center', maxWidth:'400px', width:'100%', boxShadow:'0 20px 50px rgba(0,0,0,0.5)', border:'1px solid rgba(255,255,255,0.1)'}}>
        
        {/* --- VALID  --- */}
        {status === "valid" && (
          <>
            <CheckCircle size={80} color="#4ade80" style={{marginBottom:'20px'}} />
            <h2 style={{color:'#4ade80', margin:'0 0 10px 0'}}>VERIFIED MEMBER</h2>
            
            {/* UPDATED PROFILE PICTURE / INITIALS SECTION */}
            <div style={{
                width:'100px', 
                height:'100px', 
                borderRadius:'50%', 
                overflow:'hidden', 
                margin:'20px auto', 
                border:'4px solid #4ade80',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: member.profile_pic ? 'transparent' : 'linear-gradient(135deg, #3b82f6, #2563eb)'
            }}>
               {member.profile_pic ? (
                   <img src={member.profile_pic} style={{width:'100%', height:'100%', objectFit:'cover'}} alt="Profile"/>
               ) : (
                   <span style={{ color: 'white', fontSize: '32px', fontWeight: 'bold', letterSpacing: '1px' }}>
                       {getInitials(member.name)}
                   </span>
               )}
            </div>

            <h3 style={{color:'white', margin:'10px 0'}}>{member.name}</h3>
            <p style={{color:'#94a3b8', margin:'5px 0'}}>ID: {member.user_id.slice(0,8)}</p>
            <p style={{color:'#94a3b8', margin:'5px 0'}}>{member.department} • {member.year}</p>
            <div style={{background:'rgba(74, 222, 128, 0.1)', padding:'10px', borderRadius:'8px', marginTop:'20px', border:'1px solid rgba(74, 222, 128, 0.2)'}}>
               <p style={{color:'#4ade80', fontWeight:'bold', margin:0}}>Active until {member.valid_till}</p>
            </div>
          </>
        )}

        {/* --- EXPIRED  --- */}
        {status === "expired" && (
          <>
            <AlertTriangle size={80} color="#facc15" style={{marginBottom:'20px'}} />
            <h2 style={{color:'#facc15', margin:'0 0 10px 0'}}>MEMBERSHIP EXPIRED</h2>
            <h3 style={{color:'white'}}>{member.name}</h3>
            <p style={{color:'#94a3b8'}}>Expired on: {member.valid_till}</p>
            <p style={{color:'#ef4444', marginTop:'15px'}}>Please renew membership.</p>
          </>
        )}

        {/* --- NOT ACTIVE  --- */}
        {status === "not_active" && (
          <>
            <AlertTriangle size={80} color="#fb923c" style={{marginBottom:'20px'}} />
            <h2 style={{color:'#fb923c', margin:'0 0 10px 0'}}>NOT APPROVED</h2>
            <h3 style={{color:'white'}}>{member.name}</h3>
            <p style={{color:'#94a3b8'}}>Admin has not approved this ID yet.</p>
          </>
        )}

        {/* --- INVALID  --- */}
        {status === "invalid" && (
          <>
            <XCircle size={80} color="#ef4444" style={{marginBottom:'20px'}} />
            <h2 style={{color:'#ef4444', margin:'0 0 10px 0'}}>INVALID ID</h2>
            <p style={{color:'#94a3b8'}}>This QR code does not match any valid record in our database.</p>
          </>
        )}

      </div>
    </div>
  );
};

export default VerifyUser;
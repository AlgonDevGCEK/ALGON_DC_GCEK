import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient'; 
// 👇 1. ADD 'Download' TO IMPORTS
import { Search, Check, X, Copy, Save, Edit2, Trash2, Calendar, Phone, Download } from 'lucide-react'; 
import './Admin.css';

const AdminMemberManager = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMembers(data);
    } catch (error) {
      console.error("Error fetching members:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- ACTIONS ---

  const handleVerify = async (userId) => {
    const confirm = window.confirm("Confirm payment? This will approve the user for 1 YEAR.");
    if (!confirm) return;

    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    const validDate = nextYear.toISOString().split('T')[0]; 

    const { error } = await supabase
      .from('members')
      .update({ 
        status: 'approved', 
        valid_till: validDate,
        role: 'member',
        position: 'Student Member'
      })
      .eq('user_id', userId);

    if (error) alert("Error verifying user.");
    else fetchMembers();
  };

  const handleDelete = async (userId) => {
    if(!window.confirm("Are you sure? This will delete the user permanently.")) return;

    const { error } = await supabase
      .from('members')
      .delete()
      .eq('user_id', userId);

    if (error) alert("Error deleting user.");
    else fetchMembers();
  };

  const startEditing = (member) => {
    setEditingId(member.id);
    setEditForm({
      name: member.name,
      department: member.department,
      year: member.year,
      phone: member.phone,
      duration: member.duration,
      valid_till: member.valid_till,
      payment_ref: member.payment_ref,
      status: member.status,
      position: member.position,
      role: member.role
    });
  };

  const saveChanges = async (userId) => {
    console.log("Saving changes for:", userId);

    const { error } = await supabase
      .from('members')
      .update(editForm)
      .eq('user_id', userId);

    if (error) {
      console.error("Supabase Error:", error);
      alert(`Update Failed: ${error.message}`);
    } else {
      setEditingId(null);
      fetchMembers();
    }
  };

  // 👇 2. INSERT THIS NEW EXPORT FUNCTION HERE
  const handleExport = () => {
    const dataToExport = filteredMembers; 

    if (dataToExport.length === 0) {
      alert("No data to export.");
      return;
    }

    // Define CSV Headers
    const headers = [
      "User ID", "Name", "Email", "Phone", "Department", 
      "Year", "Role", "Position", "Status", "Payment Ref", "Valid Till"
    ];

    // Convert Data to CSV Format
    const csvContent = [
      headers.join(","),
      ...dataToExport.map(member => {
        const safe = (text) => `"${(text || "").toString().replace(/"/g, '""')}"`;
        return [
          safe(member.user_id), safe(member.name), safe(member.email),
          safe(member.phone), safe(member.department), safe(member.year),
          safe(member.role), safe(member.position), safe(member.status),
          safe(member.payment_ref), safe(member.valid_till)
        ].join(",");
      })
    ].join("\n");

    // Trigger Download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `members_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  // 👆 END OF NEW FUNCTION

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const copyToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = 
      member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.payment_ref?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || member.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="admin-section">
      <div className="admin-header">
        <h2>Member Management</h2>
        <div className="stats-badge">
          {members.filter(m => m.status === 'pending').length} Pending
        </div>
      </div>

      {/* Toolbar */}
      <div className="admin-toolbar">
         <div className="search-box">
           <Search size={18} className="search-icon" />
           <input 
             type="text" 
             placeholder="Search Name, Email, Payment Ref..." 
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
         </div>
         
         <div className="filter-tabs">
            <button className={filterStatus === 'all' ? 'active' : ''} onClick={()=>setFilterStatus('all')}>All</button>
            <button className={filterStatus === 'pending' ? 'active' : ''} onClick={()=>setFilterStatus('pending')}>Pending</button>
            <button className={filterStatus === 'approved' ? 'active' : ''} onClick={()=>setFilterStatus('approved')}>Approved</button>
         </div>

         {/* 👇 3. INSERT THE BUTTON HERE IN THE TOOLBAR */}
         <button className="btn-export" onClick={handleExport} title="Download CSV">
            <Download size={18} /> Export
         </button>
      </div>

      <div className="table-container">
        {loading ? <p className="loading-text">Loading...</p> : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Profile (Read-Only Email)</th>
                <th>Academic & Contact</th>
                <th>Membership & Role</th>
                <th>Payment & Validity</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member) => {
                const isEditing = editingId === member.id;
                
                return (
                  <tr key={member.id} className={member.status === 'pending' ? 'row-pending' : ''}>
                    {/* ... (Rest of your table rows remain exactly the same) ... */}
                    {/* I am hiding the table rows here to save space, paste your existing <tbody> content here */}
                    
                    <td>
                      <div className="member-cell">
                        {member.profile_pic ? (
                          <img src={member.profile_pic} alt="profile" className="table-avatar-img" />
                        ) : (
                          <div className="table-avatar">{member.name?.charAt(0).toUpperCase()}</div>
                        )}
                        <div>
                          {isEditing ? (
                            <input name="name" value={editForm.name || ''} onChange={handleEditChange} className="edit-input" placeholder="Name" />
                          ) : (
                            <strong>{member.name}</strong>
                          )}
                          <span className="sub-text">{member.email}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="details-stack">
                        {isEditing ? (
                          <>
                            <input name="department" value={editForm.department || ''} onChange={handleEditChange} className="edit-input" placeholder="Branch" />
                            <input name="year" value={editForm.year || ''} onChange={handleEditChange} className="edit-input" placeholder="Year" />
                            <input name="phone" value={editForm.phone || ''} onChange={handleEditChange} className="edit-input" placeholder="Phone" />
                          </>
                        ) : (
                          <>
                            <span>{member.department} - {member.year}</span>
                            <div className="icon-row"><Phone size={12}/> {member.phone || "N/A"}</div>
                          </>
                        )}
                      </div>
                    </td>

                    <td>
                      <div className="details-stack">
                        {isEditing ? (
                          <>
                            <select name="role" value={editForm.role || 'member'} onChange={handleEditChange} className="edit-input">
                                <option value="member">Member</option>
                                <option value="admin">Admin</option>
                            </select>
                            <input name="position" value={editForm.position || ''} onChange={handleEditChange} className="edit-input" placeholder="Position" />
                            <input name="duration" value={editForm.duration || ''} onChange={handleEditChange} className="edit-input" placeholder="Duration" />
                          </>
                        ) : (
                          <>
                            <span className={`role-badge ${member.role}`}>{member.role}</span>
                            <span className="sub-text">{member.position}</span>
                            {member.duration && <span className="sub-text small">({member.duration})</span>}
                          </>
                        )}
                      </div>
                    </td>

                    <td>
                      <div className="details-stack">
                         {isEditing ? (
                            <>
                              <input name="payment_ref" value={editForm.payment_ref || ''} onChange={handleEditChange} className="edit-input" placeholder="Ref ID" />
                              <input type="date" name="valid_till" value={editForm.valid_till || ''} onChange={handleEditChange} className="edit-input" />
                              <select name="status" value={editForm.status || 'pending'} onChange={handleEditChange} className="edit-input">
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                              </select>
                            </>
                         ) : (
                            <>
                              <div className="tx-row">
                                <code className="tx-code">{member.payment_ref || "No Ref"}</code>
                                {member.payment_ref && <Copy size={12} className="copy-icon" onClick={() => copyToClipboard(member.payment_ref)}/>}
                              </div>
                              <div className="icon-row"><Calendar size={12}/> {member.valid_till || "No Date"}</div>
                              <span className={`status-dot ${member.status}`}>• {member.status}</span>
                            </>
                         )}
                      </div>
                    </td>

                    <td>
                      <div className="action-row">
                        {isEditing ? (
                          <button className="btn-save" onClick={() => saveChanges(member.user_id)}>
                            <Save size={16}/> Save
                          </button>
                        ) : (
                          <>
                            {member.status === 'pending' ? (
                               <button className="btn-verify" onClick={() => handleVerify(member.user_id)} title="Approve"><Check size={16}/></button>
                            ) : (
                               <button className="btn-edit" onClick={() => startEditing(member)}><Edit2 size={16}/></button>
                            )}
                            <button className="btn-reject" onClick={() => handleDelete(member.user_id)} title="Delete"><Trash2 size={16}/></button>
                          </>
                        )}
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminMemberManager;
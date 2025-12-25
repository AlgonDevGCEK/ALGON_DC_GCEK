import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import clubLogo from '../../assets/club-logo.jpeg';
import { 
  Plus, Edit2, Trash2, Users, X, Save, 
  Download, FileSpreadsheet, FileText,
  Image as ImageIcon, Link as LinkIcon, MessageCircle,
  ArrowUp, ArrowDown, UserMinus // Added UserMinus icon
} from 'lucide-react';
import './AdminPrograms.css';

const AdminPrograms = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list'); 
  const [selectedProgram, setSelectedProgram] = useState(null);
  
  // Registration Data
  const [registrations, setRegistrations] = useState([]);
  const [regLoading, setRegLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '', 
    date: '', 
    time: '', 
    location: '', 
    description: '',
    full_details: '', 
    type: 'Workshop', 
    image_url: '',
    total_seats: 60,
    whatsapp_link: '',
    external_link: '',
    display_order: 0 // 👈 NEW: Priority Order
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // --- 1. INITIAL FETCH ---
  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    setLoading(true);
    // 👇 UPDATED: Sort by Custom Order first, then Date
    const { data, error } = await supabase
      .from('programs')
      .select('*')
      .order('display_order', { ascending: true }) 
      .order('date', { ascending: false });

    if (error) console.error("Error fetching programs:", error);
    else setPrograms(data);
    setLoading(false);
  };

  // --- 2. REGISTRATION FETCHING ---
  const fetchRegistrations = async (programId) => {
    setRegLoading(true);
    const { data: regData, error: regError } = await supabase
      .from('registrations')
      .select('*')
      .eq('event_id', programId);

    if (regError) {
      alert("Error fetching registrations");
      setRegLoading(false);
      return;
    }

    const userIds = regData.map(r => r.user_id).filter(id => id);

    let memberMap = {};
    if (userIds.length > 0) {
      const { data: memberData } = await supabase
        .from('members')
        .select('user_id, id, position')
        .in('user_id', userIds);
      
      memberData?.forEach(m => { memberMap[m.user_id] = m; });
    }

    const mergedData = regData.map(reg => ({
      ...reg,
      is_member: !!memberMap[reg.user_id],
      member_id: memberMap[reg.user_id]?.id || 'N/A',
      position: memberMap[reg.user_id]?.position || 'Student'
    }));

    setRegistrations(mergedData);
    setRegLoading(false);
  };

  // --- IMPLEMENTED: INDIVIDUAL DELETE FOR USERS ---
  const handleDeleteRegistration = async (regId) => {
    if (!window.confirm("Remove this student from the registration list?")) return;

    const { error } = await supabase
      .from('registrations')
      .delete()
      .eq('id', regId);

    if (error) {
      alert("Error deleting user: " + error.message);
    } else {
      // Refresh local list
      setRegistrations(prev => prev.filter(r => r.id !== regId));
    }
  };

  // --- 3. EXPORT FUNCTIONS ---
  const exportToExcel = () => {
    const sheetData = registrations.map(r => ({
      "Name": r.full_name,
      "Email": r.email,
      "Phone": r.phone_number,
      "Branch": r.branch,
      "Year": r.year,
      "Status": r.is_member ? "Member" : "Guest"
    }));

    const ws = XLSX.utils.json_to_sheet(sheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Registrations");
    XLSX.writeFile(wb, `${selectedProgram.title}_Registrations.xlsx`);
  };

  const exportToPDF = () => {
    try {
      const doc = new jsPDF();

      // Logo
      try {
        doc.addImage(clubLogo, 'JPEG', 14, 14, 39, 18); 
      } catch (err) {
        console.warn("Logo failed to load:", err);
      }

      // Title
      doc.setTextColor(0, 0, 0); 
      doc.setFontSize(19);
      doc.text(`${selectedProgram.title} - Attendance`, 120, 20, { align: 'center' });
      
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 120, 27, { align: 'center' });
      
      // Table
      const tableColumn = ["SI No", "Name", "Branch", "Year", "Phone", "Status", "Sign"];
      
      const tableRows = registrations.map((r, index) => [
        index + 1,
        r.full_name,
        r.branch || '-',
        r.year || '-',
        r.phone_number,
        r.is_member ? "Member" : "Guest",
        "" 
      ]);

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 40,
        theme: 'grid',
        styles: { 
          fontSize: 9,
          textColor: [0, 0, 0], 
          halign: 'center',
          valign: 'middle',
          cellPadding: 3,
          lineColor: [0, 0, 0],
          lineWidth: 0.1
        },
        headStyles: { 
          fillColor: [230, 230, 230], 
          textColor: [0, 0, 0],
          fontStyle: 'bold',
          lineWidth: 0.1
        },
        columnStyles: {
          0: { cellWidth: 15 },
          1: { cellWidth: 40 },
          4: { cellWidth: 30 },
          6: { cellWidth: 35 }
        }
      });

      doc.save(`${selectedProgram.title}_Attendance_Sheet.pdf`);

    } catch (error) {
      console.error("PDF Generation Error:", error);
      alert("Failed to generate PDF. Check console.\nError: " + error.message);
    }
  };

  // --- 4. CRUD HANDLERS ---
  const handleEditClick = (prog) => {
    setFormData({
      title: prog.title,
      date: prog.date,
      time: prog.time,
      location: prog.location,
      description: prog.description || '',
      full_details: prog.full_details || '', 
      type: prog.type || 'Workshop',
      image_url: prog.image_url || '',
      total_seats: prog.total_seats || 60,
      whatsapp_link: prog.whatsapp_link || '',
      external_link: prog.external_link || '',
      display_order: prog.display_order || 0 //  Load existing order
    });
    setSelectedProgram(prog);
    setView('edit');
  };

  const handleRegClick = (prog) => {
    setSelectedProgram(prog);
    setView('registrations');
    fetchRegistrations(prog.id);
  };

  const handleInputChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleImageUpload = async () => {
    if (!imageFile) return formData.image_url;

    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    setUploading(true);
    const { error: uploadError } = await supabase.storage
      .from('Event-images')
      .upload(filePath, imageFile, { upsert: true });

    if (uploadError) {
      alert("Image upload failed: " + uploadError.message);
      setUploading(false);
      return null;
    }

    const { data } = supabase.storage.from('Event-images').getPublicUrl(filePath);
    setUploading(false);
    return data.publicUrl;
  };

  // --- IMPLEMENTED: CASCADING DELETE (CLEAR STUDENTS -> DELETE PROGRAM) ---
  const handleDelete = async (id, imageUrl) => {
    if (!window.confirm("WARNING: This will delete ALL registrations for this event and the event itself. Proceed?")) return;

    setLoading(true);

    // 1. Delete all registrations linked to this event first
    const { error: regError } = await supabase
      .from('registrations')
      .delete()
      .eq('event_id', id);

    if (regError) {
      alert("Error clearing registrations: " + regError.message);
      setLoading(false);
      return;
    }

    // 2. Delete the image from storage if it exists
    if (imageUrl) {
      const path = imageUrl.split('/Event-images/')[1];
      if (path) await supabase.storage.from('Event-images').remove([path]);
    }

    // 3. Finally, delete the program itself
    const { error: progError } = await supabase.from('programs').delete().eq('id', id);
    
    if (progError) alert("Error deleting event: " + progError.message);
    else fetchPrograms();
    
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    const imageUrl = await handleImageUpload();
    if (imageUrl === null && imageFile) return;

    const payload = { 
      ...formData, 
      image_url: imageUrl,
      whatsapp_link: formData.whatsapp_link || null,
      external_link: formData.external_link || null,
      display_order: parseInt(formData.display_order) // Ensure it's a number
    };

    if (view === 'create') {
      const { error } = await supabase.from('programs').insert([payload]);
      if (error) alert("Insert Failed: " + error.message);
    } else {
      const { error } = await supabase.from('programs').update(payload).eq('id', selectedProgram.id);
      if (error) alert("Update Failed: " + error.message);
    }

    setUploading(false);
    setView('list');
    fetchPrograms();
  };

  // --- VIEWS ---

  if (view === 'registrations') return (
    <div className="admin-console">
      <div className="console-header">
        <button onClick={() => setView('list')} className="back-btn"><X size={18}/> Close</button>
        <h2>{selectedProgram?.title} <span className="highlight-text">Registrations</span></h2>
        <div className="header-actions">
          <button onClick={exportToExcel} className="export-btn excel"><FileSpreadsheet size={16}/> Excel</button>
          <button onClick={exportToPDF} className="export-btn pdf"><FileText size={16}/> PDF</button>
        </div>
      </div>
      <div className="table-container">
        {regLoading ? <div className="loading-txt">Loading data...</div> : (
          <table className="admin-table">
            <thead>
              <tr><th>Name</th><th>Branch & Year</th><th>Contact</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              {registrations.length === 0 ? (
                <tr><td colSpan="5" style={{textAlign:'center'}}>No registrations yet.</td></tr>
              ) : (
                registrations.map(reg => (
                  <tr key={reg.id}>
                    <td>{reg.full_name} <br/><span className="sub-text">{reg.email}</span></td>
                    <td>{reg.branch} <br/><span className="sub-text">{reg.year}</span></td>
                    <td>{reg.phone_number}</td>
                    <td>{reg.is_member ? <span className="badge-member">✅ Member</span> : <span className="badge-guest">Guest</span>}</td>
                    <td>
                      <button onClick={() => handleDeleteRegistration(reg.id)} title="Delete Attendee" className="icon-btn red">
                        <UserMinus size={18}/>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );

  // B. CREATE / EDIT FORM
  if (view === 'create' || view === 'edit') return (
    <div className="admin-console">
      <div className="console-header">
        <button onClick={() => setView('list')} className="back-btn"><X size={18}/> Cancel</button>
        <h2>{view === 'create' ? 'Create New Event' : 'Edit Event'}</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="admin-form">
        <div className="form-row">
          <div className="form-group">
            <label>Title</label>
            <input name="title" value={formData.title} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <label>Type</label>
            <select name="type" value={formData.type} onChange={handleInputChange}>
              <option value="Workshop">Workshop</option>
              <option value="Webinar">Webinar</option>
              <option value="Hackathon">Hackathon</option>
              <option value="Meetup">Meetup</option>
              <option value="Project Expo">Project Expo</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Date</label>
            <input type="date" name="date" value={formData.date} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <label>Time</label>
            <input type="text" name="time" placeholder="e.g. 10:00 AM" value={formData.time} onChange={handleInputChange} required />
          </div>
          
          {/* 👇 NEW: Priority Order Field */}
          <div className="form-group" style={{maxWidth: '100px'}}>
             <label title="Lower numbers show first">Priority</label>
             <input type="number" name="display_order" value={formData.display_order} onChange={handleInputChange} />
          </div>

          <div className="form-group" style={{maxWidth: '100px'}}>
            <label>Seats</label>
            <input type="number" name="total_seats" value={formData.total_seats} onChange={handleInputChange} />
          </div>
        </div>

        <div className="form-group">
          <label>Location</label>
          <input name="location" value={formData.location} onChange={handleInputChange} required />
        </div>

        <div className="form-group">
          <label>Short Description</label>
          <textarea name="description" rows="3" value={formData.description} onChange={handleInputChange} required />
        </div>

        <div className="form-group">
          <label>Full Details (Detailed Description)</label>
          <textarea 
            name="full_details" 
            rows="6" 
            placeholder="Enter comprehensive details about the event..."
            value={formData.full_details} 
            onChange={handleInputChange} 
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>WhatsApp Group Link <MessageCircle size={14}/></label>
            <input name="whatsapp_link" placeholder="https://chat.whatsapp.com/..." value={formData.whatsapp_link} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label>External Registration Link <LinkIcon size={14}/></label>
            <input name="external_link" placeholder="Leave empty for internal registration" value={formData.external_link} onChange={handleInputChange} />
          </div>
        </div>

        <div className="form-group">
          <label>Event Image</label>
          <div className="file-input-wrapper">
            <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} />
            <ImageIcon size={20} />
            <span>{imageFile ? imageFile.name : "Click to Upload New Image"}</span>
          </div>
          {formData.image_url && !imageFile && (
            <div className="img-preview">Current: <a href={formData.image_url} target="_blank" rel="noreferrer">View Image</a></div>
          )}
        </div>

        <button type="submit" className="save-btn" disabled={uploading}>
          {uploading ? 'Uploading...' : <><Save size={18}/> Save Event</>}
        </button>
      </form>
    </div>
  );

  // C. LIST VIEW
  return (
    <div className="admin-console">
      <div className="console-header">
        <h2>Program Management</h2>
        <button onClick={() => {
          setFormData({ 
            title: '', date: '', time: '', location: '', description: '', 
            full_details: '', 
            type: 'Workshop', image_url: '', total_seats: 60, whatsapp_link: '', external_link: '',
            display_order: 0 // Reset Order
          });
          setImageFile(null);
          setView('create');
        }} className="create-btn">
          <Plus size={18}/> Add Event
        </button>
      </div>

      <div className="table-container">
        {loading ? <div className="loading-txt">Loading events...</div> : (
          <table className="admin-table">
            <thead>
              <tr><th>Priority</th><th>Event</th><th>Date</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {programs.map(prog => (
                <tr key={prog.id}>
                  {/* 👇 NEW: Display Order Column */}
                  <td>
                    <span style={{ 
                      background: '#334155', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', color: 'white'
                    }}>
                      {prog.display_order}
                    </span>
                  </td>
                  <td className="main-col">
                    <strong>{prog.title}</strong>
                    <br/><span className="sub-text">{prog.type}</span>
                  </td>
                  <td>{prog.date}</td>
                  <td className="actions-col">
                    <button onClick={() => handleRegClick(prog)} title="View Registrations" className="icon-btn blue"><Users size={18}/></button>
                    <button onClick={() => handleEditClick(prog)} title="Edit" className="icon-btn yellow"><Edit2 size={18}/></button>
                    <button onClick={() => handleDelete(prog.id, prog.image_url)} title="Delete" className="icon-btn red"><Trash2 size={18}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminPrograms;
// src/components/AdminUpload.jsx
import { useState } from "react";
import { supabase } from "../../supabaseClient";
import "./AdminUpload.css";

export default function AdminUpload() {
  const [file, setFile] = useState(null);
  const [quote, setQuote] = useState("");
  const [eventType, setEventType] = useState("");
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    
    // Create preview
    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a file first!");

    setUploading(true);
    const fileName = `${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from('gallery')
      .upload(`public/${fileName}`, file);

    if (uploadError) {
      alert("Storage upload failed: " + uploadError.message);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from('gallery')
      .getPublicUrl(`public/${fileName}`);

    const { error: dbError } = await supabase
      .from('gallery_events')
      .insert([{ 
        image_url: urlData.publicUrl, 
        quote: quote,
        event_type: eventType 
      }]);

    if (dbError) {
      alert("Database error: " + dbError.message);
    } else {
      alert("Success! Image added to gallery.");
      setQuote("");
      setEventType("");
      setFile(null);
      setPreview(null);
    }
    setUploading(false);
  };

  return (
    <div className="admin-upload-section">
      <div className="admin-upload-container animate-fade-in">
        <div className="admin-header animate-slide-down">
          <h2>Admin Upload Panel</h2>
          <p>Add new images to the live gallery</p>
        </div>

        <form onSubmit={handleUpload} className="upload-form">
          
          <div className="form-group animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <label className="file-upload-label">
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange}
                className="file-input"
              />
              <div className="file-upload-area">
                {preview ? (
                  <div className="preview-container">
                    <img src={preview} alt="Preview" className="preview-image" />
                    <div className="preview-overlay">
                      <span>Click to change image</span>
                    </div>
                  </div>
                ) : (
                  <div className="upload-placeholder">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="17 8 12 3 7 8"></polyline>
                      <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                    <span>Click to upload image</span>
                    <span className="upload-hint">PNG, JPG, GIF up to 10MB</span>
                  </div>
                )}
              </div>
            </label>
          </div>

          <div className="form-group animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <label htmlFor="event-type">Event Type</label>
            <select
              id="event-type"
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className="event-type-input"
              required
            >
              <option value="">Select event type...</option>
              <option value="Workshop">Workshop</option>
              <option value="Hackathon">Hackathon</option>
              <option value="Seminar">Seminar</option>
              <option value="Conference">Conference</option>
              <option value="Meetup">Meetup</option>
              <option value="Competition">Competition</option>
              <option value="Training">Training</option>
              <option value="Social">Social Event</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <label htmlFor="quote">Caption / Quote</label>
            <input 
              type="text" 
              id="quote"
              placeholder="Enter a caption or quote for this image..." 
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              className="quote-input"
            />
          </div>

          <button 
            type="submit" 
            disabled={uploading || !file || !eventType}
            className={`submit-button animate-slide-up ${uploading ? 'uploading' : ''}`}
            style={{ animationDelay: '0.5s' }}
          >
            {uploading ? (
              <>
                <span className="spinner"></span>
                Uploading...
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                Upload & Publish
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
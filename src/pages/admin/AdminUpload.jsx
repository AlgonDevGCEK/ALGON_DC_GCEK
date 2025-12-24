// src/components/AdminUpload.jsx
import { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import "./AdminUpload.css";

export default function AdminUpload() {
  const [file, setFile] = useState(null);
  const [quote, setQuote] = useState("");
  const [eventType, setEventType] = useState("");
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  
  // Gallery state
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    fetchImages();

    // Realtime subscription for new images
    const channel = supabase
      .channel('admin-gallery-updates')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'gallery_events' },
        (payload) => {
          setImages((prevImages) => [payload.new, ...prevImages]);
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'gallery_events' },
        (payload) => {
          setImages((prevImages) => prevImages.filter(img => img.id !== payload.old.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchImages() {
    const { data, error } = await supabase
      .from('gallery_events')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) console.error("Error fetching gallery:", error);
    else setImages(data);
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    
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
      setShowUploadForm(false);
    }
    setUploading(false);
  };

  const handleDelete = async (imageId, imageUrl) => {
    if (!window.confirm("Are you sure you want to delete this image?")) return;
    
    setDeleting(imageId);

    // Extract file path from URL
    const urlParts = imageUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];
    const filePath = `public/${fileName}`;

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('gallery')
      .remove([filePath]);

    if (storageError) {
      console.error("Storage deletion error:", storageError);
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('gallery_events')
      .delete()
      .eq('id', imageId);

    if (dbError) {
      alert("Database error: " + dbError.message);
    } else {
      setImages(images.filter(img => img.id !== imageId));
      if (selectedImage?.id === imageId) {
        setSelectedImage(null);
      }
    }
    
    setDeleting(null);
  };

  return (
    <div className="admin-upload-section">
      <div className="admin-container">
        
        {/* Header with Add Button */}
        <div className="admin-header animate-fade-in">
          <div className="header-content">
            <h2>Admin Gallery Manager</h2>
            <p>Manage and upload images to the live gallery</p>
          </div>
          <button 
            className="add-image-btn animate-slide-down"
            onClick={() => setShowUploadForm(!showUploadForm)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            {showUploadForm ? 'Cancel' : 'Add New Image'}
          </button>
        </div>

        {/* Upload Form (Collapsible) */}
        {showUploadForm && (
          <div className="upload-form-container animate-slide-down">
            <form onSubmit={handleUpload} className="upload-form">
              
              <div className="form-group animate-slide-up" style={{ animationDelay: '0.1s' }}>
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

              <div className="form-row">
                <div className="form-group animate-slide-up" style={{ animationDelay: '0.2s' }}>
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

                <div className="form-group animate-slide-up" style={{ animationDelay: '0.3s' }}>
                  <label htmlFor="quote">Caption / Quote</label>
                  <input 
                    type="text" 
                    id="quote"
                    placeholder="Enter a caption..." 
                    value={quote}
                    onChange={(e) => setQuote(e.target.value)}
                    className="quote-input"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={uploading || !file || !eventType}
                className={`submit-button animate-slide-up ${uploading ? 'uploading' : ''}`}
                style={{ animationDelay: '0.4s' }}
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
        )}

        {/* Gallery Grid */}
        <div className="gallery-section">
          <div className="gallery-stats animate-fade-in">
            <div className="stat-badge">
              <span className="stat-number">{images.length}</span>
              <span className="stat-label">Total Images</span>
            </div>
          </div>

          <div className="gallery-grid">
            {images.map((item, index) => (
              <div 
                className="gallery-card animate-slide-up" 
                key={item.id}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="gallery-image-wrapper" onClick={() => setSelectedImage(item)}>
                  <img src={item.image_url} alt="Gallery Event" loading="lazy" />
                  <div className="gallery-shine"></div>
                </div>
                
                <div className="gallery-info">
                  <div className="info-content">
                    {item.event_type && (
                      <span className="event-type-badge">{item.event_type}</span>
                    )}
                    <p className="gallery-quote">{item.quote || "Algon Developer Community"}</p>
                  </div>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDelete(item.id, item.image_url)}
                    disabled={deleting === item.id}
                  >
                    {deleting === item.id ? (
                      <span className="mini-spinner"></span>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lightbox */}
        {selectedImage && (
          <div className="lightbox animate-fade-in" onClick={() => setSelectedImage(null)}>
            <div className="lightbox-content animate-scale-in" onClick={(e) => e.stopPropagation()}>
              <button className="lightbox-close" onClick={() => setSelectedImage(null)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
              <img src={selectedImage.image_url} alt="Preview" />
              {selectedImage.quote && (
                <div className="lightbox-caption">
                  <p>{selectedImage.quote}</p>
                </div>
              )}
              <button 
                className="lightbox-delete-btn"
                onClick={() => {
                  handleDelete(selectedImage.id, selectedImage.image_url);
                  setSelectedImage(null);
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
                Delete Image
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
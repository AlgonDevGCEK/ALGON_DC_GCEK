// src/components/AdminUpload.jsx
import { useState } from "react";
import { supabase } from "../../supabaseClient";

export default function AdminUpload() {
  const [file, setFile] = useState(null);
  const [quote, setQuote] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a file first!");

    setUploading(true);
    const fileName = `${Date.now()}-${file.name}`;

    // 1. Upload File to Storage Bucket
    const { error: uploadError } = await supabase.storage
      .from('gallery')
      .upload(`public/${fileName}`, file);

    if (uploadError) {
      alert("Storage upload failed: " + uploadError.message);
      setUploading(false);
      return;
    }

    // 2. Get the Public URL
    const { data: urlData } = supabase.storage
      .from('gallery')
      .getPublicUrl(`public/${fileName}`);

    // 3. Save Record to Database
    const { error: dbError } = await supabase
      .from('gallery_events')
      .insert([
        { 
          image_url: urlData.publicUrl, 
          quote: quote 
        }
      ]);

    if (dbError) {
      alert("Database error: " + dbError.message);
    } else {
      alert("Success! Image added to gallery.");
      setQuote("");
      setFile(null);
    }
    setUploading(false);
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "500px", margin: "0 auto", color: "white" }}>
      <h2>Admin Upload Panel</h2>
      <form onSubmit={handleUpload} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        
        <input 
          type="file" 
          accept="image/*" 
          onChange={(e) => setFile(e.target.files[0])} 
          style={{ padding: "10px", background: "#333", border: "1px solid #555" }}
        />
        
        <input 
          type="text" 
          placeholder="Enter a caption/quote..." 
          value={quote}
          onChange={(e) => setQuote(e.target.value)}
          style={{ padding: "10px", background: "#333", border: "1px solid #555", color: "white" }}
        />

        <button 
          type="submit" 
          disabled={uploading}
          style={{ padding: "10px", background: "#a855f7", border: "none", color: "white", cursor: "pointer" }}
        >
          {uploading ? "Uploading..." : "Upload & Publish"}
        </button>
      </form>
    </div>
  );
}
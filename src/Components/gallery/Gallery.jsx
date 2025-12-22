// src/components/Gallery.jsx
import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import "./Gallery.css";

export default function Gallery() {
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchImages();

    // 🔴 Realtime Subscription: Listens for new rows in 'gallery_events'
    const channel = supabase
      .channel('gallery-updates')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'gallery_events' },
        (payload) => {
          setImages((prevImages) => [payload.new, ...prevImages]);
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

  return (
    <>
      <section className="gallery-section">
        <div className="gallery-header">
          <h2 className="gallery-title">Live Gallery</h2>
          <div className="gallery-subtitle">Moments from Algon Developer Community</div>
        </div>
        <div className="gallery-grid">
          {images.map((item, index) => (
            <div 
              className="gallery-card" 
              key={item.id}
              onClick={() => setSelectedImage(item)}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="gallery-image-wrapper">
                <img src={item.image_url} alt="Gallery Event" loading="lazy" />
                <div className="gallery-shine"></div>
              </div>
              <div className="gallery-overlay">
                <div className="overlay-content">
                  <p className="gallery-quote">{item.quote || "Algon Developer Community"}</p>
                  <span className="view-more">View Full Size</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {selectedImage && (
        <div className="lightbox" onClick={() => setSelectedImage(null)}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
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
          </div>
        </div>
      )}
    </>
  );
}
import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import "./Gallery.css";

export default function Gallery() {
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    loadImages();
  }, []);

  async function loadImages() {
    // 1️⃣ Get list of files from Supabase
    const { data, error } = await supabase.storage
      .from("gallery")
      .list("public");

    if (error) {
      console.error("List error:", error);
      return;
    }

    // 2️⃣ Convert files to public URLs
    const urls = data.map(file => {
      const { data: urlData } = supabase.storage
        .from("gallery")
        .getPublicUrl(`public/${file.name}`);

      return {
        src: urlData.publicUrl,
        quote: "ALGON DC · GCEK"
      };
    });

    // 3️⃣ Update state → React re-renders
    setImages(urls);
  }

  return (
    <>
      <section className="gallery-section">
        <h2>Gallery</h2>

        <div className="gallery-grid">
          {images.map((img, index) => (
            <div
              className="gallery-card"
              key={index}
              onClick={() => setSelectedImage(img)}
            >
              <img src={img.src} alt="Gallery" />
            </div>
          ))}
        </div>
      </section>

      {/* Lightbox */}
      {selectedImage && (
        <div className="lightbox" onClick={() => setSelectedImage(null)}>
          <img src={selectedImage.src} alt="Preview" />
        </div>
      )}
    </>
  );
}

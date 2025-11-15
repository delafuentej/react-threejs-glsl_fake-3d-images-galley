import React from "react";

const GalleryWrapper = ({ galleryItems, activeIndex, setActiveIndex }) => {
  return (
    <div className="gallery-wrapper">
      <div className="gallery">
        {galleryItems.map((g, i) => (
          <div
            key={i}
            className={`item ${i === activeIndex ? "active" : ""}`}
            onClick={() => setActiveIndex(i)}
          >
            <img src={g.fake3dImg} alt={g.title} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default GalleryWrapper;

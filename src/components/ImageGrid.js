import React from 'react';

export default function ImageGrid({ images }) {
  return (
    <>
      <style>{`
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 24px;
        }
        .card {
          margin: 0;
          text-align: center;
        }
        .image-wrapper {
          height: 200px;
          overflow: hidden;
        }
        .image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .caption-wrapper {
          display: flex;
          align-items: center; /* vertically center if needed */
          justify-content: center;
          min-height: 1.5em; /* prevents tiny captions from collapsing */
          text-align: center;
          margin: 6px 0;
        }
        .caption {
          font-size: 0.9rem;
        }
      `}</style>
      <div className="grid">
        {images.map((img, i) => (
          <figure key={i} className="card">
            <div className="image-wrapper">
              <img className="image" src={img.src} alt={img.caption} />
            </div>
            <div className="caption-wrapper">
              <figcaption className="caption">{img.caption}</figcaption>
            </div>
          </figure>
        ))}
      </div>
    </>
  );
}

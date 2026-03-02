// OptimizedImage.jsx
import { useState } from "react";
import PropTypes from "prop-types";

const OptimizedImage = ({ src, alt, className = "" }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  if (imageError) {
    return (
      <div 
        className={className}
        style={{
          background: "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#9ca3af",
          fontSize: "0.875rem",
          fontWeight: "500",
        }}
      >
        <div style={{ textAlign: "center", padding: "1rem" }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📷</div>
          <div>Image not available</div>
        </div>
      </div>
    );
  }

  return (
    <>
      {!imageLoaded && (
        <div
          className={className}
          style={{
            background: "linear-gradient(90deg, #e5e7eb 0%, #f3f4f6 50%, #e5e7eb 100%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.5s infinite linear",
          }}
        />
      )}
      <img
        src={src}
        alt={alt}
        className={className}
        onLoad={handleImageLoad}
        onError={handleImageError}
        loading="lazy"
        style={{
          display: imageLoaded ? "block" : "none",
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
    </>
  );
};

OptimizedImage.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  className: PropTypes.string,
};

export default OptimizedImage;
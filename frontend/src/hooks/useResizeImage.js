import { useState } from "react";

const useResizeImage = (maxWidth = 800, maxHeight = 500) => {
  const [imgSize, setImgSize] = useState({ width: "auto", height: "auto" });

  const handleImageLoad = (e) => {
    const img = e.target;

    if (img.width > maxWidth || img.height > maxHeight) {
      const scaleFactor = Math.min(
        maxWidth / img.width,
        maxHeight / img.height
      );
      setImgSize({
        width: img.width * scaleFactor + "px",
        height: img.height * scaleFactor + "px",
      });
    } else {
      setImgSize({ width: "auto", height: "auto" });
    }
  };

  return { imgSize, handleImageLoad };
};

export default useResizeImage;

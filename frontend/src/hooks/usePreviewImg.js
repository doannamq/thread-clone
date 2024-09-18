import { useState } from "react";
import useShowToast from "./useShowToast";

const usePreviewImg = () => {
  const [imgUrl, setImgUrl] = useState(null);
  const showToast = useShowToast();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();

      reader.onloadend = () => {
        const img = new Image();
        img.src = reader.result;

        img.onload = () => {
          if (img.height > 500) {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            const scaleFactor = 500 / img.height;
            canvas.width = img.width * scaleFactor;
            canvas.height = 500;

            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            setImgUrl(canvas.toDataURL());
          } else {
            setImgUrl(reader.result);
          }
        };
      };

      reader.readAsDataURL(file);
    } else {
      showToast("Invalid type file", "Please select an image file", "error");
      setImgUrl(null);
    }
  };

  return { handleImageChange, imgUrl, setImgUrl };
};

export default usePreviewImg;

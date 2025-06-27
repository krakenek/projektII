import React from "react";

export function ImageUploader({ setImage }) {
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        // Set max width/height
        const maxWidth = 1920;
        const maxHeight = 1080;
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          const scale = Math.min(maxWidth / width, maxHeight / height);
          width = width * scale;
          height = height * scale;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        const resizedDataUrl = canvas.toDataURL("image/jpeg", 0.9);
        setImage(resizedDataUrl);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col items-center">
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="mb-4"
      />
      <p className="text-gray-600">Nahraj svou fotografii pro analýzu</p>
    </div>
  );
}
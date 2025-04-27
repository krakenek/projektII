import React from "react";

export function ImageUploader({ setImage }) {
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result);
    };
    if (file) reader.readAsDataURL(file);
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
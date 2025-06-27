import React, { useState } from "react";
import { ImageUploader } from "./components/ImageUploader";
import { PoseEditor } from "./components/PoseEditor";
import { PoseEditorSide } from "./components/PoseEditorSide";
import { PoseEditorSideFC } from "./components/PoseEditorSideFC";

function App() {
  const [image, setImage] = useState(null);
  const [mode, setMode] = useState(null);
  const [showUploader, setShowUploader] = useState(false);

  // Handler for changing the photo
  const handleChangePhoto = () => {
    setShowUploader(true);
    setMode(null);
  };

  // When a new image is uploaded, hide uploader
  const handleSetImage = (img) => {
    setImage(img);
    setShowUploader(false);
    setMode(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold mb-6">Posture Analysis App</h1>

      {/* Show uploader if no image or user wants to change photo */}
      {(!image || showUploader) && <ImageUploader setImage={handleSetImage} />}

      {/* Buttons always on top when image is uploaded and not changing photo */}
      {image && !showUploader && (
        <div className="flex gap-4 mb-6">
          <button
            className={`px-6 py-3 bg-blue-600 text-white text-lg rounded hover:bg-blue-700 ${mode === "frontBack" ? "ring-4 ring-blue-300" : ""}`}
            onClick={() => setMode("frontBack")}
          >
            Front/Back
          </button>
          <button
            className={`px-6 py-3 bg-blue-600 text-white text-lg rounded hover:bg-blue-700 ${mode === "side" ? "ring-4 ring-blue-300" : ""}`}
            onClick={() => setMode("side")}
          >
            Side
          </button>
          <button
            className={`px-6 py-3 bg-blue-600 text-white text-lg rounded hover:bg-blue-700 ${mode === "sideFC" ? "ring-4 ring-blue-300" : ""}`}
            onClick={() => setMode("sideFC")}
          >
            SideFC
          </button>
          <button
            className="px-6 py-3 bg-gray-500 text-white text-lg rounded hover:bg-gray-600"
            onClick={handleChangePhoto}
          >
            Change Photo
          </button>
        </div>
      )}

      {/* Image preview only before selecting a mode and not changing photo */}
      {image && !mode && !showUploader && (
        <div className="w-full max-w-[600px] mx-auto my-4 border rounded overflow-hidden bg-white">
          <div className="w-full h-[300px] flex justify-center items-center overflow-hidden">
            <img
              src={image}
              alt="Uploaded"
              className="h-full w-auto object-contain"
            />
          </div>
        </div>
      )}

      {/* Render editor based on selected mode */}
      {mode === "frontBack" && !showUploader && <PoseEditor image={image} />}
      {mode === "side" && !showUploader && <PoseEditorSide image={image} />}
      {mode === "sideFC" && !showUploader && <PoseEditorSideFC image={image} />}
    </div>
  );
}

export default App;

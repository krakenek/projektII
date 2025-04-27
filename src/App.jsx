import React, { useState } from "react";
import { ImageUploader } from "./components/ImageUploader";
import { PoseEditor } from "./components/PoseEditor";

function App() {
  const [image, setImage] = useState(null);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold mb-6">Posture Analysis App</h1>
      {!image ? (
        <ImageUploader setImage={setImage} />
      ) : (
        <PoseEditor image={image} />
      )}
    </div>
  );
}

export default App;

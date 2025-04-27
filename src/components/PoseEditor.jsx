import React, { useEffect, useState } from "react";
import * as poseDetection from "@tensorflow-models/pose-detection";
import "@tensorflow/tfjs-backend-webgl";
import * as tf from "@tensorflow/tfjs";
import { Stage, Layer, Image as KonvaImage, Circle, Line } from "react-konva";

export function PoseEditor({ image }) {
  const [imgElement, setImgElement] = useState(null);
  const [keypoints, setKeypoints] = useState([]);
  const [centerShoulders, setCenterShoulders] = useState({ x: 0, y: 0 });
  const [centerHips, setCenterHips] = useState({ x: 0, y: 0 });
  const [centerFeet, setCenterFeet] = useState({ x: 0, y: 0 });
  const [userPositions, setUserPositions] = useState({
    shoulders: null,
    hips: null,
    feet: null,
  });

  // Načítání obrázku
  useEffect(() => {
    const loadImage = () => {
      const img = new window.Image();
      img.src = image;
      img.onload = () => {
        console.log("✅ Obrázek načten");
        setImgElement(img);
      };
      img.onerror = (err) => {
        console.error("❌ Chyba při načítání obrázku:", err);
      };
    };
    loadImage();
  }, [image]);

  // Detekce póz
  useEffect(() => {
    if (!imgElement) return;

    const detectPose = async () => {
      try {
        await tf.ready();
        await tf.setBackend('webgl');

        const detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet);
        console.log("✅ Detektor načten");

        const poses = await detector.estimatePoses(imgElement);
        console.log("✅ Detekováno:", poses);

        if (poses.length > 0) {
          setKeypoints(poses[0].keypoints);
        } else {
          console.warn("⚠️ Nebyly detekovány žádné pózy");
        }
      } catch (error) {
        console.error("❌ Chyba při detekci:", error);
      }
    };

    detectPose();
  }, [imgElement]);

  // Funkce pro dragování bodů
  const handleDragMove = (e, part) => {
    const newPos = { x: e.target.x(), y: e.target.y() };
    setUserPositions((prev) => ({
      ...prev,
      [part]: newPos,
    }));
  };

  const getCenter = (pointA, pointB, factorY = 1) => {
    if (!pointA || !pointB || typeof pointA.x === 'undefined' || typeof pointB.x === 'undefined') {
      console.warn('⚠️ Jeden nebo oba body jsou neplatné: ', pointA, pointB);
      return { x: 0, y: 0 };
    }
    return {
      x: (pointA.x + pointB.x) / 2,
      y: (pointA.y + pointB.y) / 2 * factorY,
    };
  };

  // Získání klíčových bodů
  const leftShoulder = keypoints[5] || { x: 0, y: 0 };
  const rightShoulder = keypoints[6] || { x: 0, y: 0 };
  const leftHip = keypoints[11] || { x: 0, y: 0 };
  const rightHip = keypoints[12] || { x: 0, y: 0 };
  const leftFoot = keypoints[15] || { x: 0, y: 0 };
  const rightFoot = keypoints[16] || { x: 0, y: 0 };

  // Výpočet středů
  const calculatedCenterShoulders = getCenter(leftShoulder, rightShoulder, 0.91);
  const calculatedCenterHips = getCenter(leftHip, rightHip, 0.95);
  const calculatedCenterFeet = getCenter(leftFoot, rightFoot, 1);

  // Aktualizace středů pouze tehdy, když se změní
  useEffect(() => {
    if (
      calculatedCenterShoulders.x !== centerShoulders.x ||
      calculatedCenterShoulders.y !== centerShoulders.y
    ) {
      setCenterShoulders(calculatedCenterShoulders);
    }

    if (
      calculatedCenterHips.x !== centerHips.x ||
      calculatedCenterHips.y !== centerHips.y
    ) {
      setCenterHips(calculatedCenterHips);
    }

    if (
      calculatedCenterFeet.x !== centerFeet.x ||
      calculatedCenterFeet.y !== centerFeet.y
    ) {
      setCenterFeet(calculatedCenterFeet);
    }
  }, [
    calculatedCenterShoulders,
    calculatedCenterHips,
    calculatedCenterFeet,
    centerShoulders,
    centerHips,
    centerFeet,
  ]);

  // Použití uživatelských pozic pro vykreslování
  const finalShoulders = userPositions.shoulders || centerShoulders;
  const finalHips = userPositions.hips || centerHips;
  const finalFeet = userPositions.feet || centerFeet;

  if (!imgElement) {
    console.log("⏳ Čekám na načítání obrázku...");
    return <div>Načítání obrázku...</div>;
  }

  return (
    <div className="w-full max-w-5xl">
      <Stage width={imgElement.width} height={imgElement.height}>
        <Layer>
          <KonvaImage image={imgElement} />
          {/* Vykreslení čar mezi body */}
          <Line
            points={[finalShoulders.x, finalShoulders.y, finalHips.x, finalHips.y]}
            stroke="blue"
            strokeWidth={2}
            lineCap="round"
            lineJoin="round"
          />
          <Line
            points={[finalHips.x, finalHips.y, finalFeet.x, finalFeet.y]}
            stroke="green"
            strokeWidth={2}
            lineCap="round"
            lineJoin="round"
          />
          {/* Vykreslení center body parts */}
          <Circle
            x={finalShoulders.x}
            y={finalShoulders.y}
            radius={10}
            fill="blue"
            draggable
            onDragMove={(e) => handleDragMove(e, 'shoulders')}
          />
          <Circle
            x={finalHips.x}
            y={finalHips.y}
            radius={10}
            fill="green"
            draggable
            onDragMove={(e) => handleDragMove(e, 'hips')}
          />
          <Circle
            x={finalFeet.x}
            y={finalFeet.y}
            radius={10}
            fill="purple"
            draggable
            onDragMove={(e) => handleDragMove(e, 'feet')}
          />
        </Layer>
      </Stage>
    </div>
  );
}

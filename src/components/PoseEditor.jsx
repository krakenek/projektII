import React, { useEffect, useState, useMemo } from "react";
import * as poseDetection from "@tensorflow-models/pose-detection";
import "@tensorflow/tfjs-backend-webgl";
import * as tf from "@tensorflow/tfjs";
import { Stage, Layer, Image as KonvaImage, Circle, Line, Text as KonvaText } from "react-konva";
import { calculateAngle } from "../utils/mathUtils";

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

  // Load image
  useEffect(() => {
  const img = new window.Image();
  img.crossOrigin = "anonymous";
  img.src = image;
  img.onload = () => setImgElement(img);
  img.onerror = (err) => console.error("Image load error:", err);

  return () => {
    img.onload = null;
    img.onerror = null;
  };
}, [image]);


  // Detect pose
  useEffect(() => {
  if (!imgElement) return;

  let isMounted = true;
  let detector;

  const detectPose = async () => {
    await tf.ready();
    await tf.setBackend("webgl");
    detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet);

    if (!isMounted) return; // prevent setting state if unmounted
    const poses = await detector.estimatePoses(imgElement);
    if (poses.length > 0) setKeypoints(poses[0].keypoints);
  };

  detectPose();

  return () => {
    isMounted = false;
    if (detector && detector.dispose) {
      detector.dispose();
    }
  };
  }, [imgElement]);

  // Center calculation
  const getCenter = (a, b, fy = 1) =>
    (!a || !b || a.x === undefined || b.x === undefined)
      ? { x: 0, y: 0 }
      : { x: (a.x + b.x) / 2, y: ((a.y + b.y) / 2) * fy };

  // Keypoints
  const leftShoulder = keypoints[5] || { x: 0, y: 0 };
  const rightShoulder = keypoints[6] || { x: 0, y: 0 };
  const leftHip = keypoints[11] || { x: 0, y: 0 };
  const rightHip = keypoints[12] || { x: 0, y: 0 };
  const leftFoot = keypoints[15] || { x: 0, y: 0 };
  const rightFoot = keypoints[16] || { x: 0, y: 0 };

  // Centers
  const calculatedCenterShoulders = getCenter(leftShoulder, rightShoulder, 0.84);
  const calculatedCenterHips = getCenter(leftHip, rightHip, 0.91);
  const calculatedCenterFeet = getCenter(leftFoot, rightFoot, 1.04);

  // Update centers
  useEffect(() => {
    if (
      calculatedCenterShoulders.x !== centerShoulders.x ||
      calculatedCenterShoulders.y !== centerShoulders.y
    ) setCenterShoulders(calculatedCenterShoulders);
    if (
      calculatedCenterHips.x !== centerHips.x ||
      calculatedCenterHips.y !== centerHips.y
    ) setCenterHips(calculatedCenterHips);
    if (
      calculatedCenterFeet.x !== centerFeet.x ||
      calculatedCenterFeet.y !== centerFeet.y
    ) setCenterFeet(calculatedCenterFeet);
  }, [
    calculatedCenterShoulders, calculatedCenterHips, calculatedCenterFeet,
    centerShoulders, centerHips, centerFeet,
  ]);

  // Drag handler
  const handleDragMove = (e, part) => {
    const newPos = { x: e.target.x(), y: e.target.y() };
    setUserPositions((prev) => ({ ...prev, [part]: newPos }));
  };

  // Final positions
  const finalShoulders = userPositions.shoulders || centerShoulders;
  const finalHips = userPositions.hips || centerHips;
  const finalFeet = userPositions.feet || centerFeet;

  // Angle
  const angle = useMemo(() => {
  if (!finalShoulders || !finalHips || !finalFeet) return 0;
  return calculateAngle(finalShoulders, finalHips, finalFeet);
}, [finalShoulders, finalHips, finalFeet]);


  if (!imgElement) return <div>Načítání obrázku...</div>;

  const scale = imgElement.width / 1200;
  const radius = 5 * scale;
  const fontSize = 24 * scale;

  return (
    <div className="w-full max-w-5xl">
      <Stage width={imgElement.width} height={imgElement.height}>
        <Layer>
          <KonvaImage image={imgElement} />
          {(
            <>
              <KonvaText
                x={finalHips.x + 30}
                y={finalHips.y - 30}
                text={`Úhel: ${angle.toFixed(1)}°`}
                fontSize={fontSize}
                fill="red"
              />
            </>
          )}
          <Line
            points={[finalShoulders.x, finalShoulders.y, finalHips.x, finalHips.y]}
            stroke="blue"
            strokeWidth={4}
            lineCap="round"
            lineJoin="round"
          />
          <Line
            points={[finalHips.x, finalHips.y, finalFeet.x, finalFeet.y]}
            stroke="green"
            strokeWidth={4}
            lineCap="round"
            lineJoin="round"
          />
          <Circle
            x={finalShoulders.x}
            y={finalShoulders.y}
            radius={radius}
            fill="blue"
            draggable
            onDragMove={(e) => handleDragMove(e, "shoulders")}
          />
          <Circle
            x={finalHips.x}
            y={finalHips.y}
            radius={radius}
            fill="green"
            draggable
            onDragMove={(e) => handleDragMove(e, "hips")}
          />
          <Circle
            x={finalFeet.x}
            y={finalFeet.y}
            radius={radius}
            fill="purple"
            draggable
            onDragMove={(e) => handleDragMove(e, "feet")}
          />
        </Layer>
      </Stage>
    </div>
  );
}

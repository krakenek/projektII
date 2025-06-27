import React, { useEffect, useState, useMemo } from "react";
import * as poseDetection from "@tensorflow-models/pose-detection";
import "@tensorflow/tfjs-backend-webgl";
import * as tf from "@tensorflow/tfjs";
import { Stage, Layer, Image as KonvaImage, Circle, Line, Text as KonvaText } from "react-konva";
import { findFCPoint } from "../utils/fcPointCalculator";
import { calculateAngle } from "../utils/mathUtils";
import { detectHeadDirection } from "../utils/headDirection";
import { shiftPointsToBodyEdge } from "../utils/shiftPointsToBodyEdge";

export function PoseEditorSideFC({ image }) {
  const [imgElement, setImgElement] = useState(null);
  const [keypoints, setKeypoints] = useState([]);
  const [centerShoulders, setCenterShoulders] = useState({ x: 0, y: 0 });
  const [centerHips, setCenterHips] = useState({ x: 0, y: 0 });
  const [fcPoint, setFcPoint] = useState({ x: 0, y: 0 });
  const [userPositions, setUserPositions] = useState({
    shoulders: null,
    hips: null,
    FCpoint: null,
  });
  const [alignedPositions, setAlignedPositions] = useState(null);
  const [headDirection, setHeadDirection] = useState("unknown");

  // Load image
  useEffect(() => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = image;
    img.onload = () => setImgElement(img);
    img.onerror = (err) => console.error("Image load error:", err);
  }, [image]);

  // Initialize TensorFlow backend
  useEffect(() => {
    const initializeBackend = async () => {
      await tf.ready();
      await tf.setBackend("webgl");
    };
    initializeBackend();
  }, []);

  // Detect pose
  useEffect(() => {
    if (!imgElement || imgElement.width === 0 || imgElement.height === 0) return;

    const detectPose = async () => {
      try {
        const detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet);
        const poses = await detector.estimatePoses(imgElement);
        if (poses.length > 0) setKeypoints(poses[0].keypoints);
      } catch (error) {
        console.error("Error estimating poses:", error);
      }
    };

    // Debounce pose detection to avoid excessive calls
    const debounceDetectPose = (() => {
      let timeout;
      return () => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          detectPose();
        }, 300); // Adjust debounce delay as needed
      };
    })();

    debounceDetectPose();
  }, [imgElement]);

  //Head direction detection
  useEffect(() => {
      if (!imgElement || keypoints.length === 0) return;
      // Only use nose and shoulders for detectHeadDirection
      const namedKeypoints = {
        nose: keypoints[0],
        leftShoulder: keypoints[5],
        rightShoulder: keypoints[6],
      };
      const direction = detectHeadDirection(namedKeypoints, imgElement.width, imgElement.height);
      setHeadDirection(direction);
      console.log("Detected head direction:", direction);
    }, [imgElement, keypoints]);

  

  // Calculate FC point
  useEffect(() => {
    if (!imgElement || keypoints.length === 0) return;
    const canvas = document.createElement("canvas");
    canvas.width = imgElement.width;
    canvas.height = imgElement.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(imgElement, 0, 0);
    const imageData = ctx.getImageData(0, 0, imgElement.width, imgElement.height);
    const [leftShoulder, rightShoulder, leftHip, rightHip] = [
      keypoints[5], keypoints[6], keypoints[11], keypoints[12]
    ];
    if (leftShoulder && rightShoulder && leftHip && rightHip) {
      setFcPoint(
        findFCPoint(
          leftShoulder, rightShoulder, leftHip, rightHip,
          imgElement.width, imgElement.height, imageData, headDirection
        )
      );
    }
  }, [imgElement, keypoints, headDirection]);

  // Drag handler
  const handleDragMove = (e, part) => {
    const newPos = { x: e.target.x(), y: e.target.y() };
    setUserPositions((prev) => ({ ...prev, [part]: newPos }));
    if (part === "FCpoint") {
      setFcPoint(newPos);
    }
  };

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


  // Centers
  const calculatedCenterShoulders = getCenter(leftShoulder, rightShoulder, 0.91);
  const calculatedCenterHips = getCenter(leftHip, rightHip, 0.95);

  
  

  // Update centers
  useEffect(() => {
    
    if (
    !imgElement ||
    keypoints.length === 0 ||
    headDirection === "unknown"
  ) return;

  const canvas = document.createElement("canvas");
  canvas.width = imgElement.width;
  canvas.height = imgElement.height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(imgElement, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  // Spočítej středy
  const centerShoulders = getCenter(keypoints[5], keypoints[6], 0.91);
  const centerHips = getCenter(keypoints[11], keypoints[12], 0.95);

  // Zarovnej body doleva/doprava
  console.log("Aligning points to body edge...", headDirection);
  const aligned = shiftPointsToBodyEdge(
    imageData,
    [centerShoulders, centerHips, fcPoint],
    headDirection
  );

  setAlignedPositions({
    shoulders: aligned[0],
    hips: aligned[1],
    fcPoint: aligned[2],
  });
  }, [imgElement, keypoints, headDirection]);

  // Final positions
    // Final positions
  const finalShoulders = userPositions.shoulders || alignedPositions?.shoulders || centerShoulders;
  const finalHips = userPositions.hips || alignedPositions?.hips || centerHips;
  const finalFCPoint = userPositions.FCpoint || alignedPositions?.fcPoint || fcPoint;

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

  }, [
    calculatedCenterShoulders, calculatedCenterHips,
    centerShoulders, centerHips,
  ]);

  // Angle
  const angle = useMemo(() => {
    if (!finalFCPoint || !finalShoulders || !finalHips) return 0;
    return calculateAngle(finalShoulders, finalFCPoint, finalHips);
  }, [finalShoulders, finalFCPoint, finalHips]);

  if (!imgElement) return <div>Načítání obrázku...</div>;

  const scale = imgElement.width / 1200;
  const radius = 5 * scale;
  const fontSize = 24 * scale;

  return (
    <div className="w-full max-w-5xl">
      <Stage width={imgElement.width} height={imgElement.height}>
        <Layer>
          <KonvaImage image={imgElement} />
          
          {finalFCPoint && (
            <>
              <Circle
                x={finalFCPoint.x}
                y={finalFCPoint.y}
                radius={radius}
                fill="red"
                draggable
                onDragMove={(e) => handleDragMove(e, "FCpoint")}
              />
              <KonvaText
                x={finalFCPoint.x + 10}
                y={finalFCPoint.y}
                text={`Úhel: ${angle.toFixed(1)}°`}
                fontSize={fontSize}
                fill="red"
              />
            </>
          )}
          <Line
            points={[finalShoulders.x, finalShoulders.y, finalFCPoint.x, finalFCPoint.y]}
            stroke="blue"
            strokeWidth={4}
            lineCap="round"
            lineJoin="round"
          />
          <Line
            points={[finalHips.x, finalHips.y, finalFCPoint.x, finalFCPoint.y]}
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
          
        </Layer>
      </Stage>
    </div>
  );
}

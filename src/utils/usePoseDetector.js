import { useEffect, useState } from "react";
import * as poseDetection from "@tensorflow-models/pose-detection";
import * as tf from "@tensorflow/tfjs";

// usePoseDetector.js
export function usePoseDetector(imageElement) {
  const [keypoints, setKeypoints] = useState([]);

  useEffect(() => {
    if (!imageElement) return;

    const detectPose = async () => {
      await tf.ready();
      await tf.setBackend("webgl");
      const detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet);
      const poses = await detector.estimatePoses(imageElement);
      if (poses.length > 0) setKeypoints(poses[0].keypoints);
    };

    detectPose();
  }, [imageElement]);

  return keypoints;
}

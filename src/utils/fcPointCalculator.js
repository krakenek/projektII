import { distance } from "./mathUtils";

function getPixelBrightness(imageData, x, y) {
  const index = (Math.floor(y) * imageData.width + Math.floor(x)) * 4;
  const r = imageData.data[index];
  const g = imageData.data[index + 1];
  const b = imageData.data[index + 2];
  return (r + g + b) / 3;
}

export function findFCPoint(
  leftShoulder,
  rightShoulder,
  leftHip,
  rightHip,
  width,
  height,
  imageData,
  direction
) {
  const shoulderCenter = {
    x: (leftShoulder.x + rightShoulder.x) / 2,
    y: ((leftShoulder.y + rightShoulder.y) / 2) * 0.91,
  };
  const hipCenter = {
    x: (leftHip.x + rightHip.x) / 2,
    y: ((leftHip.y + rightHip.y) / 2) * 0.95,
  };

  const dx = hipCenter.x - shoulderCenter.x;
  const dy = hipCenter.y - shoulderCenter.y;
  const lengthSquared = dx * dx + dy * dy;
  const unitVector = { x: dx / Math.sqrt(lengthSquared), y: dy / Math.sqrt(lengthSquared) };

  let fcPoint = hipCenter;

  const scanSteps = 1000; // number of steps perpendicularly

  let maxDist = 0;
  let maxPoint = hipCenter;

  // Perpendicular unit vector
  const perpVector = { x: -unitVector.y, y: unitVector.x };

  // Determine scan direction based on 'direction'
  // If looking right, scan only to the left (negative s)
  // If looking left, scan only to the right (positive s)
  let sStart, sEnd;
  if (direction === "left") {
    sStart = -scanSteps / 2;
    sEnd = -1;
  } else if (direction === "right") {
    sStart = 1;
    sEnd = scanSteps / 2;
  } else {
    // Default: scan both directions
    sStart = -scanSteps / 2;
    sEnd = scanSteps / 2;
  }

  const pathLength = Math.sqrt(lengthSquared);

    // Parameters for scanning perpendicular to the center line
  const scanRadius = pathLength * 0.3; // pixels to each side
 
  // Scan along the line from shoulderCenter to hipCenter
  for (let i = 0; i <= pathLength; i += 1) {
    const cx = shoulderCenter.x + unitVector.x * i;
    const cy = shoulderCenter.y + unitVector.y * i;

    // Scan perpendicularly at each point
    for (let s = sStart; s <= sEnd; s++) {
      const px = cx + perpVector.x * (s * scanRadius / (scanSteps / 2));
      const py = cy + perpVector.y * (s * scanRadius / (scanSteps / 2));

      

      if (px < 0 || py < 0 || px >= width || py >= height) continue;

      const brightness = getPixelBrightness(imageData, px, py);

      // Heuristic: consider points that are significantly darker (body) than the center line
      const centerBrightness = getPixelBrightness(imageData, cx, cy);
      if (centerBrightness - brightness > 30) {
        const dist = Math.abs(s * scanRadius / (scanSteps / 2));
        if (dist > maxDist) {
          maxDist = dist;
          maxPoint = { x: px, y: py };
        }
      }
    }
  }

  fcPoint = maxPoint;

  return fcPoint;
}

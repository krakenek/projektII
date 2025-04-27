import { distance } from "./mathUtils";

export function findFCPoint(leftShoulder, rightShoulder, leftHip, rightHip, silhouetteWidth, silhouetteHeight) {
  const centerShoulders = {
    x: (leftShoulder.x + rightShoulder.x) / 2,
    y: (leftShoulder.y + rightShoulder.y) / 2 * 0.8,
  };

  const centerHips = {
    x: (leftHip.x + rightHip.x) / 2,
    y: (leftHip.y + rightHip.y) / 2,
  };

  let slope = (centerHips.y - centerShoulders.y) / (centerHips.x - centerShoulders.x + 1e-6);
  let perpSlope = -1 / slope;

  // Vypočítáme přibližný bod FC od středu kyčlí
  const stepSize = 20;
  let bestPoint = { x: centerHips.x, y: centerHips.y };
  let maxDistance = 0;

  for (let i = 10; i < silhouetteWidth / 2; i += stepSize) {
    const testX = centerHips.x - i + (i * perpSlope);
    const testY = centerHips.y + perpSlope * (-i);

    if (testX >= 0 && testX < silhouetteWidth && testY >= 0 && testY < silhouetteHeight) {
      const dist = distance(centerShoulders, { x: testX, y: testY });
      if (dist > maxDistance) {
        maxDistance = dist;
        bestPoint = { x: testX, y: testY };
      }
    }
  }

  return bestPoint;
}

/**
 * Detekuje směr pohledu (doleva/doprava) podle pozice nosu a jednoho ramene.
 * @param {Object[]} keypoints - Klíčové body z pose detection (nose + jedno rameno)
 * @returns {"left" | "right" | "center" | "unknown"}
 */
export function detectHeadDirection(keypoints) {
  const kpArray = Array.isArray(keypoints) ? keypoints : Object.values(keypoints);
  const nose = kpArray.find((pt) => pt.name === "nose");
  const left = kpArray.find((pt) => pt.name === "left_shoulder");
  const right = kpArray.find((pt) => pt.name === "right_shoulder");

  if (!nose) return "unknown";

  // Zjisti, které rameno vidíme
  const visibleShoulder = left || right;
  if (!visibleShoulder) return "unknown";

  const diff = nose.x - visibleShoulder.x;

  // Heuristika – hodnoty lze doladit dle konkrétní kamery nebo datasetu
  if (diff > 30) return "right";   // Nos vpravo od ramene → kouká doprava (tělo vlevo)
  else if (diff < -30) return "left"; // Nos vlevo → kouká doleva (tělo vpravo)
  else return "center";
}

export function shiftPointsToBodyEdge(imageData, points, direction = "left", threshold = 25) {
  const { width, height, data } = imageData;

  const getBrightness = (x, y) => {
    const i = (y * width + x) * 4;
    const r = data[i], g = data[i + 1], b = data[i + 2];
    return (r + g + b) / 3;
  };

  return points.map((point) => {
    let { x, y } = point;
    x = Math.round(x);
    y = Math.round(y);

    let currentBrightness = getBrightness(x, y);
    let lastX = x;

    if (direction === "right") {
      while (x > 1) {
        const nextX = x - 1;
        const nextBrightness = getBrightness(nextX, y);
        if (Math.abs(nextBrightness - currentBrightness) > threshold) break;
        currentBrightness = nextBrightness;
        lastX = nextX;
        x = nextX;
      }
    } else if (direction === "left") {
      while (x < width - 2) {
        const nextX = x + 1;
        const nextBrightness = getBrightness(nextX, y);
        if (Math.abs(nextBrightness - currentBrightness) > threshold) break;
        currentBrightness = nextBrightness;
        lastX = nextX;
        x = nextX;
      }
    }

    return { x: lastX, y };
  });
}

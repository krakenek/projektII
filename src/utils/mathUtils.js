export function distance(pointA, pointB) {
    const dx = pointA.x - pointB.x;
    const dy = pointA.y - pointB.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
  
  export function calculateAngle(top, mid, bottom) {
    const distB = distance(top, mid);
    const distT = distance(mid, bottom);
    const distM = distance(top, bottom);
  
    let angle = ((distB ** 2) + (distT ** 2) - (distM ** 2)) / (2 * distB * distT);
    angle = Math.acos(angle);
    return (angle * 180) / Math.PI; // převod na stupně
  }
  
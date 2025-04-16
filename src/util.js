export function SceneBounds(scene, camera, renderer, Three) {
  const FOV = (camera.fov * Math.PI) / 180;
  const frustumSize = 2 * Math.tan(camera.fov / 2) * camera.position.z;
  const aspect = renderer.domElement.width / renderer.domElement.height;
  const width = frustumSize * aspect;
  const height = frustumSize;

  const bounds = {
    left: camera.position.x - width / 2,
    right: camera.position.x + width / 2,
    top: camera.position.y + height / 2,
    bottom: camera.position.y - height / 2,
    near: camera.near,
    far: camera.far,
    width: width, // Added width
    height: height, // Added height
  };
  return bounds;
}

export function circularLerp(current, target, ease, max) {
  let diff = target - current;
  if (Math.abs(diff) > max / 2) {
    if (diff > 0) {
      diff -= max;
    } else {
      diff += max;
    }
  }
  if (current < 0) {
    current += max
  }
  if(current >= max){
    current -= max
  }

  const result = current + diff * ease;

  // Truncate to 5 decimal places
  return Math.floor(result * 1e5) / 1e5;
}

export function lerp(start, end, t) {
    return start + (end - start) * t;
  }
  
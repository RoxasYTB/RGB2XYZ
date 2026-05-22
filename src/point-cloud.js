import * as THREE from 'three';

let gaussianTexture = null;

function getGaussianTexture() {
  if (gaussianTexture) return gaussianTexture;
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.25, 'rgba(255,255,255,1)');
  g.addColorStop(0.5, 'rgba(255,255,255,0.75)');
  g.addColorStop(0.75, 'rgba(255,255,255,0.3)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  gaussianTexture = new THREE.CanvasTexture(canvas);
  return gaussianTexture;
}

export function createGaussianSplatCloud(positions, colors, splatSize) {
  const count = positions.length / 3;

  const origPos = new Float32Array(positions);
  const origCol = new Float32Array(colors);
  const indices = new Array(count);
  const dists = new Float32Array(count);
  for (let i = 0; i < count; i++) indices[i] = i;

  const geometry = new THREE.BufferGeometry();
  const posAttr = new THREE.BufferAttribute(positions, 3);
  const colAttr = new THREE.BufferAttribute(colors, 3);
  geometry.setAttribute('position', posAttr);
  geometry.setAttribute('color', colAttr);
  geometry.computeBoundingSphere();

  let lastCam = new THREE.Vector3();

  const material = new THREE.PointsMaterial({
    size: splatSize,
    map: getGaussianTexture(),
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
    depthTest: true,
    blending: THREE.NormalBlending,
    sizeAttenuation: false,
  });

  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;

  points.onBeforeRender = (_r, _s, camera) => {
    const cp = camera.position;
    if (cp.distanceToSquared(lastCam) < 1) return;
    lastCam.copy(cp);

    for (let i = 0; i < count; i++) {
      const dx = origPos[i*3] - cp.x;
      const dy = origPos[i*3+1] - cp.y;
      const dz = origPos[i*3+2] - cp.z;
      dists[i] = dx*dx + dy*dy + dz*dz;
    }

    indices.sort((a, b) => dists[b] - dists[a]);

    const pa = geometry.attributes.position.array;
    const ca = geometry.attributes.color.array;
    for (let i = 0; i < count; i++) {
      const src = indices[i];
      pa[i*3] = origPos[src*3];
      pa[i*3+1] = origPos[src*3+1];
      pa[i*3+2] = origPos[src*3+2];
      ca[i*3] = origCol[src*3];
      ca[i*3+1] = origCol[src*3+1];
      ca[i*3+2] = origCol[src*3+2];
    }
    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.color.needsUpdate = true;
  };

  return points;
}

export function createPointCloud(positions, colors) {
  const geometry = new THREE.BufferGeometry();
  const posAttr = new THREE.BufferAttribute(positions, 3);
  const colAttr = new THREE.BufferAttribute(colors, 3);
  geometry.setAttribute('position', posAttr);
  geometry.setAttribute('color', colAttr);
  geometry.computeBoundingSphere();

  const count = positions.length / 3;
  const pointSize = count > 200_000 ? 1.5 : count > 50_000 ? 2 : 3;

  const material = new THREE.PointsMaterial({
    size: pointSize,
    vertexColors: true,
    sizeAttenuation: false,
    depthWrite: false,
    depthTest: true,
    transparent: true,
    opacity: 0.85,
  });

  return new THREE.Points(geometry, material);
}

export function disposePointCloud(scene, mesh) {
  if (!mesh) return;
  scene.remove(mesh);
  mesh.geometry.dispose();
  mesh.material.dispose();
}

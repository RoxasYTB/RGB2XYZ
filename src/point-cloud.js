import * as THREE from 'three';

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

import * as THREE from 'three';

export function createPointCloud(positions, colors) {
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

      const material = new THREE.PointsMaterial({
            size: 2,
            vertexColors: true,
            sizeAttenuation: false,
            depthWrite: true,
      });

      return new THREE.Points(geometry, material);
}

export function disposePointCloud(scene, mesh) {
      if (!mesh) return;
      scene.remove(mesh);
      mesh.geometry.dispose();
      mesh.material.dispose();
}

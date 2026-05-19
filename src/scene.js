import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export function createScene(container) {
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0a0a0a);

      const camera = new THREE.PerspectiveCamera(
            50,
            container.clientWidth / container.clientHeight,
            1,
            2000
      );
      camera.position.set(400, 350, 400);

      const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(container.clientWidth, container.clientHeight);
      container.appendChild(renderer.domElement);

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.target.set(127.5, 127.5, 127.5);
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.rotateSpeed = 0.8;
      controls.zoomSpeed = 1.2;
      controls.minDistance = 150;
      controls.maxDistance = 900;
      controls.update();

      let needsRender = true;

      function requestRender() {
            needsRender = true;
      }

      controls.addEventListener('change', requestRender);
      window.addEventListener('resize', () => {
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
            requestRender();
      });

      const animate = () => {
            requestAnimationFrame(animate);
            controls.update();
            if (needsRender) {
                  renderer.render(scene, camera);
                  needsRender = false;
            }
      };
      animate();

      return { scene, camera, renderer, controls, requestRender };
}

import * as THREE from 'three';

function makeTextSprite(text, position) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 128;
      canvas.height = 64;

      ctx.fillStyle = 'transparent';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = 'bold 28px monospace';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, canvas.width / 2, canvas.height / 2);

      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;

      const material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            depthTest: false,
      });

      const sprite = new THREE.Sprite(material);
      sprite.position.copy(position);
      sprite.scale.set(40, 20, 1);
      return sprite;
}

function makeAxisLine(from, to, color) {
      const geometry = new THREE.BufferGeometry().setFromPoints([from, to]);
      const material = new THREE.LineBasicMaterial({ color });
      return new THREE.Line(geometry, material);
}

function makeGridLines(group) {
      const material = new THREE.LineBasicMaterial({
            color: 0x333333,
            transparent: true,
            opacity: 0.4,
      });

      const steps = [0, 51, 102, 153, 204, 255];

      for (const v of steps) {
            for (const w of steps) {
                  const g1 = new THREE.BufferGeometry().setFromPoints([
                        new THREE.Vector3(0, v, w),
                        new THREE.Vector3(255, v, w),
                  ]);
                  group.add(new THREE.Line(g1, material));

                  const g2 = new THREE.BufferGeometry().setFromPoints([
                        new THREE.Vector3(v, 0, w),
                        new THREE.Vector3(v, 255, w),
                  ]);
                  group.add(new THREE.Line(g2, material));

                  const g3 = new THREE.BufferGeometry().setFromPoints([
                        new THREE.Vector3(v, w, 0),
                        new THREE.Vector3(v, w, 255),
                  ]);
                  group.add(new THREE.Line(g3, material));
            }
      }
}

function makeTickLabels(group) {
      const ticks = [0, 64, 128, 192, 255];
      const offset = -18;

      for (const v of ticks) {
            group.add(makeTextSprite(String(v), new THREE.Vector3(v, offset, offset)));
            group.add(makeTextSprite(String(v), new THREE.Vector3(offset, v, offset)));
            group.add(makeTextSprite(String(v), new THREE.Vector3(offset, offset, v)));
      }
}

export function createCubeHelper() {
      const group = new THREE.Group();

      const cubeGeo = new THREE.BoxGeometry(255, 255, 255);
      const edges = new THREE.EdgesGeometry(cubeGeo);
      const wireframe = new THREE.LineSegments(
            edges,
            new THREE.LineBasicMaterial({ color: 0x555555, transparent: true, opacity: 0.6 })
      );
      wireframe.position.set(127.5, 127.5, 127.5);
      group.add(wireframe);
      cubeGeo.dispose();

      const axisLength = 280;
      group.add(makeAxisLine(
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(axisLength, 0, 0),
            0xff4444
      ));
      group.add(makeAxisLine(
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, axisLength, 0),
            0x44ff44
      ));
      group.add(makeAxisLine(
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 0, axisLength),
            0x4488ff
      ));

      group.add(makeTextSprite('R', new THREE.Vector3(axisLength + 15, 0, 0)));
      group.add(makeTextSprite('G', new THREE.Vector3(0, axisLength + 15, 0)));
      group.add(makeTextSprite('B', new THREE.Vector3(0, 0, axisLength + 15)));

      makeGridLines(group);
      makeTickLabels(group);

      return group;
}

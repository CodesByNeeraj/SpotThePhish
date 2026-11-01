import { useEffect, useRef } from "react";
import * as THREE from "three";

const HEIGHT = 160;
const WAVE_SEGMENTS = 160;

// Back to front. Fish swim between the layers, so the nearer waves tint them like water would.
const WAVES = [
  { color: "#cfe2fc", opacity: 0.9, base: 104, amp: [7, 3], speed: [0.5, 0.8], length: [260, 130], order: 0 },
  { color: "#8db9f2", opacity: 0.6, base: 82, amp: [8, 3], speed: [0.7, 1.0], length: [320, 150], order: 2 },
  { color: "#0c66e4", opacity: 0.35, base: 52, amp: [6, 2.5], speed: [0.9, 1.3], length: [220, 110], order: 4 },
];

const FISH = [
  { color: "#f6ad55", y: 70, size: 1.0, speed: 38, order: 1 },
  { color: "#ffffff", y: 92, size: 0.8, speed: 26, order: 1 },
  { color: "#ffffff", y: 48, size: 1.2, speed: 44, order: 1 },
  { color: "#fbd38d", y: 66, size: 0.9, speed: 32, order: 3 },
  { color: "#ffffff", y: 30, size: 1.1, speed: 22, order: 3 },
  { color: "#f6ad55", y: 40, size: 0.7, speed: 50, order: 3 },
];

function waveHeight(layer, x, t) {
  const [a1, a2] = layer.amp;
  const [s1, s2] = layer.speed;
  const [l1, l2] = layer.length;
  return (
    layer.base +
    a1 * Math.sin((x / l1) * Math.PI * 2 + t * s1) +
    a2 * Math.sin((x / l2) * Math.PI * 2 - t * s2)
  );
}

function material(color, opacity = 1) {
  return new THREE.MeshBasicMaterial({
    color,
    opacity,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
}

// A strip that fills the area under a wave line. Its width is 1 and is scaled to the screen.
function createWave(layer) {
  const positions = new Float32Array((WAVE_SEGMENTS + 1) * 2 * 3);
  const indices = [];
  for (let i = 0; i < WAVE_SEGMENTS; i++) {
    const a = i * 2;
    indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  const mesh = new THREE.Mesh(geometry, material(layer.color, layer.opacity));
  mesh.renderOrder = layer.order;
  mesh.frustumCulled = false;
  return mesh;
}

function updateWave(mesh, layer, width, t) {
  const positions = mesh.geometry.attributes.position;
  for (let i = 0; i <= WAVE_SEGMENTS; i++) {
    const u = i / WAVE_SEGMENTS;
    positions.setXYZ(i * 2, u, waveHeight(layer, u * width, t), 0);
    positions.setXYZ(i * 2 + 1, u, 0, 0);
  }
  positions.needsUpdate = true;
  mesh.scale.x = width;
}

// A flat fish facing right: a body, an eye and a tail that pivots at the back of the body.
function createFish(config) {
  const group = new THREE.Group();
  const body = new THREE.Shape().absellipse(0, 0, 18, 9, 0, Math.PI * 2);
  const bodyMesh = new THREE.Mesh(new THREE.ShapeGeometry(body, 24), material(config.color));
  const eye = new THREE.Mesh(new THREE.CircleGeometry(1.6, 12), material("#172b4d"));
  eye.position.set(10, 2, 0.1);

  const tailShape = new THREE.Shape();
  tailShape.moveTo(0, 0);
  tailShape.lineTo(-14, 8);
  tailShape.lineTo(-14, -8);
  const tail = new THREE.Mesh(new THREE.ShapeGeometry(tailShape), material(config.color));
  const tailPivot = new THREE.Group();
  tailPivot.position.set(-16, 0, 0);
  tailPivot.add(tail);

  for (const part of [bodyMesh, eye, tail]) part.renderOrder = config.order;
  group.add(bodyMesh, eye, tailPivot);
  group.scale.setScalar(config.size);
  return { group, tailPivot };
}

export default function Ocean() {
  const container = useRef(null);

  useEffect(() => {
    const el = container.current;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(0, 1, HEIGHT, 0, -10, 10);
    let width = 1;

    const waves = WAVES.map((layer) => {
      const mesh = createWave(layer);
      scene.add(mesh);
      return { layer, mesh };
    });

    const fish = FISH.map((config, i) => {
      const { group, tailPivot } = createFish(config);
      const direction = i % 2 === 0 ? 1 : -1;
      group.scale.x *= direction;
      scene.add(group);
      return { config, group, tailPivot, direction, x: Math.random() * 1000, phase: Math.random() * 6 };
    });

    function resize() {
      width = Math.max(el.clientWidth, 1);
      renderer.setSize(width, HEIGHT);
      camera.right = width;
      camera.updateProjectionMatrix();
    }

    function draw(t, dt) {
      for (const { layer, mesh } of waves) updateWave(mesh, layer, width, t);
      for (const f of fish) {
        f.x += f.direction * f.config.speed * dt;
        if (f.x > width + 60) f.x = -60;
        if (f.x < -60) f.x = width + 60;
        f.group.position.set(f.x, f.config.y + Math.sin(t * 0.8 + f.phase) * 5, 0);
        f.tailPivot.rotation.z = Math.sin(t * 6 + f.phase) * 0.45;
      }
      renderer.render(scene, camera);
    }

    const clock = new THREE.Clock();
    resize();
    const observer = new ResizeObserver(() => {
      resize();
      draw(clock.getElapsedTime(), 0);
    });
    observer.observe(el);

    // With reduced motion the scene is drawn once and stays still.
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    let last = 0;
    function loop() {
      const t = clock.getElapsedTime();
      draw(t, t - last);
      last = t;
      frame = requestAnimationFrame(loop);
    }
    if (reduceMotion) draw(0, 0);
    else loop();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      scene.traverse((obj) => {
        obj.geometry?.dispose();
        obj.material?.dispose();
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <div
      ref={container}
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 bottom-0"
      style={{ height: HEIGHT }}
    />
  );
}

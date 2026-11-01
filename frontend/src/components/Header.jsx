import { useEffect, useRef } from "react";
import * as THREE from "three";

const HEIGHT = 64;
const FISH_X = 40;
const BUBBLES = 22;

// A small 3D fish facing right, built from simple shapes.
function createFish() {
  const fish = new THREE.Group();
  const blue = new THREE.MeshStandardMaterial({ color: "#0c66e4", roughness: 0.45, metalness: 0.1 });
  const light = new THREE.MeshStandardMaterial({ color: "#8db9f2", roughness: 0.5 });

  const body = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 20), blue);
  body.scale.set(1.5, 0.8, 0.6);

  // The tail pivots at the back of the body so it can wag.
  const tailPivot = new THREE.Group();
  tailPivot.position.x = -1.3;
  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.7, 1.1, 4), light);
  tail.rotation.z = -Math.PI / 2;
  tail.position.x = -0.55;
  tail.scale.z = 0.25;
  tailPivot.add(tail);

  const fin = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.6, 4), light);
  fin.position.set(0.1, 0.72, 0);
  fin.rotation.z = 0.5;
  fin.scale.z = 0.25;

  const eye = new THREE.Mesh(new THREE.SphereGeometry(0.17, 16, 12), new THREE.MeshStandardMaterial({ color: "#ffffff" }));
  eye.position.set(0.95, 0.2, 0.42);
  const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 10), new THREE.MeshStandardMaterial({ color: "#172b4d" }));
  pupil.position.set(1.04, 0.2, 0.55);

  fish.add(body, tailPivot, fin, eye, pupil);
  fish.scale.setScalar(15);
  return { fish, tailPivot };
}

function createBubbles(width) {
  const geometry = new THREE.CircleGeometry(1, 16);
  const material = new THREE.MeshBasicMaterial({ color: "#8db9f2", opacity: 0.35, transparent: true, depthTest: false });
  return Array.from({ length: BUBBLES }, () => {
    const mesh = new THREE.Mesh(geometry, material);
    const size = 1.5 + Math.random() * 3;
    mesh.scale.setScalar(size);
    return {
      mesh,
      x: Math.random() * width,
      y: Math.random() * HEIGHT,
      speed: 6 + Math.random() * 10,
      phase: Math.random() * 6,
    };
  });
}

function FishCanvas() {
  const container = useRef(null);

  useEffect(() => {
    const el = container.current;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(0, 1, HEIGHT, 0, -100, 100);
    scene.add(new THREE.AmbientLight(0xffffff, 0.9));
    const sun = new THREE.DirectionalLight(0xffffff, 1.6);
    sun.position.set(40, 80, 120);
    scene.add(sun);

    const { fish, tailPivot } = createFish();
    scene.add(fish);

    let width = 1;
    const bubbles = createBubbles(1000);
    bubbles.forEach((b) => scene.add(b.mesh));

    const mouse = { x: FISH_X, y: HEIGHT / 2 };
    const onPointerMove = (e) => {
      const rect = el.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    function resize() {
      width = Math.max(el.clientWidth, 1);
      renderer.setSize(width, HEIGHT);
      camera.right = width;
      camera.updateProjectionMatrix();
    }

    function draw(t, dt) {
      // The fish tilts towards the cursor and sways gently.
      const up = HEIGHT / 2 - mouse.y;
      const targetTilt = THREE.MathUtils.clamp(up / 220, -0.45, 0.45);
      fish.rotation.z += (targetTilt - fish.rotation.z) * 0.08;
      fish.rotation.y = Math.sin(t * 0.9) * 0.35;
      fish.position.set(FISH_X, HEIGHT / 2 + Math.sin(t * 1.5) * 2, 0);
      tailPivot.rotation.y = Math.sin(t * 7) * 0.5;

      for (const b of bubbles) {
        b.y += b.speed * dt;
        if (b.y > HEIGHT + 6) {
          b.y = -6;
          b.x = Math.random() * width;
        }
        b.mesh.position.set(b.x + Math.sin(t + b.phase) * 4, b.y, -1);
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
    if (reduceMotion) {
      draw(0, 0);
    } else {
      window.addEventListener("pointermove", onPointerMove);
      loop();
    }

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onPointerMove);
      observer.disconnect();
      scene.traverse((obj) => {
        obj.geometry?.dispose();
        obj.material?.dispose();
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={container} aria-hidden="true" className="pointer-events-none absolute inset-0" />;
}

export default function Header({ activeCategory }) {
  return (
    <header className="relative h-16 border-b border-line bg-white shadow-[0_1px_0_rgba(9,30,66,0.06)]">
      <FishCanvas />
      <div className="relative flex h-full items-center justify-between pl-[84px] pr-6">
        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold text-ink">SpotThePhish</span>
          <span className="h-5 w-px bg-line" aria-hidden="true" />
          <span className="hidden text-sm text-ink-subtle sm:inline">Phishing Awareness Training Platform</span>
        </div>

        {activeCategory && (
          <div className="flex items-center gap-2 text-sm">
            <span className="hidden text-ink-subtle sm:inline">Current session</span>
            <span className="rounded-ui bg-brand-subtle px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-brand">
              {activeCategory}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}

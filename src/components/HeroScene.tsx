"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Signature hero visual: a wireframe cricket ball with glowing stitched
 * seams, hanging in a floodlit stadium particle field. Reacts to mouse
 * movement with subtle parallax. Replaces the old 2D canvas ParticleField
 * as the hero's centerpiece.
 */
export default function HeroScene() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    /* ── Scene / camera / renderer ─────────────────────────── */
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050914, 0.055);

    const camera = new THREE.PerspectiveCamera(
      42,
      mount.clientWidth / mount.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0.4, 9);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    /* ── Lights ─────────────────────────────────────────────── */
    scene.add(new THREE.AmbientLight(0x2f6fed, 0.55));
    const goldLight = new THREE.PointLight(0xf5b942, 2.2, 20);
    goldLight.position.set(4, 3, 4);
    scene.add(goldLight);
    const cyanLight = new THREE.PointLight(0x35d7ff, 2.6, 20);
    cyanLight.position.set(-4, -2, 5);
    scene.add(cyanLight);

    /* ── The ball (signature element) ──────────────────────── */
    const ballGroup = new THREE.Group();

    const coreGeo = new THREE.IcosahedronGeometry(1.5, 2);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x0a1128,
      metalness: 0.35,
      roughness: 0.45,
      emissive: 0x0d1735,
      emissiveIntensity: 0.6,
    });
    ballGroup.add(new THREE.Mesh(coreGeo, coreMat));

    const wireGeo = new THREE.IcosahedronGeometry(1.53, 2);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x35d7ff,
      wireframe: true,
      transparent: true,
      opacity: 0.22,
    });
    ballGroup.add(new THREE.Mesh(wireGeo, wireMat));

    // Stitched seam rings — the cricket-specific detail
    function makeSeam(tiltX: number, tiltZ: number) {
      const seamGroup = new THREE.Group();
      const curve = new THREE.EllipseCurve(0, 0, 1.56, 1.56, 0, Math.PI * 2);
      const pts = curve.getPoints(120).map((p) => new THREE.Vector3(p.x, p.y, 0));
      const path = new THREE.CatmullRomCurve3(pts, true);
      const tubeGeo = new THREE.TubeGeometry(path, 200, 0.014, 8, true);
      const tubeMat = new THREE.MeshStandardMaterial({
        color: 0xf5b942,
        emissive: 0xf5b942,
        emissiveIntensity: 0.9,
        roughness: 0.3,
      });
      seamGroup.add(new THREE.Mesh(tubeGeo, tubeMat));

      // stitch marks along the seam
      const stitchGeo = new THREE.BoxGeometry(0.05, 0.018, 0.018);
      const stitchMat = new THREE.MeshBasicMaterial({ color: 0xffe6a8 });
      for (let i = 0; i < 40; i++) {
        const t = i / 40;
        const p = path.getPointAt(t);
        const tangent = path.getTangentAt(t);
        const stitch = new THREE.Mesh(stitchGeo, stitchMat);
        stitch.position.copy(p);
        stitch.lookAt(p.clone().add(tangent));
        seamGroup.add(stitch);
      }
      seamGroup.rotation.x = tiltX;
      seamGroup.rotation.z = tiltZ;
      return seamGroup;
    }
    const seamA = makeSeam(0.5, 0.3);
    const seamB = makeSeam(-0.6, 1.9);
    ballGroup.add(seamA, seamB);

    ballGroup.position.set(1.6, 0.2, 0);
    scene.add(ballGroup);

    /* ── Comet trail — like a six being struck ─────────────── */
    const trailCount = 180;
    const trailGeo = new THREE.BufferGeometry();
    const trailPositions = new Float32Array(trailCount * 3);
    for (let i = 0; i < trailCount; i++) {
      const t = i / trailCount;
      const angle = -Math.PI * 0.15 + t * Math.PI * 0.65;
      const radius = 3.4 + t * 3.2;
      trailPositions[i * 3] = 1.6 - Math.cos(angle) * radius * 0.5;
      trailPositions[i * 3 + 1] = -1.2 + Math.sin(angle) * radius * 0.6;
      trailPositions[i * 3 + 2] = -2 - t * 4;
    }
    trailGeo.setAttribute("position", new THREE.BufferAttribute(trailPositions, 3));
    const trailMat = new THREE.PointsMaterial({
      color: 0x7ce8ff,
      size: 0.045,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const trail = new THREE.Points(trailGeo, trailMat);
    scene.add(trail);

    /* ── Ambient stadium-night starfield ────────────────────── */
    const starCount = 260;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPos[i * 3] = (Math.random() - 0.5) * 22;
      starPos[i * 3 + 1] = (Math.random() - 0.5) * 14;
      starPos[i * 3 + 2] = (Math.random() - 0.5) * 18 - 4;
    }
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0x93a0c4,
      size: 0.02,
      transparent: true,
      opacity: 0.5,
    });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    /* ── Floodlight beams ───────────────────────────────────── */
    function makeBeam(x: number, hue: number) {
      const geo = new THREE.ConeGeometry(1.6, 9, 32, 1, true);
      const mat = new THREE.MeshBasicMaterial({
        color: hue,
        transparent: true,
        opacity: 0.05,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const beam = new THREE.Mesh(geo, mat);
      beam.position.set(x, 5.5, -6);
      beam.rotation.x = Math.PI;
      return beam;
    }
    const beamA = makeBeam(-5, 0x35d7ff);
    const beamB = makeBeam(5, 0xf5b942);
    scene.add(beamA, beamB);

    /* ── Interaction state ──────────────────────────────────── */
    const mouse = { x: 0, y: 0 };
    const targetRotation = { x: 0, y: 0 };

    function onMouseMove(e: MouseEvent) {
      const rect = mount!.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    }
    mount.addEventListener("mousemove", onMouseMove);

    /* ── Resize ─────────────────────────────────────────────── */
    function handleResize() {
      if (!mount) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    }
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(mount);

    /* ── Animation loop ─────────────────────────────────────── */
    let frameId = 0;
    const clock = new THREE.Clock();

    function animate() {
      const elapsed = clock.getElapsedTime();

      ballGroup.rotation.y = elapsed * 0.22;
      ballGroup.position.y = 0.2 + Math.sin(elapsed * 0.8) * 0.12;
      seamA.rotation.y -= 0.01;
      seamB.rotation.y += 0.007;

      targetRotation.x += (mouse.y * 0.18 - targetRotation.x) * 0.04;
      targetRotation.y += (mouse.x * 0.22 - targetRotation.y) * 0.04;
      ballGroup.rotation.x = targetRotation.x;

      camera.position.x += (-mouse.x * 0.5 - camera.position.x) * 0.03;
      camera.position.y += (0.4 - mouse.y * 0.3 - camera.position.y) * 0.03;
      camera.lookAt(1.2, 0, 0);

      stars.rotation.y = elapsed * 0.01;
      trail.rotation.z = Math.sin(elapsed * 0.15) * 0.05;

      goldLight.intensity = 2.0 + Math.sin(elapsed * 1.4) * 0.4;
      cyanLight.intensity = 2.4 + Math.cos(elapsed * 1.1) * 0.4;

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    }

    if (prefersReducedMotion) {
      renderer.render(scene, camera);
    } else {
      animate();
    }

    /* ── Cleanup ────────────────────────────────────────────── */
    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      mount.removeEventListener("mousemove", onMouseMove);
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.Points) {
          obj.geometry.dispose();
          const material = obj.material;
          if (Array.isArray(material)) material.forEach((m) => m.dispose());
          else material.dispose();
        }
      });
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  );
}

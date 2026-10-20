import React, { useEffect, useRef } from "react";
import "./CartCanvas3D.css";
import * as THREE from "three";

const CartCanvas3D = ({ size = "normal" }) => {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 320;
    const height = mount.clientHeight || 280;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 4.4);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    mount.appendChild(renderer.domElement);

    // 2. High-End Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2.5);
    dirLight.position.set(4, 5, 4);
    scene.add(dirLight);

    const pointLightCherry = new THREE.PointLight(0xe11d62, 4, 15);
    pointLightCherry.position.set(-3, 2, 2);
    scene.add(pointLightCherry);

    const pointLightGold = new THREE.PointLight(0xf59e0b, 3.5, 15);
    pointLightGold.position.set(3, -1, 3);
    scene.add(pointLightGold);

    // 3. Central Chef Cloche & Platter Group
    const clocheGroup = new THREE.Group();
    clocheGroup.rotation.x = 0.35;
    scene.add(clocheGroup);

    // Platter Base
    const platterGeo = new THREE.CylinderGeometry(1.5, 1.3, 0.1, 64);
    const platterMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.1,
      metalness: 0.1,
      clearcoat: 1.0,
      reflectivity: 0.9,
    });
    const platter = new THREE.Mesh(platterGeo, platterMat);
    platter.position.y = -0.55;
    clocheGroup.add(platter);

    // Platter Gold Rim
    const rimGeo = new THREE.TorusGeometry(1.48, 0.04, 16, 64);
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      metalness: 0.8,
      roughness: 0.2,
    });
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = -0.52;
    clocheGroup.add(rim);

    // Cloche Dome (Hemisphere)
    const domeGeo = new THREE.SphereGeometry(1.2, 48, 32, 0, Math.PI * 2, 0, Math.PI * 0.5);
    const domeMat = new THREE.MeshPhysicalMaterial({
      color: 0xe11d62,
      roughness: 0.15,
      metalness: 0.35,
      clearcoat: 0.9,
      clearcoatRoughness: 0.1,
      reflectivity: 0.8,
      emissive: new THREE.Color(0x881337),
      emissiveIntensity: 0.25,
    });
    const dome = new THREE.Mesh(domeGeo, domeMat);
    dome.position.y = -0.5;
    clocheGroup.add(dome);

    // Golden Cloche Handle Knob
    const handleGeo = new THREE.SphereGeometry(0.18, 32, 32);
    const handleMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      metalness: 0.85,
      roughness: 0.15,
    });
    const handle = new THREE.Mesh(handleGeo, handleMat);
    handle.position.y = 0.72;
    clocheGroup.add(handle);

    // 4. Orbiting Gold Dust Particles
    const pCount = 90;
    const pPos = new Float32Array(pCount * 3);
    const pCols = new Float32Array(pCount * 3);
    const colGold = new THREE.Color(0xfbbf24);
    const colCherry = new THREE.Color(0xe11d62);

    for (let i = 0; i < pCount; i++) {
      const radius = 1.4 + Math.random() * 0.8;
      const angle = Math.random() * Math.PI * 2;
      pPos[i * 3] = Math.cos(angle) * radius;
      pPos[i * 3 + 1] = (Math.random() - 0.5) * 1.2;
      pPos[i * 3 + 2] = Math.sin(angle) * radius;

      const c = Math.random() > 0.5 ? colGold : colCherry;
      pCols[i * 3] = c.r;
      pCols[i * 3 + 1] = c.g;
      pCols[i * 3 + 2] = c.b;
    }

    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
    pGeo.setAttribute("color", new THREE.BufferAttribute(pCols, 3));

    const pMat = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });
    const pPoints = new THREE.Points(pGeo, pMat);
    clocheGroup.add(pPoints);

    // 5. Interactive 360° Drag Rotation Physics
    let isDragging = false;
    let prevMousePos = { x: 0, y: 0 };
    let targetRotationY = 0;
    let targetRotationX = 0.35;
    let autoSpin = 0.007;

    const onMouseDown = (e) => {
      isDragging = true;
      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMousePos.x;
      const deltaY = e.clientY - prevMousePos.y;

      targetRotationY += deltaX * 0.01;
      targetRotationX += deltaY * 0.008;
      targetRotationX = Math.max(0.1, Math.min(0.9, targetRotationX));

      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onTouchStart = (e) => {
      if (e.touches.length === 1) {
        isDragging = true;
        prevMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const onTouchMove = (e) => {
      if (!isDragging || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - prevMousePos.x;
      const deltaY = e.touches[0].clientY - prevMousePos.y;

      targetRotationY += deltaX * 0.012;
      targetRotationX += deltaY * 0.01;
      targetRotationX = Math.max(0.1, Math.min(0.9, targetRotationX));

      prevMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const onTouchEnd = () => {
      isDragging = false;
    };

    const domEl = renderer.domElement;
    domEl.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    domEl.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);

    // 6. Animation Render Loop
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      if (!isDragging) {
        targetRotationY += autoSpin;
      }

      clocheGroup.rotation.y += (targetRotationY - clocheGroup.rotation.y) * 0.08;
      clocheGroup.rotation.x += (targetRotationX - clocheGroup.rotation.x) * 0.08;

      // Pulsing cloche breathing
      const breathe = 1 + Math.sin(elapsed * 2) * 0.015;
      dome.scale.set(breathe, breathe, breathe);

      // Rotate particle dust
      pPoints.rotation.y += 0.006;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mount) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      domEl.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      domEl.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);

      platterGeo.dispose();
      platterMat.dispose();
      rimGeo.dispose();
      rimMat.dispose();
      domeGeo.dispose();
      domeMat.dispose();
      handleGeo.dispose();
      handleMat.dispose();
      pGeo.dispose();
      pMat.dispose();
      renderer.dispose();
      if (domEl.parentNode) {
        domEl.parentNode.removeChild(domEl);
      }
    };
  }, []);

  return (
    <div className={`cart-canvas-3d-wrap ${size}`}>
      <div ref={mountRef} className="cart-three-container" />
      <div className="cart-3d-hint-badge">
        <span className="hint-radar-dot"></span>
        <span>🔄 <b>3D Feast Cloche:</b> Drag to rotate 360°</span>
      </div>
    </div>
  );
};

export default CartCanvas3D;

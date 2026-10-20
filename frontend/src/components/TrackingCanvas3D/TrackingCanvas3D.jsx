import React, { useEffect, useRef } from "react";
import "./TrackingCanvas3D.css";
import * as THREE from "three";

const TrackingCanvas3D = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 340;
    const height = mount.clientHeight || 240;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, 4.4);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    mount.appendChild(renderer.domElement);

    // 2. High-Tech Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const pointLightGreen = new THREE.PointLight(0x22c55e, 4, 15);
    pointLightGreen.position.set(3, 3, 3);
    scene.add(pointLightGreen);

    const pointLightCherry = new THREE.PointLight(0xe11d62, 3, 15);
    pointLightCherry.position.set(-3, -2, 2);
    scene.add(pointLightCherry);

    // 3. Central Radar Group
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // Core Earth/Location Sphere
    const globeGeo = new THREE.SphereGeometry(1.2, 48, 48);
    const globeMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.3,
      metalness: 0.8,
      wireframe: false,
    });
    const globe = new THREE.Mesh(globeGeo, globeMat);
    rootGroup.add(globe);

    // Wireframe Latitude / Longitude Radar Aura
    const wireGeo = new THREE.SphereGeometry(1.23, 24, 24);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x22c55e,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    rootGroup.add(wireMesh);

    // Pulsing GPS Target Beacon Pin
    const beaconGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const beaconMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const beacon = new THREE.Mesh(beaconGeo, beaconMat);
    beacon.position.set(0, 0.85, 0.85);
    rootGroup.add(beacon);

    // Orbiting Route Trajectory Ring
    const ringGeo = new THREE.TorusGeometry(1.65, 0.02, 16, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xfbbf24,
      transparent: true,
      opacity: 0.6,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 3;
    ringMesh.rotation.y = Math.PI / 6;
    rootGroup.add(ringMesh);

    // Orbiting Delivery Courier Drone Satellite
    const droneGroup = new THREE.Group();
    const droneCoreGeo = new THREE.SphereGeometry(0.16, 16, 16);
    const droneCoreMat = new THREE.MeshStandardMaterial({
      color: 0x22c55e,
      emissive: new THREE.Color(0x22c55e),
      emissiveIntensity: 0.6,
    });
    const droneCore = new THREE.Mesh(droneCoreGeo, droneCoreMat);
    droneGroup.add(droneCore);

    // Drone light ring
    const droneRingGeo = new THREE.RingGeometry(0.18, 0.22, 16);
    const droneRingMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
    });
    const droneRing = new THREE.Mesh(droneRingGeo, droneRingMat);
    droneGroup.add(droneRing);
    scene.add(droneGroup);

    // 4. Interactive 360° Drag Rotation Physics
    let isDragging = false;
    let prevMousePos = { x: 0, y: 0 };
    let targetRotationY = 0;
    let targetRotationX = 0;
    let autoSpin = 0.008;

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

    // 5. Animation Render Loop
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      if (!isDragging) {
        targetRotationY += autoSpin;
      }

      rootGroup.rotation.y += (targetRotationY - rootGroup.rotation.y) * 0.08;
      rootGroup.rotation.x += (targetRotationX - rootGroup.rotation.x) * 0.08;

      // Orbiting courier drone path
      const droneAngle = elapsed * 1.2;
      const dx = Math.cos(droneAngle) * 1.7;
      const dz = Math.sin(droneAngle) * 1.7;
      const dy = Math.sin(droneAngle * 2) * 0.4;
      droneGroup.position.set(dx, dy, dz);
      droneGroup.rotation.y += 0.04;

      // Pulse beacon
      const bScale = 1 + Math.sin(elapsed * 6) * 0.3;
      beacon.scale.set(bScale, bScale, bScale);

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

      globeGeo.dispose();
      globeMat.dispose();
      wireGeo.dispose();
      wireMat.dispose();
      beaconGeo.dispose();
      beaconMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      droneCoreGeo.dispose();
      droneCoreMat.dispose();
      scene.remove(droneGroup);
      renderer.dispose();
      if (domEl.parentNode) {
        domEl.parentNode.removeChild(domEl);
      }
    };
  }, []);

  return (
    <div className="tracking-canvas-3d-wrap">
      <div ref={mountRef} className="tracking-three-container" />
      <div className="tracking-3d-hint-badge">
        <span className="tracking-radar-dot"></span>
        <span>🔄 <b>3D GPS Radar:</b> Drag to rotate route beacon 360°</span>
      </div>
    </div>
  );
};

export default TrackingCanvas3D;

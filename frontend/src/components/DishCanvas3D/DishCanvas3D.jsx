import React, { useEffect, useRef } from "react";
import "./DishCanvas3D.css";
import * as THREE from "three";

const DishCanvas3D = ({ imageSrc, dishName, isVeg }) => {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 380;
    const height = mount.clientHeight || 340;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 1.6, 4.2);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    mount.appendChild(renderer.domElement);

    // 2. High-End Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.1);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2.2);
    dirLight.position.set(3, 6, 4);
    scene.add(dirLight);

    const pointLightCherry = new THREE.PointLight(isVeg ? 0x16a34a : 0xe11d62, 3.5, 15);
    pointLightCherry.position.set(-3, 2, 3);
    scene.add(pointLightCherry);

    const pointLightGold = new THREE.PointLight(0xfbbf24, 2.8, 15);
    pointLightGold.position.set(3, -2, 2);
    scene.add(pointLightGold);

    // 3. Central Dish Group
    const dishRoot = new THREE.Group();
    dishRoot.rotation.x = 0.55; // Tilted towards viewer
    scene.add(dishRoot);

    // Ceramic Porcelain Plate Base
    const plateGeo = new THREE.CylinderGeometry(1.45, 1.25, 0.12, 64);
    const plateMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.1,
      metalness: 0.05,
      clearcoat: 1.0,
      clearcoatRoughness: 0.08,
      reflectivity: 0.95,
    });
    const plateMesh = new THREE.Mesh(plateGeo, plateMat);
    plateMesh.position.y = -0.06;
    dishRoot.add(plateMesh);

    // Outer Plate Rim
    const rimGeo = new THREE.TorusGeometry(1.42, 0.05, 16, 64);
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.2,
      metalness: 0.1,
    });
    const rimMesh = new THREE.Mesh(rimGeo, rimMat);
    rimMesh.rotation.x = Math.PI / 2;
    dishRoot.add(rimMesh);

    // Inner Dish Image Texture
    const loader = new THREE.TextureLoader();
    let foodMesh = null;

    if (imageSrc) {
      loader.load(imageSrc, (texture) => {
        texture.generateMipmaps = true;
        const foodGeo = new THREE.CircleGeometry(1.36, 64);
        const foodMat = new THREE.MeshBasicMaterial({
          map: texture,
          side: THREE.DoubleSide,
        });
        foodMesh = new THREE.Mesh(foodGeo, foodMat);
        foodMesh.rotation.x = -Math.PI / 2;
        foodMesh.position.y = 0.008;
        dishRoot.add(foodMesh);
      });
    }

    // 4. Floating Steam / Spice Particles
    const particleCount = 140;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);
    const accentColor = new THREE.Color(isVeg ? 0x22c55e : 0xe11d62);
    const goldColor = new THREE.Color(0xfbbf24);

    for (let i = 0; i < particleCount; i++) {
      const radius = Math.random() * 1.35;
      const angle = Math.random() * Math.PI * 2;
      particlePositions[i * 3] = Math.cos(angle) * radius;
      particlePositions[i * 3 + 1] = Math.random() * 0.9 + 0.1;
      particlePositions[i * 3 + 2] = Math.sin(angle) * radius;

      const col = Math.random() > 0.4 ? goldColor : accentColor;
      particleColors[i * 3] = col.r;
      particleColors[i * 3 + 1] = col.g;
      particleColors[i * 3 + 2] = col.b;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute("color", new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.045,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const steamPoints = new THREE.Points(particleGeo, particleMat);
    dishRoot.add(steamPoints);

    // 5. Interactive 360° Drag Rotation Physics
    let isDragging = false;
    let prevMousePos = { x: 0, y: 0 };
    let targetRotationY = 0;
    let targetRotationX = 0.55;
    let autoSpin = 0.006;

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

      // Bound pitch angle so plate doesn't flip completely upside down
      targetRotationX = Math.max(0.15, Math.min(1.2, targetRotationX));

      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    // Touch support
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
      targetRotationX = Math.max(0.15, Math.min(1.2, targetRotationX));

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

      dishRoot.rotation.y += (targetRotationY - dishRoot.rotation.y) * 0.08;
      dishRoot.rotation.x += (targetRotationX - dishRoot.rotation.x) * 0.08;

      // Gentle floating steam animation
      const posArr = particleGeo.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        posArr[i * 3 + 1] += 0.004;
        if (posArr[i * 3 + 1] > 1.2) {
          posArr[i * 3 + 1] = 0.08;
        }
      }
      particleGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    // Resize
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

      plateGeo.dispose();
      plateMat.dispose();
      rimGeo.dispose();
      rimMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();
      if (domEl.parentNode) {
        domEl.parentNode.removeChild(domEl);
      }
    };
  }, [imageSrc, isVeg]);

  return (
    <div className="dish-canvas-3d-wrap">
      <div ref={mountRef} className="dish-three-container" />
      <div className="dish-3d-hint-badge">
        <span className="hint-radar-dot"></span>
        <span>🔄 <b>Real 3D Dish:</b> Drag with mouse to inspect 360°</span>
      </div>
    </div>
  );
};

export default DishCanvas3D;

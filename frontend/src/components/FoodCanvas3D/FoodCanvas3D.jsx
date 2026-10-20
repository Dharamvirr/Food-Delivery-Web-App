import React, { useEffect, useRef, useState } from "react";
import "./FoodCanvas3D.css";
import * as THREE from "three";
import { foodImagesMap } from "../../assets/assets";

const FoodCanvas3D = () => {
  const mountRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [activePreset, setActivePreset] = useState("all");

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 420;
    const height = mount.clientHeight || 420;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 5.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    mount.appendChild(renderer.domElement);

    // 2. High-End Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const pointLightCherry = new THREE.PointLight(0xe11d62, 5, 20);
    pointLightCherry.position.set(4, 3, 4);
    scene.add(pointLightCherry);

    const pointLightGold = new THREE.PointLight(0xf59e0b, 4, 20);
    pointLightGold.position.set(-4, -2, 3);
    scene.add(pointLightGold);

    const pointLightCyan = new THREE.PointLight(0x38bdf8, 2.5, 15);
    pointLightCyan.position.set(0, 4, -2);
    scene.add(pointLightCyan);

    // 3. Central 3D Group
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // Create a procedural gourmet planet texture
    const textureCanvas = document.createElement("canvas");
    textureCanvas.width = 1024;
    textureCanvas.height = 512;
    const ctx = textureCanvas.getContext("2d");

    // Deep appetizing gourmet gradient
    const grad = ctx.createLinearGradient(0, 0, 1024, 512);
    grad.addColorStop(0, "#1a0b16");
    grad.addColorStop(0.3, "#e11d62");
    grad.addColorStop(0.6, "#f59e0b");
    grad.addColorStop(0.85, "#be123c");
    grad.addColorStop(1, "#0f172a");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 512);

    // Add glowing organic swirl rings
    for (let i = 0; i < 35; i++) {
      ctx.beginPath();
      ctx.arc(
        Math.random() * 1024,
        Math.random() * 512,
        Math.random() * 70 + 20,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.12})`;
      ctx.fill();
    }

    const sphereTexture = new THREE.CanvasTexture(textureCanvas);

    // Central Glossy 3D Food Planet Sphere
    const mainSphereGeo = new THREE.SphereGeometry(1.4, 64, 64);
    const mainSphereMat = new THREE.MeshPhysicalMaterial({
      map: sphereTexture,
      roughness: 0.18,
      metalness: 0.1,
      clearcoat: 0.9,
      clearcoatRoughness: 0.15,
      reflectivity: 0.9,
      emissive: new THREE.Color(0xe11d62),
      emissiveIntensity: 0.15,
    });
    const mainSphere = new THREE.Mesh(mainSphereGeo, mainSphereMat);
    rootGroup.add(mainSphere);

    // Inner Glowing Core (Wireframe Aura)
    const auraGeo = new THREE.SphereGeometry(1.43, 32, 32);
    const auraMat = new THREE.MeshBasicMaterial({
      color: 0xfbbf24,
      wireframe: true,
      transparent: true,
      opacity: 0.22,
    });
    const auraMesh = new THREE.Mesh(auraGeo, auraMat);
    rootGroup.add(auraMesh);

    // 4. Saturn-like 3D Floating Particle Rings
    const ringCount = 650;
    const ringPositions = new Float32Array(ringCount * 3);
    const ringColors = new Float32Array(ringCount * 3);
    const colorCherry = new THREE.Color(0xe11d62);
    const colorGold = new THREE.Color(0xfbbf24);

    for (let i = 0; i < ringCount; i++) {
      const radius = 1.9 + Math.random() * 0.9;
      const angle = (i / ringCount) * Math.PI * 2 + Math.random() * 0.2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = (Math.random() - 0.5) * 0.22;

      ringPositions[i * 3] = x;
      ringPositions[i * 3 + 1] = y;
      ringPositions[i * 3 + 2] = z;

      const mixColor = Math.random() > 0.4 ? colorGold : colorCherry;
      ringColors[i * 3] = mixColor.r;
      ringColors[i * 3 + 1] = mixColor.g;
      ringColors[i * 3 + 2] = mixColor.b;
    }

    const ringGeometry = new THREE.BufferGeometry();
    ringGeometry.setAttribute("position", new THREE.BufferAttribute(ringPositions, 3));
    ringGeometry.setAttribute("color", new THREE.BufferAttribute(ringColors, 3));

    const ringMaterial = new THREE.PointsMaterial({
      size: 0.045,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const ringPoints = new THREE.Points(ringGeometry, ringMaterial);
    ringPoints.rotation.x = Math.PI / 4;
    ringPoints.rotation.z = Math.PI / 6;
    rootGroup.add(ringPoints);

    // 5. Orbiting 3D Spheres (Satellites in 3D Space)
    const orbsData = [
      { radius: 2.1, speed: 1.2, size: 0.18, color: 0xe11d62, tilt: 0.3 },
      { radius: 2.5, speed: 0.85, size: 0.22, color: 0xf59e0b, tilt: -0.4 },
      { radius: 2.3, speed: 1.5, size: 0.15, color: 0x22c55e, tilt: 0.7 },
      { radius: 2.7, speed: 0.65, size: 0.2, color: 0x38bdf8, tilt: -0.2 },
    ];

    const orbs = orbsData.map((data) => {
      const geo = new THREE.SphereGeometry(data.size, 32, 32);
      const mat = new THREE.MeshStandardMaterial({
        color: data.color,
        roughness: 0.1,
        metalness: 0.5,
        emissive: new THREE.Color(data.color),
        emissiveIntensity: 0.4,
      });
      const mesh = new THREE.Mesh(geo, mat);
      scene.add(mesh);
      return { mesh, ...data };
    });

    // 6. Real 3D Ceramic Food Plates Orbiting the Planet
    const loader = new THREE.TextureLoader();
    const foodDishesList = [
      { img: foodImagesMap["food_28.png"], radius: 2.35, speed: 0.85, tilt: 0.25 },
      { img: foodImagesMap["food_25.png"], radius: 2.55, speed: 0.7, tilt: -0.35 },
      { img: foodImagesMap["food_1.png"], radius: 2.4, speed: 1.05, tilt: 0.4 },
      { img: foodImagesMap["food_13.png"], radius: 2.6, speed: 0.75, tilt: -0.2 },
      { img: foodImagesMap["food_7.png"], radius: 2.3, speed: 0.95, tilt: 0.3 },
      { img: foodImagesMap["food_18.png"], radius: 2.45, speed: 0.65, tilt: -0.45 },
    ];
    const orbitingDishObjects = [];

    foodDishesList.forEach((dish, idx) => {
      loader.load(dish.img, (texture) => {
        const dishGroup = new THREE.Group();

        // 1. Ceramic plate base
        const plateGeo = new THREE.CylinderGeometry(0.38, 0.34, 0.04, 32);
        const plateMat = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          roughness: 0.15,
          metalness: 0.1,
        });
        const plateMesh = new THREE.Mesh(plateGeo, plateMat);
        plateMesh.rotation.x = Math.PI / 2;
        dishGroup.add(plateMesh);

        // 2. High-res circular food picture
        const foodGeo = new THREE.CircleGeometry(0.35, 32);
        const foodMat = new THREE.MeshBasicMaterial({
          map: texture,
          side: THREE.DoubleSide,
        });
        const foodMesh = new THREE.Mesh(foodGeo, foodMat);
        foodMesh.position.z = 0.025;
        dishGroup.add(foodMesh);

        // 3. Glowing rim ring
        const rimGeo = new THREE.RingGeometry(0.35, 0.38, 32);
        const rimMat = new THREE.MeshBasicMaterial({
          color: 0xe11d62,
          side: THREE.DoubleSide,
        });
        const rimMesh = new THREE.Mesh(rimGeo, rimMat);
        rimMesh.position.z = 0.026;
        dishGroup.add(rimMesh);

        dishGroup.scale.set(1.15, 1.15, 1.15);
        scene.add(dishGroup);

        orbitingDishObjects.push({
          group: dishGroup,
          radius: dish.radius,
          speed: dish.speed,
          tilt: dish.tilt,
          initialOffset: (idx / foodDishesList.length) * Math.PI * 2,
        });
      });
    });

    // 7. Interactive Click & Drag 360° Rotation Logic
    let isDragging = false;
    let prevMousePos = { x: 0, y: 0 };
    let targetRotationX = 0;
    let targetRotationY = 0;
    let autoSpinSpeed = 0.008;

    const onMouseDown = (e) => {
      isDragging = true;
      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMousePos.x;
      const deltaY = e.clientY - prevMousePos.y;

      targetRotationY += deltaX * 0.008;
      targetRotationX += deltaY * 0.008;

      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    // Touch support for mobile
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

      targetRotationY += deltaX * 0.01;
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

    // 8. Animation Render Loop
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Smooth damped rotation towards user drag target
      if (!isDragging) {
        targetRotationY += autoSpinSpeed;
      }

      rootGroup.rotation.y += (targetRotationY - rootGroup.rotation.y) * 0.08;
      rootGroup.rotation.x += (targetRotationX - rootGroup.rotation.x) * 0.08;

      // Pulse main sphere and aura
      const pulse = 1 + Math.sin(elapsed * 2) * 0.02;
      mainSphere.scale.set(pulse, pulse, pulse);
      auraMesh.scale.set(pulse * 1.02, pulse * 1.02, pulse * 1.02);

      // Rotate particle rings
      ringPoints.rotation.y += 0.005;

      // Update orbiting satellites
      orbs.forEach((orb) => {
        const angle = elapsed * orb.speed;
        const x = Math.cos(angle) * orb.radius;
        const z = Math.sin(angle) * orb.radius;
        const y = Math.sin(angle * 2 + orb.tilt) * 0.55;
        orb.mesh.position.set(x, y, z);
      });

      // Update orbiting real 3D food plates
      orbitingDishObjects.forEach((item) => {
        const angle = elapsed * item.speed + item.initialOffset;
        const x = Math.cos(angle) * item.radius;
        const z = Math.sin(angle) * item.radius;
        const y = Math.sin(angle * 2 + item.tilt) * 0.42;
        item.group.position.set(x, y, z);
        item.group.lookAt(camera.position); // Face camera for appetizing clarity
      });

      // Point light dynamic motion
      pointLightCherry.position.x = Math.sin(elapsed * 1.2) * 4;
      pointLightCherry.position.z = Math.cos(elapsed * 1.2) * 4;

      renderer.render(scene, camera);
    };

    animate();

    // Resize handler
    const handleResize = () => {
      if (!mount) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      domEl.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      domEl.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);

      mainSphereGeo.dispose();
      mainSphereMat.dispose();
      auraGeo.dispose();
      auraMat.dispose();
      ringGeometry.dispose();
      orbitingDishObjects.forEach((item) => {
        scene.remove(item.group);
      });
      renderer.dispose();
      if (domEl.parentNode) {
        domEl.parentNode.removeChild(domEl);
      }
    };
  }, []);

  return (
    <div 
      className="food-canvas-3d-wrapper"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="three-canvas-container" />

      {/* Floating Interactive 3D Status Overlay */}
      <div className="canvas-interactive-overlay">
        <span className="three-control-badge">
          <span className="rotate-3d-icon">🔄</span>
          <span><b>Real 3D WebGL:</b> Drag with mouse to rotate 360°</span>
        </span>
      </div>
    </div>
  );
};

export default FoodCanvas3D;

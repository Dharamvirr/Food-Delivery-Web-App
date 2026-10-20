import React, { useEffect, useRef } from "react";
import "./GlitterParticles.css";

const GlitterParticles = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Luxury warm palette: Gold, Festive Cherry, Champagne, Soft Warm White
    const colors = [
      "rgba(251, 191, 36, ",   // Gold
      "rgba(245, 158, 11, ",   // Amber
      "rgba(225, 29, 98, ",    // Gamesberry Cherry
      "rgba(244, 63, 94, ",    // Rose
      "rgba(254, 240, 138, ",  // Champagne light gold
    ];

    const particleCount = Math.min(55, Math.floor(window.innerWidth / 25));
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2.5 + 1.2,
        baseAlpha: Math.random() * 0.5 + 0.3,
        twinkleSpeed: Math.random() * 0.03 + 0.015,
        twinklePhase: Math.random() * Math.PI * 2,
        speedY: Math.random() * 0.45 + 0.15,
        speedX: (Math.random() - 0.5) * 0.25,
        colorPrefix: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    let time = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      time += 0.02;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Float upwards with gentle horizontal sway
        p.y -= p.speedY;
        p.x += Math.sin(time + p.twinklePhase) * 0.35 + p.speedX;

        // Reset if drifted beyond top or edges
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        // Twinkle pulsating opacity
        const currentAlpha = Math.max(
          0.1,
          p.baseAlpha + Math.sin(time * 3 + p.twinklePhase) * 0.3
        );

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.colorPrefix}${currentAlpha})`;
        ctx.shadowColor = p.colorPrefix.includes("225") ? "#e11d62" : "#fbbf24";
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="glitter-particles-canvas" />;
};

export default GlitterParticles;

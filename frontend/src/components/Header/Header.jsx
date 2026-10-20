import React, { useState } from "react";
import "./Header.css";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { assets } from "../../assets/assets";

const HERO_DISHES = [
  {
    id: "dish-1",
    name: "Truffle Cheese Pasta",
    tagline: "Slow-cooked Italian Herbs & Parmigiano",
    price: "₹280",
    rating: "4.9",
    time: "20 Mins",
    image: assets.food_25,
    accent: "#e11d62",
    badge: "🔥 Chef's Best Pick"
  },
  {
    id: "dish-2",
    name: "Mediterranean Salad Bowl",
    tagline: "Organic Greens, Olive Oil & Greek Feta",
    price: "₹220",
    rating: "4.8",
    time: "15 Mins",
    image: assets.food_1,
    accent: "#16a34a",
    badge: "🌱 100% Farm Fresh"
  },
  {
    id: "dish-3",
    name: "Artisan Sourdough Sandwich",
    tagline: "Aged Cheddar, Smoked Garlic & Crispy Crust",
    price: "₹240",
    rating: "4.9",
    time: "18 Mins",
    image: assets.food_13,
    accent: "#f59e0b",
    badge: "⭐ Top Rated Snack"
  }
];

const Header = () => {
  const [activeDishIndex, setActiveDishIndex] = useState(0);
  const activeDish = HERO_DISHES[activeDishIndex];

  // Mouse tilt tracking with smooth spring physics
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["14deg", "-14deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-16deg", "16deg"]);
  const badgeParallaxX = useTransform(mouseXSpring, [-0.5, 0.5], [-18, 18]);
  const badgeParallaxY = useTransform(mouseYSpring, [-0.5, 0.5], [-18, 18]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const scrollToExplore = () => {
    const el = document.getElementById("explore-menu");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div 
      className="spatial-hero"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Ambient Radial Background Glows */}
      <div className="ambient-glow glow-cherry"></div>
      <div className="ambient-glow glow-gold"></div>

      {/* Grid Mesh Texture Overlay */}
      <div className="hero-grid-mesh"></div>

      <div className="spatial-hero-container">
        {/* Left Column: Visionary Typography & CTAs */}
        <motion.div 
          className="hero-text-col"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Live System Pulse Pill */}
          <div className="hero-status-pill">
            <span className="status-radar-dot"></span>
            <span className="status-text">
              <b>480+ Hot Kitchens Online</b> • Real-time WebSockets
            </span>
          </div>

          <h1 className="hero-headline">
            Crave it. Tap it. <br />
            <span className="gradient-shimmer-text">Savor in 20 Mins.</span>
          </h1>

          <p className="hero-subtext">
            Experience the next era of food delivery. Real-time visual tracking, 
            zero-friction 1-click checkout, and curated chef-crafted dishes delivered piping hot to your doorstep.
          </p>

          <div className="hero-actions-row">
            <motion.button 
              className="hero-cta-primary"
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.96 }}
              onClick={scrollToExplore}
            >
              <span>Explore 3D Menu</span>
              <span className="btn-glow-arrow">➔</span>
            </motion.button>

            <motion.button 
              className="hero-cta-secondary"
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                const bento = document.getElementById("bento-showcase");
                if (bento) bento.scrollIntoView({ behavior: "smooth" });
                else scrollToExplore();
              }}
            >
              <span>⚡ See System Architecture</span>
            </motion.button>
          </div>

          {/* Social Proof Stats Pill */}
          <div className="hero-metrics-strip">
            <div className="metric-cell">
              <span className="metric-val">⚡ 22 Mins</span>
              <span className="metric-lbl">Avg. Delivery</span>
            </div>
            <div className="metric-divider"></div>
            <div className="metric-cell">
              <span className="metric-val">⭐ 4.9 / 5.0</span>
              <span className="metric-lbl">2,400+ Diners</span>
            </div>
            <div className="metric-divider"></div>
            <div className="metric-cell">
              <span className="metric-val">🔒 100% Safe</span>
              <span className="metric-lbl">Stripe & COD</span>
            </div>
          </div>
        </motion.div>

        {/* Right Column: 3D Spatial Canvas & Floating Parallax Elements */}
        <div className="hero-spatial-stage">
          <motion.div 
            className="spatial-stage-rotator"
            style={{
              rotateX,
              rotateY,
              transformStyle: "preserve-3d"
            }}
          >
            {/* 3D Radial Dish Shadow */}
            <div className="spatial-dish-shadow"></div>

            {/* Orbiting Spatial Liquid Glass Badge 1: Live Status */}
            <motion.div 
              className="orbit-glass-pill pill-top-left"
              style={{ x: badgeParallaxX, y: badgeParallaxY }}
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
            >
              <span className="orbit-icon">🛵</span>
              <div>
                <p className="orbit-title">Live Tracking</p>
                <p className="orbit-sub">WebSocket Stream</p>
              </div>
            </motion.div>

            {/* Orbiting Spatial Liquid Glass Badge 2: Offer */}
            <motion.div 
              className="orbit-glass-pill pill-top-right"
              style={{ x: badgeParallaxX, y: badgeParallaxY }}
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
            >
              <span className="orbit-icon">🏷️</span>
              <div>
                <p className="orbit-title">FLAT ₹120 OFF</p>
                <p className="orbit-sub">Use Code: TASTY50</p>
              </div>
            </motion.div>

            {/* Orbiting Spatial Liquid Glass Badge 3: Rating */}
            <motion.div 
              className="orbit-glass-pill pill-bottom-left"
              style={{ x: badgeParallaxX, y: badgeParallaxY }}
              animate={{ y: [0, -7, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
            >
              <span className="orbit-icon">⭐</span>
              <div>
                <p className="orbit-title">{activeDish.rating} Star Food</p>
                <p className="orbit-sub">Verified Foodies</p>
              </div>
            </motion.div>

            {/* Center: The Main 3D Floating Dish with Perspective */}
            <motion.div 
              key={activeDish.id}
              className="spatial-dish-wrapper"
              initial={{ opacity: 0, scale: 0.8, rotate: -8 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              whileHover={{ scale: 1.06 }}
            >
              <img 
                src={activeDish.image} 
                alt={activeDish.name} 
                className="spatial-dish-img"
              />
              <div className="dish-glass-info-pill">
                <span className="dish-pill-badge">{activeDish.badge}</span>
                <p className="dish-pill-name">{activeDish.name}</p>
                <span className="dish-pill-price">{activeDish.price}</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Interactive 3D Dish Selector Pills */}
          <div className="dish-switcher-dock">
            <span className="switcher-label">Select 3D Dish:</span>
            <div className="switcher-chips-row">
              {HERO_DISHES.map((dish, idx) => (
                <button
                  key={dish.id}
                  className={`switcher-chip ${activeDishIndex === idx ? "active" : ""}`}
                  onClick={() => setActiveDishIndex(idx)}
                  title={`Switch to ${dish.name}`}
                >
                  <img src={dish.image} alt={dish.name} className="chip-mini-thumb" />
                  <span className="chip-title">{dish.name.split(" ")[0]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;

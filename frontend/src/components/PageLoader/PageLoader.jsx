import React, { useState, useEffect } from 'react';
import './PageLoader.css';
import { motion, AnimatePresence } from 'framer-motion';

const PageLoader = () => {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [phraseIndex, setPhraseIndex] = useState(0);

  const phrases = [
    "Warming up the ovens & prepping spices...",
    "Handcrafting fresh, artisanal flavors...",
    "Curating the city's finest dishes for you...",
    "Setting your table — Bon Appétit! ✨"
  ];

  useEffect(() => {
    // Smooth progress counter over ~2.2 seconds
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        // Increment smoothly
        const step = Math.floor(Math.random() * 4) + 2;
        const next = Math.min(prev + step, 100);

        // Update phrases based on progress milestones
        if (next >= 75) setPhraseIndex(3);
        else if (next >= 48) setPhraseIndex(2);
        else if (next >= 22) setPhraseIndex(1);

        return next;
      });
    }, 45);

    // Complete curtain lift at 2.45 seconds
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2450);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          className="page-loader-curtain"
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0, 
            scale: 1.04,
            filter: "blur(6px)"
          }}
          transition={{ duration: 0.7, ease: [0.65, 0, 0.35, 1] }}
        >
          {/* Ambient Warm Glow Backdrop */}
          <div className="loader-ambient-glow" />

          <motion.div 
            className="loader-content"
            initial={{ scale: 0.88, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 1.08, opacity: 0, y: -25 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {/* Pulsing Glowing Logo Orb */}
            <div className="loader-logo-wrapper">
              <div className="loader-orbit-ring" />
              <div className="loader-logo-ring">
                <span className="loader-emoji">🍅</span>
              </div>
            </div>

            {/* Brand Title */}
            <h1 className="loader-title">
              Tomato<span className="dot">.</span>
            </h1>

            {/* Dynamic Culinary Tagline */}
            <AnimatePresence mode="wait">
              <motion.p
                key={phraseIndex}
                className="loader-subtitle"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.28 }}
              >
                {phrases[phraseIndex]}
              </motion.p>
            </AnimatePresence>

            {/* Sleek Luminous Progress Bar */}
            <div className="loader-bar-container">
              <div className="loader-bar">
                <motion.div 
                  className="loader-bar-fill"
                  style={{ width: `${progress}%` }}
                  transition={{ ease: "linear" }}
                >
                  <div className="loader-bar-head-glow" />
                </motion.div>
              </div>
              <span className="loader-percent">{progress}%</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PageLoader;

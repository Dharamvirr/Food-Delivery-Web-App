import React, { useState } from 'react';
import './AppDownload.css';
import { assets } from '../../assets/assets';
import { motion } from 'framer-motion';

const AppDownload = () => {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setRotateX(-y * 0.04);
    setRotateY(x * 0.04);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <div className='app-download-spatial-wrap' id='app-download'>
      <div 
        className="app-download-3d-card"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Ambient Gradient Glows */}
        <div className="spatial-glow-blob blob-1"></div>
        <div className="spatial-glow-blob blob-2"></div>

        <div className="app-download-content-row">
          {/* Left Column: Copy & Store Links */}
          <div className="app-download-text-side">
            <span className="app-download-badge">📱 3D Mobile Experience</span>
            <h2>Pocket Gourmet. <br /><span className="text-highlight">Cravings on Demand.</span></h2>
            <p>
              Download the official Tomato app for ultra-fast 1-click checkout, 
              interactive real-time GPS delivery tracking, and exclusive secret chef perks.
            </p>

            <div className="app-features-checklist">
              <div className="check-item">
                <span className="check-icon">✓</span>
                <span>Sub-20 Min Express Dispatch</span>
              </div>
              <div className="check-item">
                <span className="check-icon">✓</span>
                <span>Live Socket.IO Stepper Tracking</span>
              </div>
              <div className="check-item">
                <span className="check-icon">✓</span>
                <span>1-Click Saved Address Auto-Fill</span>
              </div>
            </div>
            
            <div className="app-download-platforms">
              <a href="https://play.google.com" target="_blank" rel="noreferrer" title="Download on Google Play">
                <img src={assets.play_store} alt="Google Play Store" />
              </a>
              <a href="https://apple.com/app-store" target="_blank" rel="noreferrer" title="Download on App Store">
                <img src={assets.app_store} alt="Apple App Store" />
              </a>
            </div>
          </div>

          {/* Right Column: 3D Isometric Phone & Spatial Badges */}
          <div className="app-download-phone-stage">
            <motion.div 
              className="mockup-3d-phone"
              style={{
                transformStyle: 'preserve-3d',
                transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
              }}
            >
              {/* Phone Bezel */}
              <div className="phone-screen-glass">
                <div className="phone-notch"></div>
                <div className="phone-app-header">
                  <span className="app-dot red"></span>
                  <span className="app-dot yellow"></span>
                  <span className="app-dot green"></span>
                  <span className="app-brand-title">Tomato Express</span>
                </div>

                <div className="phone-mock-body">
                  <div className="mock-rider-banner">
                    <span className="rider-scooter">🛵</span>
                    <div>
                      <p className="rider-name">Rider Dharamvir</p>
                      <p className="rider-status">On the way • 4 mins away</p>
                    </div>
                  </div>

                  <div className="mock-order-preview">
                    <div className="mock-item-pill">
                      <span>🍕 Truffle Pizza</span>
                      <b>₹280</b>
                    </div>
                    <div className="mock-item-pill">
                      <span>🥗 Green Salad</span>
                      <b>₹180</b>
                    </div>
                  </div>

                  <div className="mock-live-track-bar">
                    <div className="track-fill"></div>
                  </div>
                </div>
              </div>

              {/* Floating Spatial Badge 1 */}
              <motion.div 
                className="phone-spatial-badge badge-top-right"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <span className="badge-ico">⭐</span>
                <div>
                  <p className="b-title">4.9 / 5.0</p>
                  <p className="b-sub">Verified Foodies</p>
                </div>
              </motion.div>

              {/* Floating Spatial Badge 2 */}
              <motion.div 
                className="phone-spatial-badge badge-bottom-left"
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
              >
                <span className="badge-ico">🏷️</span>
                <div>
                  <p className="b-title">FLAT ₹120 OFF</p>
                  <p className="b-sub">Instant Coupon</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppDownload;

import React, { useState, useEffect } from "react";
import "./BentoShowcase.css";
import { motion } from "framer-motion";

const BentoShowcase = () => {
  // Simulated active node for the WebSockets bento widget
  const [activeStep, setActiveStep] = useState(2);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev >= 4 ? 1 : prev + 1));
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="bento-section" id="bento-showcase">
      <div className="bento-header">
        <span className="bento-eyebrow">⚡ SYSTEM ARCHITECTURE & FEATURES</span>
        <h2 className="bento-title">Engineered for Speed. Built for Foodies.</h2>
        <p className="bento-subtitle">
          Under the hood of this production full-stack MERN platform: WebSockets real-time streaming, 
          1-click checkout, and MongoDB persistent aggregation.
        </p>
      </div>

      <div className="bento-grid-container">
        {/* Card 1: Real-Time WebSockets Engine (Large 2-column card) */}
        <motion.div 
          className="bento-card card-websockets"
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
        >
          <div className="bento-card-glow glow-pink"></div>
          <div className="bento-card-badge">
            <span className="live-dot-green"></span>
            <span>WebSocket WSS Protocol</span>
          </div>

          <h3 className="card-headline">Live Order State Machine</h3>
          <p className="card-desc">
            Replaced heavy HTTP polling with bidirectional <b>Socket.IO</b> channels. 
            When kitchen updates food status, client steppers transition automatically with zero page reloads.
          </p>

          {/* Interactive Live Tracker Mockup Widget */}
          <div className="mini-stepper-widget">
            <div className="mini-stepper-track">
              <div 
                className="mini-stepper-fill" 
                style={{ width: `${((activeStep - 1) / 3) * 100}%` }}
              ></div>
            </div>

            <div className="mini-stepper-nodes">
              <div className={`mini-node ${activeStep >= 1 ? "active" : ""}`}>
                <span className="node-icon">{activeStep >= 1 ? "✓" : "1"}</span>
                <span className="node-label">Confirmed</span>
              </div>
              <div className={`mini-node ${activeStep >= 2 ? "active" : ""}`}>
                <span className="node-icon">🍳</span>
                <span className="node-label">Preparing</span>
              </div>
              <div className={`mini-node ${activeStep >= 3 ? "active" : ""}`}>
                <span className="node-icon">🛵</span>
                <span className="node-label">On The Way</span>
              </div>
              <div className={`mini-node ${activeStep >= 4 ? "active" : ""}`}>
                <span className="node-icon">🏠</span>
                <span className="node-label">Delivered</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Card 2: 1-Click Fast Checkout & Addresses (Medium card) */}
        <motion.div 
          className="bento-card card-checkout"
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
        >
          <div className="bento-card-glow glow-gold"></div>
          <div className="bento-card-badge">
            <span>⚡ 1-Click Express Checkout</span>
          </div>

          <h3 className="card-headline">Embedded Address Caching</h3>
          <p className="card-desc">
            User profile embeds saved delivery addresses directly in MongoDB, eliminating heavy <code>$lookup</code> joins for instant 1-click auto-fill.
          </p>

          <div className="mini-address-chips">
            <div className="bento-chip active">
              <span className="chip-icon">🏠</span>
              <div>
                <p className="chip-label">Home (1-Click)</p>
                <p className="chip-sub">104, Tech Park Blvd</p>
              </div>
            </div>
            <div className="bento-chip">
              <span className="chip-icon">🏢</span>
              <div>
                <p className="chip-label">Office</p>
                <p className="chip-sub">Tower B, Suite 402</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Card 3: Dynamic 5-Star Reviews & Aggregate Score (Medium card) */}
        <motion.div 
          className="bento-card card-reviews"
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
        >
          <div className="bento-card-glow glow-purple"></div>
          <div className="bento-card-badge">
            <span>⭐ Dynamic Aggregation</span>
          </div>

          <h3 className="card-headline">Live Ratings & Reviews</h3>
          <p className="card-desc">
            Real-time score recalculation on every diner review, indexed on <code>foodId</code> with celebratory confetti feedback on submission.
          </p>

          <div className="mini-review-preview">
            <div className="rating-score-box">
              <span className="big-score">4.9</span>
              <div className="stars-row">⭐⭐⭐⭐⭐</div>
              <span className="review-stat">2,480+ Diners</span>
            </div>
            <div className="quote-box">
              <p className="quote-text">"Delivered piping hot in 20 mins. Fresh herbs and perfect cheese pull!"</p>
              <span className="quote-author">Verified Foodie • 2m ago</span>
            </div>
          </div>
        </motion.div>

        {/* Card 4: Sub-50ms Edge Image & Latency (Horizontal banner card) */}
        <motion.div 
          className="bento-card card-latency"
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
        >
          <div className="latency-content">
            <div className="latency-left">
              <div className="latency-metric-badge">
                <span className="latency-number">~18ms</span>
                <span className="latency-unit">Edge Response</span>
              </div>
              <div>
                <h4 className="latency-title">Instant Edge Asset Delivery</h4>
                <p className="latency-desc">
                  Hybrid mapping blends instant 0ms bundled asset delivery with on-demand progressive MongoDB backend pagination.
                </p>
              </div>
            </div>

            <div className="latency-security-tag">
              <span className="lock-icon">🔒</span>
              <span>Stripe 256-bit Encrypted + JWT RBAC Security</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default BentoShowcase;

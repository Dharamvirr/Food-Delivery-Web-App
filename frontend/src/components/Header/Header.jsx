import React from "react";
import "./Header.css";
import { motion } from "framer-motion";

const Header = () => {
  return (
    <div className="header">
      {/* Floating Animated Badges over the vibrant food photo */}
      <motion.div 
        className="floating-badge badge-top-right"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="badge-icon">🍕</span>
        <div>
          <p className="badge-title">Chef's Special</p>
          <p className="badge-sub">Hot & Crispy</p>
        </div>
      </motion.div>

      <motion.div 
        className="floating-badge badge-middle-right"
        animate={{ y: [0, -8, 0], x: [0, 4, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >
        <span className="badge-icon">⭐</span>
        <div>
          <p className="badge-title">4.9 / 5.0</p>
          <p className="badge-sub">15k+ Happy Foodies</p>
        </div>
      </motion.div>

      <motion.div 
        className="floating-badge badge-bottom-right"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      >
        <span className="pulse-dot"></span>
        <div>
          <p className="badge-title">⚡ 25 Mins</p>
          <p className="badge-sub">Superfast Delivery</p>
        </div>
      </motion.div>

      {/* Hero Typography Directly on the Banner (NO awkward card box) */}
      <motion.div 
        className="header-contents"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.85, ease: "easeOut" }}
      >
        <h2>Order your favourite food here</h2>
        <p>
          Choose from a diverse menu featuring a delectable array of dishes crafted with the finest ingredients and culinary expertise. Our mission is to satisfy your cravings and elevate your dining experience, one delicious meal at a time.
        </p>

        <div className="header-btn-group">
          <motion.button 
            className="header-primary-btn" 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => document.getElementById('explore-menu')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Explore Menu ➔
          </motion.button>
          
          <motion.button 
            className="header-secondary-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              const el = document.getElementById('explore-menu');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Today's Specials 🔥
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default Header;

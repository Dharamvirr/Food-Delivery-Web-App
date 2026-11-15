import React from "react";
import "./Header.css";
import { toast } from "react-toastify";

const Header = () => {
  const scrollToExplore = () => {
    const el = document.getElementById("explore-menu");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleCopyCoupon = () => {
    navigator.clipboard?.writeText("TOMATO50");
    toast.success("🎉 Promo code TOMATO50 copied to clipboard!");
  };

  return (
    <section className="hero-section">
      <div className="hero-container">
        {/* Left Column: Clear, Appetizing Value Proposition */}
        <div className="hero-left">
          <div className="hero-live-badge">
            <span className="live-dot-pulse"></span>
            <span><b>480+ Kitchens Online</b> • Express 20-Min Delivery</span>
          </div>

          <h1 className="hero-title">
            Order Your Favourite <br />
            <span className="hero-title-accent">Food Delivered Hot</span>
          </h1>

          <p className="hero-desc">
            Choose from a diverse menu of chef-crafted delicacies made with farm-fresh ingredients. 
            Enjoy lightning-fast doorstep delivery, real-time live tracking, and unbeatable flavors.
          </p>

          <div className="hero-actions">
            <button 
              className="hero-primary-btn"
              onClick={scrollToExplore}
              aria-label="Explore restaurant menu"
            >
              <span>Explore Menu</span>
              <span className="btn-arrow">➔</span>
            </button>

            <button 
              className="hero-coupon-btn"
              onClick={handleCopyCoupon}
              title="Click to copy promo code"
              type="button"
            >
              <span className="coupon-icon">🏷️</span>
              <span>Use Code: <b>TOMATO50</b> for ₹50 OFF</span>
            </button>
          </div>

          {/* Social Proof Strip */}
          <div className="hero-trust-bar">
            <div className="trust-cell">
              <span className="trust-icon">⚡</span>
              <div>
                <p className="trust-val">20-25 Mins</p>
                <p className="trust-lbl">Avg. Delivery</p>
              </div>
            </div>
            <div className="trust-divider"></div>
            <div className="trust-cell">
              <span className="trust-icon">⭐</span>
              <div>
                <p className="trust-val">4.9 / 5.0</p>
                <p className="trust-lbl">2,400+ Diners</p>
              </div>
            </div>
            <div className="trust-divider"></div>
            <div className="trust-cell">
              <span className="trust-icon">🌿</span>
              <div>
                <p className="trust-val">100% Fresh</p>
                <p className="trust-lbl">Farm to Table</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Bright, Vibrant Food Presentation */}
        <div className="hero-right">
          <div className="hero-image-frame">
            <img 
              src="/header_img.png" 
              alt="Mouth-watering Gourmet Dishes" 
              className="hero-food-img"
              loading="eager"
            />
            
            <div className="hero-floating-pill pill-top">
              <span className="pill-emoji">🔥</span>
              <div>
                <p className="pill-title">Chef's Specials</p>
                <p className="pill-sub">Piping Hot & Fresh</p>
              </div>
            </div>

            <div className="hero-floating-pill pill-bottom">
              <span className="pill-emoji">🛵</span>
              <div>
                <p className="pill-title">Free Delivery</p>
                <p className="pill-sub">On orders above ₹400</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Header;

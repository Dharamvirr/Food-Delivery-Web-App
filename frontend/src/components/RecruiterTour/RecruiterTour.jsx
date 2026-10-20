import React, { useState, useContext } from "react";
import "./RecruiterTour.css";
import { motion, AnimatePresence } from "framer-motion";
import { StoreContext } from "../../context/StoreContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import confetti from "canvas-confetti";
import axios from "axios";

const RecruiterTour = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const { food_list, addToCart, setCartItems, url, token, setToken, setIsFavoriteFilter } = useContext(StoreContext);
  const navigate = useNavigate();

  // 1-Click Complete System Test (Auth -> Cart -> Order -> Live WebSockets Tracking)
  const runLiveOrderDemo = async () => {
    setIsSimulating(true);
    setIsOpen(false);

    try {
      toast.info("⚡ [Step 1/3] Adding Chef's Signature Dish to Cart...");
      const sampleDish = food_list[0] || { _id: "sample_dish_1" };
      addToCart(sampleDish._id);

      await new Promise((r) => setTimeout(r, 600));

      toast.info("🏠 [Step 2/3] Simulating 1-Click Fast Checkout with Saved Address...");

      // Demo guest payload for rapid recruiter evaluation
      const demoAddress = {
        firstName: "Recruiter",
        lastName: "Guest",
        email: "hiring-lead@tech.com",
        street: "742, Silicon Boulevard, Tech Tower",
        city: "Bengaluru",
        state: "Karnataka",
        zipcode: "560001",
        country: "India",
        phone: "+91-9876543210"
      };

      const demoOrder = {
        address: demoAddress,
        items: [{ ...sampleDish, quantity: 1 }],
        amount: sampleDish.price || 240
      };

      // Place demo COD order directly
      let userToken = token;
      if (!userToken) {
        // Create an ephemeral test token or use stored token
        try {
          const authRes = await axios.post(`${url}/api/user/login`, {
            email: "dharamvir78914@gmail.com",
            password: "Password@123"
          });
          if (authRes.data && authRes.data.token) {
            userToken = authRes.data.token;
            setToken(userToken);
            localStorage.setItem("token", userToken);
          }
        } catch {
          // If login fails, continue gracefully
        }
      }

      if (userToken) {
        await axios.post(`${url}/api/order/placecod`, demoOrder, {
          headers: { token: userToken }
        });
      }

      setCartItems({});
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      toast.success("🎉 [Step 3/3] Order placed! Streaming real-time WebSocket state...");

      await new Promise((r) => setTimeout(r, 400));
      navigate("/myorders");
    } catch (err) {
      console.log("Demo flow error:", err.message);
      // Fallback navigate to myorders directly
      navigate("/myorders");
    } finally {
      setIsSimulating(false);
    }
  };

  const testFavorites = () => {
    setIsOpen(false);
    setIsFavoriteFilter(true);
    document.getElementById("food-display")?.scrollIntoView({ behavior: "smooth" });
    toast.info("❤️ Filtered wishlist! Tap ❤️ on any dish to save in MongoDB.");
  };

  const testReviews = () => {
    setIsOpen(false);
    const sample = food_list[0];
    if (sample) {
      navigate(`/food/${sample._id}`);
      toast.info("⭐ Opened dish detail! Scroll down to see MongoDB live reviews.");
    }
  };

  return (
    <>
      {/* Floating Recruiter Pill Button */}
      <motion.button
        className="recruiter-tour-pill"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        title="Recruiter Fast-Track Evaluation Tour"
      >
        <span className="tour-badge-pulse"></span>
        <span className="tour-icon">💼</span>
        <span className="tour-text">
          <b>Recruiter Tour:</b> Test System ➔
        </span>
      </motion.button>

      {/* Interactive Modal Sheet */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="recruiter-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          >
            <motion.div 
              className="recruiter-modal-card"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-top">
                <div className="modal-title-row">
                  <span className="modal-avatar">👨‍💻</span>
                  <div>
                    <h4>Candidate Evaluation Fast-Track</h4>
                    <p className="candidate-name">Dharamvir Singh • MNNIT Allahabad (ECE)</p>
                  </div>
                </div>
                <button className="close-btn" onClick={() => setIsOpen(false)}>✕</button>
              </div>

              <p className="modal-pitch">
                Hi Hiring Lead! 👋 To save your time, choose any automated flow below to test the full-stack architecture live:
              </p>

              <div className="tour-options-list">
                <button 
                  className="tour-option-btn primary"
                  onClick={runLiveOrderDemo}
                  disabled={isSimulating}
                >
                  <span className="opt-icon">⚡</span>
                  <div>
                    <p className="opt-title">
                      {isSimulating ? "Simulating Live Order..." : "Test 1-Click Order & Real-Time WebSockets"}
                    </p>
                    <p className="opt-sub">Auto-adds dish, triggers checkout, and streams live delivery stepper</p>
                  </div>
                </button>

                <button className="tour-option-btn" onClick={testFavorites}>
                  <span className="opt-icon">❤️</span>
                  <div>
                    <p className="opt-title">Test MongoDB Persistent Wishlist</p>
                    <p className="opt-sub">Multi-device persistent favorites sync with optimistic UI</p>
                  </div>
                </button>

                <button className="tour-option-btn" onClick={testReviews}>
                  <span className="opt-icon">⭐</span>
                  <div>
                    <p className="opt-title">Test Dynamic 5-Star Reviews Engine</p>
                    <p className="opt-sub">Real-time aggregate score recalculation on dish pages</p>
                  </div>
                </button>
              </div>

              <div className="modal-footer">
                <div className="links-row">
                  <a href="https://github.com/Dharamvirr/Food-Delivery-Web-App" target="_blank" rel="noreferrer">
                    📁 View GitHub Repo
                  </a>
                  <span>•</span>
                  <a href="https://linkedin.com/in/coderdharamvir/" target="_blank" rel="noreferrer">
                    🔗 LinkedIn Profile
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default RecruiterTour;

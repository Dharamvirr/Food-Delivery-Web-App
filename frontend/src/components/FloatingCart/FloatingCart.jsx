import React, { useContext } from 'react';
import './FloatingCart.css';
import { StoreContext } from '../../context/StoreContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const FloatingCart = () => {
  const { cartItems, getTotalCartAmount } = useContext(StoreContext);
  const navigate = useNavigate();
  const location = useLocation();

  const totalItemCount = Object.values(cartItems).reduce((sum, qty) => sum + (qty > 0 ? qty : 0), 0);
  const totalAmount = getTotalCartAmount();

  // Don't show floating bar on Cart or Checkout pages
  if (totalItemCount === 0 || location.pathname === '/cart' || location.pathname === '/order') {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        className="floating-cart-container"
        initial={{ y: 100, x: "-50%", opacity: 0 }}
        animate={{ y: 0, x: "-50%", opacity: 1 }}
        exit={{ y: 100, x: "-50%", opacity: 0 }}
        transition={{ type: 'spring', damping: 24, stiffness: 300 }}
      >
        <div className="floating-cart-pill" onClick={() => navigate('/cart')}>
          <div className="floating-cart-left">
            <span className="floating-cart-icon">🛒</span>
            <div className="floating-cart-info">
              <p className="floating-item-count">
                {totalItemCount} {totalItemCount === 1 ? 'Item' : 'Items'} Added
              </p>
              <p className="floating-total-price">₹{totalAmount}</p>
            </div>
          </div>

          <motion.button 
            className="floating-cart-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>View Cart</span>
            <span className="arrow-icon">➔</span>
          </motion.button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FloatingCart;

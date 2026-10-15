import React, { useContext, useState } from 'react';
import './FoodItem.css';
import { assets, getFoodImageUrl } from '../../assets/assets';
import { StoreContext } from '../../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const FoodItem = ({ id, name, price, description, image }) => {
  const { cartItems, addToCart, removeFromCart, url, favorites, toggleFavorite } = useContext(StoreContext);
  const navigate = useNavigate();

  const isFavorite = favorites && favorites.includes(String(id));

  const imageSrc = getFoodImageUrl(image, url);

  const isVeg =
    name.toLowerCase().includes('veg') ||
    (description && description.toLowerCase().includes('veg')) ||
    name.toLowerCase().includes('salad') ||
    name.toLowerCase().includes('cake') ||
    name.toLowerCase().includes('ice cream');

  const handleCardClick = () => {
    navigate(`/food/${id}`);
  };

  const handleLike = (e) => {
    e.stopPropagation();
    toggleFavorite(id);
  };

  return (
    <motion.div 
      className='food-item' 
      onClick={handleCardClick} 
      title="Click to view details"
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
    >
      <div className='food-item-img-container'>
        <img className='food-item-image' src={imageSrc} alt={name} />
        
        {/* Dietary Indicator */}
        <span className={`food-diet-dot ${isVeg ? 'veg' : 'non-veg'}`}>
          <span className="dot-inner"></span>
        </span>

        {/* Wishlist Heart Icon */}
        <motion.button 
          className={`food-heart-btn ${isFavorite ? 'liked' : ''}`}
          onClick={handleLike}
          whileTap={{ scale: 0.75 }}
          title={isFavorite ? "Remove from favorites" : "Save to favorites"}
        >
          {isFavorite ? "❤️" : "🤍"}
        </motion.button>

        {/* Counter / Add controls */}
        {!cartItems[id] ? (
          <motion.img
            className='add'
            whileTap={{ scale: 0.85 }}
            whileHover={{ scale: 1.1 }}
            onClick={(e) => {
              e.stopPropagation();
              addToCart(id);
            }}
            src={assets.add_icon_white}
            alt="Add to cart"
            title="Add to cart"
          />
        ) : (
          <div className="food-item-counter" onClick={(e) => e.stopPropagation()}>
            <motion.img
              whileTap={{ scale: 0.85 }}
              src={assets.remove_icon_red}
              onClick={(e) => {
                e.stopPropagation();
                removeFromCart(id);
              }}
              alt="Remove"
            />
            <p>{cartItems[id]}</p>
            <motion.img
              whileTap={{ scale: 0.85 }}
              src={assets.add_icon_green}
              onClick={(e) => {
                e.stopPropagation();
                addToCart(id);
              }}
              alt="Add"
            />
          </div>
        )}
      </div>

      <div className="food-item-info">
        <div className="food-item-name-rating">
          <p className="food-name-text">{name}</p>
          <img src={assets.rating_starts} alt="Rating" />
        </div>
        <p className="food-item-desc">{description}</p>
        <div className="food-item-footer">
          <p className="food-item-price">₹{price}</p>
          <span className="view-details-hint">View details →</span>
        </div>
      </div>
    </motion.div>
  );
};

export default FoodItem;

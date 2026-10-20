import React, { useContext, useState } from 'react';
import './FoodItem.css';
import { assets, getFoodImageUrl } from '../../assets/assets';
import { StoreContext } from '../../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const FoodItem = ({ id, name, price, description, image }) => {
  const { cartItems, addToCart, removeFromCart, url, favorites, toggleFavorite } = useContext(StoreContext);
  const navigate = useNavigate();

  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  const isFavorite = favorites && favorites.includes(String(id));

  const imageSrc = getFoodImageUrl(image, url, name);

  const isVeg =
    name.toLowerCase().includes('veg') ||
    (description && description.toLowerCase().includes('veg')) ||
    name.toLowerCase().includes('salad') ||
    name.toLowerCase().includes('cake') ||
    name.toLowerCase().includes('ice cream');

  const handleCardClick = () => {
    navigate(`/food/${id}`);
  };

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xOffset = x - rect.width / 2;
    const yOffset = y - rect.height / 2;
    setRotateX(-yOffset * 0.055);
    setRotateY(xOffset * 0.055);
    setGlare({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.35
    });
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setGlare({ x: 50, y: 50, opacity: 0 });
  };

  const handleLike = (e) => {
    e.stopPropagation();
    e.preventDefault();
    toggleFavorite(id);
  };

  return (
    <div 
      className='food-item' 
      onClick={handleCardClick} 
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      title="Click to view details"
      style={{
        transform: `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
      }}
    >
      <div className='food-item-img-container'>
        <img 
          className='food-item-image' 
          src={imageSrc} 
          alt={name} 
          loading="lazy"
          crossOrigin="anonymous"
          onError={(e) => {
            const fallback = getFoodImageUrl(null, url, name);
            if (e.target.src !== fallback) {
              e.target.src = fallback;
            }
          }}
        />
        
        {/* Dietary Indicator */}
        <span className={`food-diet-dot ${isVeg ? 'veg' : 'non-veg'}`}>
          <span className="dot-inner"></span>
        </span>

        {/* Wishlist Heart Icon */}
        <button 
          className={`food-heart-btn ${isFavorite ? 'liked' : ''}`}
          onClick={handleLike}
          type="button"
          title={isFavorite ? "Remove from favorites" : "Save to favorites"}
          aria-label={isFavorite ? "Remove from favorites" : "Save to favorites"}
        >
          {isFavorite ? "❤️" : "🤍"}
        </button>

        {/* High-Contrast Non-Disappearing Add to Cart & Counter */}
        {!cartItems[id] ? (
          <button
            className='food-add-btn'
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              addToCart(id);
            }}
            title="Add to cart"
            aria-label="Add to cart"
          >
            <span className="add-btn-plus">+</span>
          </button>
        ) : (
          <div 
            className="food-item-counter" 
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
          >
            <button
              className="counter-action-btn minus"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                removeFromCart(id);
              }}
              aria-label="Remove one"
            >
              −
            </button>
            <p className="counter-qty">{cartItems[id]}</p>
            <button
              className="counter-action-btn plus"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                addToCart(id);
              }}
              aria-label="Add one"
            >
              +
            </button>
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
    </div>
  );
};

export default FoodItem;

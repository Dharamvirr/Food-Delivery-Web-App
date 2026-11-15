import React, { useContext } from 'react';
import './FoodItem.css';
import { assets, getFoodImageUrl, isVegetarianDish } from '../../assets/assets';
import { StoreContext } from '../../context/StoreContext';
import { useNavigate } from 'react-router-dom';

const FoodItem = ({ id, name, price, description, image, category }) => {
  const { cartItems, addToCart, removeFromCart, url, favorites, toggleFavorite } = useContext(StoreContext);
  const navigate = useNavigate();

  const isFavorite = favorites && favorites.includes(String(id));
  const imageSrc = getFoodImageUrl(image, url, name);

  const isVeg = isVegetarianDish({ name, description, category });

  const handleCardClick = () => {
    navigate(`/food/${id}`);
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
      title="Click to view details"
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

        {/* Add to Cart & Counter */}
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

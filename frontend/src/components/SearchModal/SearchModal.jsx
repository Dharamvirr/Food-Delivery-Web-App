import React, { useState, useContext, useEffect, useRef } from 'react';
import './SearchModal.css';
import { StoreContext } from '../../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getFoodImageUrl } from '../../assets/assets';

const SearchModal = ({ isOpen, onClose }) => {
  const { food_list, addToCart, cartItems, removeFromCart, url } = useContext(StoreContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [vegOnly, setVegOnly] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 60);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const categories = ['All', 'Salad', 'Rolls', 'Desserts', 'Sandwich', 'Cake', 'Pure Veg', 'Pasta', 'Noodles'];

  const filteredDishes = food_list.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesVeg = !vegOnly || item.category === 'Pure Veg' || item.name.toLowerCase().includes('veg');

    return matchesSearch && matchesCategory && matchesVeg;
  });

  const handleDishClick = (id) => {
    onClose();
    navigate(`/food/${id}`);
  };

  return (
    <AnimatePresence>
      <div className="search-modal-backdrop" onClick={onClose}>
        <motion.div
          className="search-modal-container"
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.92, y: -25 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: -20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        >
          {/* Header Row */}
          <div className="search-modal-header">
            <div className="search-input-wrapper">
              <span className="search-icon-symbol">🔍</span>
              <input
                ref={inputRef}
                type="text"
                placeholder="Search dishes, cuisine, or ingredients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button className="search-clear-btn" onClick={() => setSearchTerm('')}>
                  ✕
                </button>
              )}
            </div>
            <button className="search-close-btn" onClick={onClose} aria-label="Close search">
              ✕
            </button>
          </div>

          {/* Filter Chips - With comfortable separation */}
          <div className="search-filter-section">
            <p className="search-filter-label">Quick Filters:</p>
            <div className="search-filter-chips">
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`search-chip ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
              <button
                className={`search-chip veg-chip ${vegOnly ? 'active' : ''}`}
                onClick={() => setVegOnly(!vegOnly)}
              >
                🌱 Veg Only
              </button>
            </div>
          </div>

          {/* Results List */}
          <div className="search-results-list">
            {filteredDishes.length === 0 ? (
              <div className="search-no-results">
                <span className="no-res-emoji">🍽️</span>
                <p className="no-res-title">No dishes found matching "{searchTerm}"</p>
                <p className="no-res-subtitle">Try searching for Salad, Pasta, Rolls, or Desserts</p>
              </div>
            ) : (
              filteredDishes.map((item, index) => {
                const imageSrc = getFoodImageUrl(item.image, url);

                const isVeg = item.category === 'Pure Veg' || item.name.toLowerCase().includes('veg');

                return (
                  <motion.div
                    key={item._id}
                    className="search-result-card"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index * 0.03, 0.3) }}
                  >
                    <div className="search-card-left" onClick={() => handleDishClick(item._id)}>
                      <div className="search-card-img-wrapper">
                        <img src={imageSrc} alt={item.name} />
                        <span className={`diet-dot ${isVeg ? 'veg' : 'non-veg'}`}></span>
                      </div>
                      <div className="search-card-info">
                        <div className="search-card-title-row">
                          <h4>{item.name}</h4>
                          <span className="search-category-badge">{item.category}</span>
                        </div>
                        <p className="search-card-desc">{item.description}</p>
                        <div className="search-card-meta">
                          <span className="search-card-price">₹{item.price}</span>
                          <span className="search-card-rating">⭐ 4.8</span>
                        </div>
                      </div>
                    </div>

                    <div className="search-card-right">
                      {!cartItems[item._id] ? (
                        <motion.button
                          className="search-add-btn"
                          whileTap={{ scale: 0.88 }}
                          whileHover={{ scale: 1.05 }}
                          onClick={() => addToCart(item._id)}
                        >
                          ADD +
                        </motion.button>
                      ) : (
                        <div className="search-qty-counter">
                          <button onClick={() => removeFromCart(item._id)}>−</button>
                          <span>{cartItems[item._id]}</span>
                          <button onClick={() => addToCart(item._id)}>+</button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SearchModal;

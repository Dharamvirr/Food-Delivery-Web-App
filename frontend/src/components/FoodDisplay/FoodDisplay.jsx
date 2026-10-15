import React, { useContext, useState, useEffect } from 'react';
import './FoodDisplay.css';
import FoodItem from '../FoodItem/FoodItem';
import { StoreContext } from '../../context/StoreContext';
import { motion, AnimatePresence } from 'framer-motion';

const FoodDisplay = ({ category }) => {
  const { food_list, loadingFood, isFetchingMore, fetchMoreFood, favorites, isFavoriteFilter, setIsFavoriteFilter } = useContext(StoreContext);
  const [vegOnly, setVegOnly] = useState(false);
  const [sortBy, setSortBy] = useState('default');
  const [visibleCount, setVisibleCount] = useState(8);

  const handleLoadMore = () => {
    const nextCount = visibleCount + 8;
    setVisibleCount(nextCount);
    const nextPage = Math.floor(visibleCount / 8) + 1;
    if (fetchMoreFood) {
      fetchMoreFood(nextPage, 8);
    }
  };

  // Reset pagination to first batch whenever category, veg filter, favorites filter, or sort changes
  useEffect(() => {
    setVisibleCount(8);
  }, [category, vegOnly, isFavoriteFilter, sortBy]);

  let filteredList = food_list.filter((item) => {
    const matchesCategory = category === 'All' || item.category === category;
    const isVeg = item.category === 'Pure Veg' || item.name.toLowerCase().includes('veg');
    const matchesDiet = !vegOnly || isVeg;
    const matchesFavorite = !isFavoriteFilter || (favorites && favorites.includes(String(item._id)));
    return matchesCategory && matchesDiet && matchesFavorite;
  });

  if (sortBy === 'price-low') {
    filteredList.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-high') {
    filteredList.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'name') {
    filteredList.sort((a, b) => a.name.localeCompare(b.name));
  }

  const displayedList = filteredList.slice(0, visibleCount);
  const hasMore = visibleCount < filteredList.length;
  const loadedCount = Math.min(visibleCount, filteredList.length);
  const progressPercent = filteredList.length > 0 ? Math.round((loadedCount / filteredList.length) * 100) : 0;

  return (
    <div className='food-display' id='food-display'>
      <div className="food-display-header">
        <div>
          <h2>{isFavoriteFilter ? "Your Favorite Dishes ❤️" : "Top Dishes Near You"}</h2>
          <p className="food-display-subtitle">
            Showing {loadedCount} of {filteredList.length} {filteredList.length === 1 ? 'dish' : 'dishes'} {isFavoriteFilter ? 'in your wishlist' : `in ${category === 'All' ? 'All Cuisines' : category}`}
          </p>
        </div>

        {/* Quick Filter Bar */}
        <div className="food-filter-controls">
          <button 
            className={`food-fav-filter-btn ${isFavoriteFilter ? 'active' : ''}`}
            onClick={() => setIsFavoriteFilter(!isFavoriteFilter)}
            title="Show dishes saved to your wishlist"
          >
            {isFavoriteFilter ? "❤️ Favorites Active" : `🤍 Favorites (${favorites ? favorites.length : 0})`}
          </button>

          <button 
            className={`food-veg-filter-btn ${vegOnly ? 'active' : ''}`}
            onClick={() => setVegOnly(!vegOnly)}
          >
            <span className="veg-filter-dot"></span>
            Pure Veg
          </button>

          <select 
            className="food-sort-select" 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="default">Sort: Recommended</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="name">Dish Name (A-Z)</option>
          </select>
        </div>
      </div>

      {loadingFood && food_list.length === 0 ? (
        <div className='food-display-list'>
          {[...Array(8)].map((_, i) => (
            <div key={i} className="food-skeleton-card">
              <div className="skeleton-thumb shimmer"></div>
              <div className="skeleton-body">
                <div className="skeleton-line shimmer title"></div>
                <div className="skeleton-line shimmer text"></div>
                <div className="skeleton-line shimmer price"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredList.length === 0 ? (
        <div className="food-display-empty">
          {isFavoriteFilter ? (
            <p>You haven't saved any favorite dishes yet! Click the ❤️ icon on any dish to save it here for fast ordering.</p>
          ) : (
            <p>No dishes match the selected filter. Try disabling "Pure Veg" or picking another category.</p>
          )}
        </div>
      ) : (
        <>
          <div className='food-display-list'>
            <AnimatePresence>
              {displayedList.map((item) => (
                <FoodItem
                  key={item._id}
                  image={item.image}
                  name={item.name}
                  description={item.description}
                  price={item.price}
                  id={item._id}
                />
              ))}
            </AnimatePresence>
          </div>

          {/* Load More Section */}
          {filteredList.length > 8 && (
            <div className="food-load-more-container">
              <div className="food-load-more-info">
                <span>
                  Showing <b>{loadedCount}</b> of <b>{filteredList.length}</b> dishes
                </span>
                <span className="load-more-percent">{progressPercent}% viewed</span>
              </div>

              <div className="food-load-more-track">
                <div 
                  className="food-load-more-progress" 
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>

              {hasMore ? (
                <motion.button 
                  className="food-load-more-btn"
                  onClick={handleLoadMore}
                  disabled={isFetchingMore}
                  whileHover={{ scale: isFetchingMore ? 1 : 1.03 }}
                  whileTap={{ scale: isFetchingMore ? 1 : 0.97 }}
                >
                  {isFetchingMore ? (
                    <span>Fetching more dishes... 🍳</span>
                  ) : (
                    <>
                      <span>Load More Dishes (+{Math.min(8, filteredList.length - visibleCount)})</span>
                      <span className="btn-arrow">➔</span>
                    </>
                  )}
                </motion.button>
              ) : (
                <div className="food-all-loaded-badge">
                  <span>✨</span> You've explored all {filteredList.length} delicious dishes!
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FoodDisplay;

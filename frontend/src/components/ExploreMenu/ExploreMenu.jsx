import React from 'react';
import './ExploreMenu.css';
import { menu_list } from '../../assets/assets';

const ExploreMenu = ({ category, setCategory }) => {
  return (
    <div className='explore-menu' id='explore-menu'>
      <div className="explore-menu-header">
        <div>
          <h1>Explore Our Curated Menu</h1>
          <p className='explore-menu-text'>
            Choose from a diverse selection of hand-crafted delicacies. Filter by cuisine or cravings below.
          </p>
        </div>

        {category !== "All" && (
          <button className="clear-filter-btn" onClick={() => setCategory("All")}>
            Show All Dishes ✕
          </button>
        )}
      </div>

      <div className="explore-menu-list">
        <div 
          onClick={() => setCategory("All")} 
          className={`explore-menu-list-item ${category === "All" ? "all-active" : ""}`}
        >
          <div className="all-category-circle">🍽️</div>
          <p>All</p>
        </div>

        {menu_list.map((item, index) => {
          return (
            <div 
              onClick={() => setCategory(prev => prev === item.menu_name ? "All" : item.menu_name)} 
              key={index} 
              className='explore-menu-list-item'
            >
              <img 
                src={item.menu_image} 
                className={category === item.menu_name ? "active" : ""} 
                alt={item.menu_name} 
              />
              <p>{item.menu_name}</p>
            </div>
          );
        })}
      </div>
      <hr />
    </div>
  );
};

export default ExploreMenu;
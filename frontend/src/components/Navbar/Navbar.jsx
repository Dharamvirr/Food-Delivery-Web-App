import React, { useState, useContext, useEffect, useRef } from 'react';
import './Navbar.css';
import { assets } from '../../assets/assets.js';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext.jsx';
import SearchModal from '../SearchModal/SearchModal.jsx';
import { ShoppingBag } from 'lucide-react';

const Navbar = ({ setShowLogin }) => {
  const [menu, setMenu] = useState("home");
  const [showSearch, setShowSearch] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const { cartItems, token, setToken, getTotalCartAmount } = useContext(StoreContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const totalItemCount = Object.values(cartItems).reduce((sum, qty) => sum + (qty > 0 ? qty : 0), 0);

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    navigate("/");
  };

  const handleNavClick = (sectionId, menuName) => {
    setMenu(menuName);
    if (sectionId === "home") {
      navigate("/");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 150);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <>
      <SearchModal isOpen={showSearch} onClose={() => setShowSearch(false)} />
      
      <div className='navbar'>
        <Link to='/' onClick={() => setMenu("home")}>
          <img src={assets.logo} alt="Tomato Logo" className="logo" />
        </Link>

        <ul className="navbar-menu">
          <li 
            onClick={() => handleNavClick("home", "home")} 
            className={menu === "home" ? "active" : ""}
          >
            Home
          </li>
          <li 
            onClick={() => handleNavClick("explore-menu", "menu")} 
            className={menu === "menu" ? "active" : ""}
          >
            Menu
          </li>
          <li 
            onClick={() => handleNavClick("app-download", "mobile-app")} 
            className={menu === "mobile-app" ? "active" : ""}
          >
            Mobile App
          </li>
          <li 
            onClick={() => handleNavClick("footer", "contact-us")} 
            className={menu === "contact-us" ? "active" : ""}
          >
            Contact Us
          </li>
        </ul>

        <div className="navbar-right">
          <div 
            className="navbar-search-btn"
            onClick={() => setShowSearch(true)}
            title="Search dishes (Click to open)"
          >
            <img src={assets.search_icon} alt="Search" />
            <span className="search-hint-text">Search...</span>
          </div>

          <Link to='/cart' className="navbar-cart-pill-btn" title="View Cart">
            <div className="cart-icon-wrapper">
              <ShoppingBag size={20} className="navbar-cart-svg" />
              {totalItemCount > 0 && (
                <span className="navbar-cart-badge">{totalItemCount}</span>
              )}
            </div>
            {totalItemCount > 0 && (
              <span className="navbar-cart-total">₹{getTotalCartAmount()}</span>
            )}
          </Link>

          {!token ? (
            <button className="navbar-signin-btn" onClick={() => setShowLogin(true)}>Sign In</button>
          ) : (
            <div 
              ref={profileRef}
              className={`navbar-profile ${isProfileOpen ? 'open' : ''}`}
              onClick={() => setIsProfileOpen((prev) => !prev)}
              title="Account Menu"
            >
              <img src={assets.profile_icon} alt="Profile" />
              <ul className='navbar-profile-dropdown' onClick={(e) => e.stopPropagation()}>
                <li onClick={() => { setIsProfileOpen(false); navigate('/myorders'); }}>
                  <img src={assets.bag_icon} alt="Orders" /> <p>My Orders</p>
                </li>
                <hr />
                <li onClick={() => { setIsProfileOpen(false); logout(); }}>
                  <img src={assets.logout_icon} alt="Logout" /> <p>Logout</p>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;

import React, { useContext, useState } from 'react';
import './Cart.css';
import { StoreContext } from '../../context/StoreContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import confetti from 'canvas-confetti';

const Cart = () => {
  const {
    cartItems,
    food_list,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    url,
    deliveryCharge,
    discount,
    setDiscount
  } = useContext(StoreContext);

  const [promoCode, setPromoCode] = useState('');
  const navigate = useNavigate();

  const handleApplyPromo = (codeToApply) => {
    const code = (codeToApply || promoCode).trim().toUpperCase();
    if (!code) {
      toast.warn('Please enter a promo code');
      return;
    }
    if (getTotalCartAmount() === 0) {
      toast.error('Add items to your cart first!');
      return;
    }
    if (code === 'TOMATO50' || code === 'WELCOME') {
      setDiscount(50);
      setPromoCode(code);
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
      toast.success('🎉 Promo code applied! ₹50 discount added.');
    } else if (code === 'FEAST10') {
      const disc = Math.round(getTotalCartAmount() * 0.1);
      setDiscount(disc);
      setPromoCode(code);
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
      toast.success(`🎉 10% Discount applied! ₹${disc} saved.`);
    } else {
      toast.error("Invalid code. Try 'TOMATO50' or 'WELCOME'");
    }
  };

  const cartProductList = food_list.filter((item) => cartItems[item._id] > 0);
  const totalItemCount = Object.values(cartItems).reduce((sum, qty) => sum + (qty > 0 ? qty : 0), 0);
  const subtotal = getTotalCartAmount();
  const currentDelivery = subtotal === 0 ? 0 : subtotal >= 400 ? 0 : deliveryCharge;
  const currentDiscount = Math.min(discount || 0, subtotal);
  const finalTotal = Math.max(0, subtotal === 0 ? 0 : subtotal + currentDelivery - currentDiscount);

  return (
    <div className="cart-page">
      {cartProductList.length === 0 ? (
        <div className="cart-empty-state">
          <div className="empty-cart-icon-box">
            <span>🛒</span>
          </div>
          <h2>Your Cart is Feeling Hungry!</h2>
          <p>You haven't added any mouth-watering dishes yet. Explore our diverse menu to satisfy your cravings.</p>
          <button onClick={() => navigate('/')} className="empty-explore-btn">
            Explore Menu ➔
          </button>
        </div>
      ) : (
        <>
          <div className="cart-header-title">
            <h2>Review Your Order</h2>
            <span className="cart-item-count-pill">{totalItemCount} {totalItemCount === 1 ? 'item' : 'items'} in cart</span>
          </div>

          <div className="cart-grid-container">
            {/* Left: Cart Items List */}
            <div className="cart-items-column">
              {subtotal < 400 && (
                <div className="free-delivery-banner">
                  <span>🚚</span>
                  <p>
                    Add <b>₹{400 - subtotal}</b> more to unlock <b>FREE Delivery</b>!
                  </p>
                </div>
              )}

              {subtotal >= 400 && (
                <div className="free-delivery-banner unlocked">
                  <span>🎉</span>
                  <p>
                    Congratulations! You have unlocked <b>FREE Delivery</b>!
                  </p>
                </div>
              )}

              <div className="cart-items-cards-list">
                {cartProductList.map((item) => {
                  const imageSrc =
                    typeof item.image === 'string' &&
                    (item.image.startsWith('http') || item.image.startsWith('/') || item.image.startsWith('data:'))
                      ? item.image
                      : `${url}/images/${item.image}`;

                  const isVeg =
                    item.name.toLowerCase().includes('veg') ||
                    (item.description && item.description.toLowerCase().includes('veg')) ||
                    item.category === 'Pure Veg';

                  return (
                    <div key={item._id} className="cart-item-modern-card">
                      <div className="cart-item-img-box" onClick={() => navigate(`/food/${item._id}`)}>
                        <img src={imageSrc} alt={item.name} />
                        <span className={`cart-diet-dot ${isVeg ? 'veg' : 'non-veg'}`}></span>
                      </div>

                      <div className="cart-item-details">
                        <div className="cart-item-header">
                          <Link to={`/food/${item._id}`} className="cart-item-name">
                            {item.name}
                          </Link>
                          <span className="cart-item-category-tag">{item.category}</span>
                        </div>
                        <p className="cart-item-unit-price">₹{item.price} each</p>

                        <div className="cart-item-controls-row">
                          <div className="cart-stepper">
                            <button onClick={() => removeFromCart(item._id)}>−</button>
                            <span>{cartItems[item._id]}</span>
                            <button onClick={() => addToCart(item._id)}>+</button>
                          </div>

                          <div className="cart-item-total-price">
                            <span>₹{item.price * cartItems[item._id]}</span>
                          </div>

                          <button
                            className="cart-item-delete-btn"
                            title="Remove all"
                            onClick={() => {
                              // completely remove by decrementing to 0
                              for (let i = 0; i < cartItems[item._id]; i++) {
                                removeFromCart(item._id);
                              }
                            }}
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Bill Summary & Checkout */}
            <div className="cart-summary-column">
              <div className="cart-summary-card">
                <h3>Order Summary</h3>

                {/* Promo Code Box */}
                <div className="promo-box">
                  <div className="promo-input-row">
                    <input
                      type="text"
                      placeholder="Enter promo code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                    />
                    <button onClick={() => handleApplyPromo()}>Apply</button>
                  </div>
                  <div className="promo-suggestion">
                    <span>💡 Quick code:</span>
                    <button
                      type="button"
                      className="promo-code-chip"
                      onClick={() => handleApplyPromo('TOMATO50')}
                    >
                      TOMATO50 (₹50 OFF)
                    </button>
                  </div>
                </div>

                {/* Calculation Rows */}
                <div className="bill-breakdown">
                  <div className="bill-row">
                    <span>Item Subtotal</span>
                    <span>₹{subtotal}</span>
                  </div>

                  <div className="bill-row">
                    <span>Delivery Fee</span>
                    <span>{currentDelivery === 0 ? <b style={{ color: '#2e7d32' }}>FREE</b> : `₹${currentDelivery}`}</span>
                  </div>

                  {currentDiscount > 0 && (
                    <div className="bill-row discount-row">
                      <span>Promo Discount</span>
                      <span>− ₹{currentDiscount}</span>
                    </div>
                  )}

                  <hr className="bill-divider" />

                  <div className="bill-row grand-total-row">
                    <div>
                      <p className="total-title">To Pay</p>
                      <p className="total-tax-note">Inclusive of all taxes</p>
                    </div>
                    <span className="total-amount">₹{finalTotal}</span>
                  </div>
                </div>

                <button className="cart-checkout-btn" onClick={() => navigate('/order')}>
                  Proceed to Checkout ➔
                </button>

                {/* Trust Badges */}
                <div className="cart-trust-badges">
                  <div className="trust-item">
                    <span>🔒</span>
                    <p>100% Secure Checkout</p>
                  </div>
                  <div className="trust-item">
                    <span>⚡</span>
                    <p>Express 30 Mins Delivery</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;

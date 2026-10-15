import React, { useContext, useState, useEffect } from 'react';
import './PlaceOrder.css';
import { StoreContext } from '../../context/StoreContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import confetti from 'canvas-confetti';

const PlaceOrder = () => {
  const [payment, setPayment] = useState('cod');
  const [loading, setLoading] = useState(false);

  const [data, setData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    street: '',
    city: '',
    state: '',
    zipcode: '',
    country: 'India',
    phone: ''
  });

  const { getTotalCartAmount, token, setCartItems, deliveryCharge, food_list, cartItems, url, discount } =
    useContext(StoreContext);
  const navigate = useNavigate();

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const subtotal = getTotalCartAmount();
  const currentDiscount = Math.min(discount || 0, subtotal);
  const currentDelivery = subtotal === 0 ? 0 : subtotal >= 400 ? 0 : deliveryCharge;
  const finalAmount = Math.max(0, subtotal + currentDelivery - currentDiscount);

  const cartProductList = food_list.filter((item) => cartItems[item._id] > 0);

  const placeOrder = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error('Please sign in to place an order');
      return;
    }

    setLoading(true);
    let orderItems = [];
    food_list.forEach((item) => {
      if (cartItems[item._id] > 0) {
        let itemInfo = { ...item, quantity: cartItems[item._id] };
        orderItems.push(itemInfo);
      }
    });

    let orderData = {
      address: data,
      items: orderItems,
      amount: finalAmount
    };

    try {
      if (payment === 'stripe') {
        const response = await axios.post(url + '/api/order/place', orderData, { headers: { token } });
        if (response.data.success) {
          const { session_url } = response.data;
          window.location.replace(session_url);
        } else {
          toast.error(response.data.message || 'Stripe payment initiation failed');
        }
      } else {
        // COD
        const response = await axios.post(url + '/api/order/placecod', orderData, { headers: { token } });
        if (response.data.success) {
          confetti({
            particleCount: 130,
            spread: 80,
            origin: { y: 0.6 }
          });
          toast.success(response.data.message || '🎉 Order Placed Successfully!');
          setCartItems({});
          navigate('/myorders');
        } else {
          toast.error(response.data.message || 'Failed to place order');
        }
      }
    } catch (err) {
      toast.error('Failed to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      toast.error('Please sign in first to checkout');
      navigate('/cart');
    } else if (getTotalCartAmount() === 0) {
      navigate('/cart');
    }
  }, [token]);

  return (
    <div className="checkout-page">
      <div className="checkout-header">
        <h2>Secure Checkout</h2>
        <p>Complete your delivery details to confirm the order</p>
      </div>

      <form onSubmit={placeOrder} className="checkout-grid">
        {/* Left: Delivery Details Form */}
        <div className="checkout-form-card">
          <div className="card-section-title">
            <span className="section-number">1</span>
            <h3>Delivery Address</h3>
          </div>

          <div className="form-fields-group">
            <div className="input-row-half">
              <div className="input-field">
                <label>First Name</label>
                <input
                  name="firstName"
                  onChange={onChangeHandler}
                  value={data.firstName}
                  type="text"
                  placeholder="e.g. Rahul"
                  required
                />
              </div>
              <div className="input-field">
                <label>Last Name</label>
                <input
                  name="lastName"
                  onChange={onChangeHandler}
                  value={data.lastName}
                  type="text"
                  placeholder="e.g. Sharma"
                  required
                />
              </div>
            </div>

            <div className="input-field">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                onChange={onChangeHandler}
                value={data.email}
                placeholder="dharamvir78914@gmail.com"
                required
              />
            </div>

            <div className="input-field">
              <label>Street & House / Flat No.</label>
              <input
                type="text"
                name="street"
                onChange={onChangeHandler}
                value={data.street}
                placeholder="e.g. 104, Sunrise Apartments, 1st Cross"
                required
              />
            </div>

            <div className="input-row-half">
              <div className="input-field">
                <label>City</label>
                <input
                  type="text"
                  name="city"
                  onChange={onChangeHandler}
                  value={data.city}
                  placeholder="e.g. Bengaluru"
                  required
                />
              </div>
              <div className="input-field">
                <label>State</label>
                <input
                  type="text"
                  name="state"
                  onChange={onChangeHandler}
                  value={data.state}
                  placeholder="e.g. Karnataka"
                  required
                />
              </div>
            </div>

            <div className="input-row-half">
              <div className="input-field">
                <label>Zip Code / Pincode</label>
                <input
                  type="text"
                  name="zipcode"
                  onChange={onChangeHandler}
                  value={data.zipcode}
                  placeholder="560034"
                  required
                />
              </div>
              <div className="input-field">
                <label>Country</label>
                <input
                  type="text"
                  name="country"
                  onChange={onChangeHandler}
                  value={data.country}
                  placeholder="India"
                  required
                />
              </div>
            </div>

            <div className="input-field">
              <label>Contact Phone Number</label>
              <input
                type="tel"
                name="phone"
                onChange={onChangeHandler}
                value={data.phone}
                placeholder="+91-6350113604"
                required
              />
            </div>
          </div>
        </div>

        {/* Right: Order Summary & Payment Mode */}
        <div className="checkout-summary-column">
          <div className="checkout-summary-card">
            <div className="card-section-title">
              <span className="section-number">2</span>
              <h3>Order Summary</h3>
            </div>

            {/* Quick Items Preview */}
            <div className="order-items-preview-list">
              {cartProductList.map((item) => (
                <div key={item._id} className="checkout-item-preview">
                  <div className="preview-item-info">
                    <span className="preview-qty">{cartItems[item._id]}×</span>
                    <span className="preview-name">{item.name}</span>
                  </div>
                  <span className="preview-price">₹{item.price * cartItems[item._id]}</span>
                </div>
              ))}
            </div>

            <hr className="checkout-divider" />

            {/* Bill Breakdown */}
            <div className="checkout-breakdown">
              <div className="ch-row">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="ch-row">
                <span>Delivery Charge</span>
                <span>{currentDelivery === 0 ? <b style={{ color: '#2e7d32' }}>FREE</b> : `₹${currentDelivery}`}</span>
              </div>
              {currentDiscount > 0 && (
                <div className="ch-row discount">
                  <span>Promo Code Savings</span>
                  <span>− ₹{currentDiscount}</span>
                </div>
              )}
              <hr className="ch-divider" />
              <div className="ch-row grand-total">
                <span>Grand Total</span>
                <span className="ch-total-amount">₹{finalAmount}</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="payment-method-box">
              <h4>Select Payment Method</h4>

              <div className="payment-options-grid">
                <label className={`payment-option-card ${payment === 'cod' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={payment === 'cod'}
                    onChange={() => setPayment('cod')}
                  />
                  <div className="option-content">
                    <span className="option-icon">💵</span>
                    <div>
                      <p className="option-title">Cash on Delivery</p>
                      <p className="option-desc">Pay cash when food arrives at your door</p>
                    </div>
                  </div>
                </label>

                <label className={`payment-option-card ${payment === 'stripe' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="stripe"
                    checked={payment === 'stripe'}
                    onChange={() => setPayment('stripe')}
                  />
                  <div className="option-content">
                    <span className="option-icon">💳</span>
                    <div>
                      <p className="option-title">Online Payment (Stripe)</p>
                      <p className="option-desc">Cards, Netbanking & UPI Gateway</p>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <button type="submit" disabled={loading} className="checkout-submit-btn">
              {loading ? (
                'Processing Order...'
              ) : payment === 'stripe' ? (
                'Proceed to Stripe Checkout ➔'
              ) : (
                `Confirm & Place Order (₹${finalAmount}) ➔`
              )}
            </button>

            <p className="checkout-guarantee">🔒 100% Safe & Encrypted Checkout</p>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PlaceOrder;

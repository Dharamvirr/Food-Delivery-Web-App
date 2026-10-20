import React, { useContext, useEffect, useState } from 'react';
import './MyOrders.css';
import axios from 'axios';
import { assets } from '../../assets/assets';
import { StoreContext } from '../../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import confetti from 'canvas-confetti';
import TrackingCanvas3D from '../../components/TrackingCanvas3D/TrackingCanvas3D';

const MyOrders = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const { url, token, currency, socket } = useContext(StoreContext);
  const navigate = useNavigate();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.post(url + '/api/order/userorders', {}, { headers: { token } });
      if (response.data && response.data.data) {
        setData(response.data.data);
      }
    } catch (err) {
      console.error('Fetch orders error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchOrders();
    }
  }, [token]);

  // Real-time live order status streaming via WebSockets
  useEffect(() => {
    if (!socket) return;

    const handleStatusUpdate = (payload) => {
      console.log("[WebSocket] Live order update received:", payload);
      if (!payload || !payload.orderId) return;

      setData((prevOrders) =>
        prevOrders.map((ord) => {
          if (String(ord._id) === String(payload.orderId)) {
            return { ...ord, status: payload.status };
          }
          return ord;
        })
      );

      const shortId = String(payload.orderId).slice(-6).toUpperCase();
      if (payload.status === "Delivered") {
        confetti({
          particleCount: 130,
          spread: 80,
          origin: { y: 0.6 }
        });
        toast.success(`🎉 Hurray! Order #${shortId} has been Delivered! Enjoy your meal! 🍽️`);
      } else {
        toast.info(`🔔 Live Update: Order #${shortId} is now "${payload.status}"!`);
      }
    };

    socket.on("order_status_updated", handleStatusUpdate);

    return () => {
      socket.off("order_status_updated", handleStatusUpdate);
    };
  }, [socket]);

  const getStepIndex = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('delivered')) return 4;
    if (s.includes('out for delivery') || s.includes('on the way')) return 3;
    if (s.includes('processing') || s.includes('food processing') || s.includes('kitchen') || s.includes('preparing')) return 2;
    return 1; // Order Placed / Confirmed
  };

  return (
    <div className='my-orders-page'>
      <div className="orders-header-row">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h2>Your Orders</h2>
            <span className="live-status-pulse-badge" title="Real-time WebSockets connected">
              <span className="live-pulse-dot"></span> Live Sync
            </span>
          </div>
          <p className="orders-subtitle">Track your live food deliveries and order history in real-time</p>
        </div>
        <button 
          className="refresh-orders-btn" 
          onClick={() => {
            fetchOrders();
            toast.info("Refreshed orders status 🔄");
          }}
          disabled={loading}
        >
          {loading ? "Updating..." : "🔄 Refresh"}
        </button>
      </div>

      {/* 3D Interactive GPS Route Dispatch Radar */}
      <div className="orders-3d-radar-banner">
        <TrackingCanvas3D />
        <div className="radar-banner-info">
          <span className="radar-live-badge">🟢 Real-Time GPS Mesh</span>
          <h3>Live Courier Orbit & Route Radar</h3>
          <p>
            Kitchen dispatches stream directly via Socket.IO WSS channels. Click and drag the 3D globe to inspect delivery satellites and active routes in 360°.
          </p>
        </div>
      </div>

      {!token ? (
        <div className="orders-empty-card">
          <p>Please sign in to view your orders.</p>
          <button onClick={() => navigate('/')}>Go to Home</button>
        </div>
      ) : data.length === 0 ? (
        <div className="orders-empty-card">
          <div className="empty-order-icon">📦</div>
          <h3>No Orders Placed Yet</h3>
          <p>You haven't ordered any delicious food yet. Your cravings are waiting!</p>
          <button onClick={() => navigate('/')} className="order-now-btn">
            Explore Menu Now ➔
          </button>
        </div>
      ) : (
        <div className="orders-cards-container">
          {data.map((order, index) => {
            const step = getStepIndex(order.status);
            const dateStr = order.date ? new Date(order.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent Order';

            return (
              <div key={order._id || index} className="order-modern-card">
                {/* Order Top Bar */}
                <div className="order-card-top">
                  <div className="order-meta-info">
                    <span className="order-id-pill">Order #{String(order._id).slice(-6).toUpperCase()}</span>
                    <span className="order-date-text">{dateStr}</span>
                  </div>
                  <div className="order-amount-pill">
                    <span>Total:</span> <b>{currency}{order.amount}.00</b>
                  </div>
                </div>

                {/* Live Progress Stepper */}
                <div className="order-stepper-tracker">
                  <div className="stepper-progress-bar">
                    <div 
                      className="stepper-progress-fill" 
                      style={{ width: step === 1 ? '15%' : step === 2 ? '45%' : step === 3 ? '78%' : '100%' }}
                    ></div>
                  </div>

                  <div className="stepper-nodes">
                    <div className={`step-node ${step >= 1 ? 'active' : ''}`}>
                      <div className="node-circle">{step >= 1 ? '✓' : '1'}</div>
                      <span className="node-label">Confirmed</span>
                    </div>

                    <div className={`step-node ${step >= 2 ? 'active' : ''}`}>
                      <div className="node-circle">{step >= 2 ? '🍳' : '2'}</div>
                      <span className="node-label">Preparing</span>
                    </div>

                    <div className={`step-node ${step >= 3 ? 'active' : ''}`}>
                      <div className="node-circle">{step >= 3 ? '🛵' : '3'}</div>
                      <span className="node-label">On The Way</span>
                    </div>

                    <div className={`step-node ${step >= 4 ? 'active' : ''}`}>
                      <div className="node-circle">{step >= 4 ? '🏠' : '4'}</div>
                      <span className="node-label">Delivered</span>
                    </div>
                  </div>
                </div>

                {/* Items & Delivery Address Details */}
                <div className="order-details-bottom">
                  <div className="order-items-summary">
                    <p className="order-section-title">Items Ordered ({order.items.length}):</p>
                    <div className="order-items-tags">
                      {order.items.map((item, idx) => (
                        <span key={idx} className="item-qty-tag">
                          <b>{item.quantity}×</b> {item.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {order.address && (
                    <div className="order-address-box">
                      <p className="order-section-title">Delivering To:</p>
                      <p className="address-text">
                        {order.address.firstName} {order.address.lastName}, {order.address.street}, {order.address.city}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyOrders;

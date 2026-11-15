import React, { useState, useContext, useEffect, useRef } from 'react';
import './AIChatBot.css';
import { StoreContext } from '../../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getFoodImageUrl } from '../../assets/assets';
import axios from 'axios';

const AIChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const { food_list, addToCart, cartItems, url, token } = useContext(StoreContext);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  // Persistent conversation thread for LangGraph memory checkpointer
  const [threadId] = useState(() => {
    let saved = sessionStorage.getItem('tomato_chef_thread_id');
    if (!saved) {
      saved = `thread_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      sessionStorage.setItem('tomato_chef_thread_id', saved);
    }
    return saved;
  });

  const [userName, setUserName] = useState(() => sessionStorage.getItem('tomato_chef_user_name') || null);

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: "Hey there, foodie! 👨‍🍳 I'm Chef Tomato, your personal culinary concierge. Tell me what flavors you're craving today (e.g. spicy rolls, cheesy pasta, fresh salad, or a sweet dessert) or ask me for today's best recommendations!",
      recommendations: []
    }
  ]);

  const quickPrompts = [
    { label: "🔥 Chef's Bestsellers", prompt: "What are your most popular dishes right now?" },
    { label: "🧀 Cheesy & Comforting", prompt: "I'm craving something hot, cheesy and super comforting!" },
    { label: "🌶️ Spicy & Savory", prompt: "I want something spicy and full of flavor under ₹200!" },
    { label: "🥗 Healthy & Fresh", prompt: "Suggest something fresh, healthy and guilt-free." },
    { label: "🍰 Sweet Tooth Cravings", prompt: "What is your most irresistible sweet dessert?" },
    { label: "🛵 Checkout My Cart", prompt: "Please checkout my cart with cash on delivery" }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping]);

  /**
   * Match dish from Qdrant RAG payload to local food_list for accurate IDs & cart actions
   */
  const matchWithFoodList = (ragDishes = []) => {
    if (!ragDishes || ragDishes.length === 0) return [];

    return ragDishes.map((ragItem) => {
      // Find matching item in food_list by name or id
      const matched = food_list.find(
        (f) =>
          f.name?.toLowerCase() === ragItem.name?.toLowerCase() ||
          f._id === ragItem.dishId ||
          f._id === ragItem._id
      );

      return matched
        ? { ...matched, matchScore: ragItem.matchScore }
        : {
            _id: ragItem.dishId || `dish_${Date.now()}`,
            name: ragItem.name,
            price: ragItem.price,
            category: ragItem.category,
            image: ragItem.image,
            description: ragItem.description,
          };
    });
  };

  /**
   * Send message to LangGraph Backend Agent (with Qdrant RAG & HITL)
   */
  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputMessage;
    if (!text.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: text.trim(),
      recommendations: []
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    try {
      // Post to Node.js LangGraph endpoint
      const response = await axios.post(`${url}/api/ai/chat`, {
        message: text.trim(),
        threadId: threadId,
        cartData: cartItems,
      });

      if (response.data.success) {
        if (response.data.userName) {
          setUserName(response.data.userName);
          sessionStorage.setItem('tomato_chef_user_name', response.data.userName);
        }

        const matchedDishes = matchWithFoodList(response.data.dishes);

        const botMsg = {
          id: Date.now() + 1,
          sender: 'bot',
          text: response.data.text,
          recommendations: matchedDishes,
          requiresApproval: response.data.requiresApproval || false,
          approvalData: response.data.approvalData || null,
          approvalStatus: null, // null | 'APPROVED' | 'CANCELLED'
        };

        setMessages((prev) => [...prev, botMsg]);
      } else {
        throw new Error(response.data.message || 'Error communicating with AI');
      }
    } catch (error) {
      console.warn('AI chat error, using culinary fallback:', error.message);
      // Fallback response if network or backend fails
      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: "I'm having a quick stir in the kitchen! 🍳 Check out these popular chef picks while I catch my breath:",
        recommendations: food_list.slice(0, 3),
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  /**
   * Handle Human-in-the-Loop Approval Action (Confirm or Cancel)
   */
  const handleApproval = async (approved, msgId, actionData) => {
    setIsTyping(true);

    // Update the message state locally so buttons disable immediately
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId
          ? { ...m, approvalStatus: approved ? 'APPROVED' : 'CANCELLED' }
          : m
      )
    );

    try {
      const response = await axios.post(`${url}/api/ai/approve`, {
        threadId: threadId,
        approved: approved,
        notes: approved ? 'Confirmed by user via UI button' : 'Cancelled by user',
      });

      if (response.data.success) {
        const followUpMsg = {
          id: Date.now() + 2,
          sender: 'bot',
          text: response.data.text,
          recommendations: [],
        };
        setMessages((prev) => [...prev, followUpMsg]);
      }
    } catch (err) {
      console.error('Failed to submit approval:', err);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="ai-chatbot-root">
      {/* Floating Trigger Mascot */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            className="ai-chat-trigger"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => setIsOpen(true)}
          >
            <div className="ai-trigger-bubble">
              <span>Craving advice? Ask Chef AI! 👨‍🍳</span>
            </div>
            <div className="ai-trigger-circle">
              <span className="chef-icon">👨‍🍳</span>
              <span className="online-indicator"></span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="ai-chat-window"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: "spring", damping: 24, stiffness: 300 }}
          >
            {/* Header */}
            <div className="ai-chat-header">
              <div className="ai-header-left">
                <div className="ai-chef-avatar">
                  <span>👨‍🍳</span>
                  <span className="live-status-dot"></span>
                </div>
                <div>
                  <h4>Chef Tomato {userName ? `• Hi, ${userName}! 👋` : ''}</h4>
                  <p>Culinary Concierge • Ready to help</p>
                </div>
              </div>
              <button className="ai-close-btn" onClick={() => setIsOpen(false)} aria-label="Close Chat">
                ✕
              </button>
            </div>

            {/* Quick Prompts Carousel */}
            <div className="ai-quick-prompts-bar">
              {quickPrompts.map((item, idx) => (
                <button
                  key={idx}
                  className="ai-prompt-pill"
                  onClick={() => handleSendMessage(item.prompt)}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Message Area */}
            <div className="ai-chat-body">
              {messages.map((msg) => (
                <div key={msg.id} className={`ai-message-row ${msg.sender}`}>
                  {msg.sender === 'bot' && (
                    <div className="ai-msg-avatar">👨‍🍳</div>
                  )}
                  <div className="ai-message-bubble">
                    <p className="ai-msg-text" style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>

                    {/* Human-in-the-Loop (HITL) Action Confirmation Card */}
                    {msg.requiresApproval && msg.approvalData && (
                      <div className="ai-hitl-card">
                        <div className="ai-hitl-badge">
                          <span>🛡️ Action Approval Required</span>
                        </div>
                        <p className="ai-hitl-summary">{msg.approvalData.summary}</p>
                        {msg.approvalData.totalAmount > 0 && (
                          <div className="ai-hitl-meta">
                            <span>Total Order Value: <strong>₹{msg.approvalData.totalAmount}</strong></span>
                          </div>
                        )}

                        {!msg.approvalStatus ? (
                          <div className="ai-hitl-buttons">
                            <button
                              className="ai-hitl-btn-confirm"
                              onClick={() => handleApproval(true, msg.id, msg.approvalData)}
                            >
                              ✅ Confirm Action
                            </button>
                            <button
                              className="ai-hitl-btn-cancel"
                              onClick={() => handleApproval(false, msg.id, msg.approvalData)}
                            >
                              ❌ Cancel
                            </button>
                          </div>
                        ) : (
                          <div
                            className={`ai-hitl-resolved ${
                              msg.approvalStatus === 'APPROVED' ? 'approved' : 'rejected'
                            }`}
                          >
                            {msg.approvalStatus === 'APPROVED'
                              ? '✓ Action Confirmed by You'
                              : '✕ Action Cancelled by You'}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Interactive Dish Recommendation Cards (from Qdrant RAG) */}
                    {msg.recommendations && msg.recommendations.length > 0 && (
                      <div className="ai-dishes-carousel">
                        {msg.recommendations.map((dish) => {
                          const imageSrc = getFoodImageUrl(dish.image, url, dish.name);

                          return (
                            <div key={dish._id} className="ai-dish-card">
                              <div 
                                className="ai-dish-img-box" 
                                onClick={() => {
                                  setIsOpen(false);
                                  navigate(`/food/${dish._id}`);
                                }}
                              >
                                <img 
                                  src={imageSrc} 
                                  alt={dish.name} 
                                  crossOrigin="anonymous"
                                  onError={(e) => {
                                    const fallback = getFoodImageUrl(null, url, dish.name);
                                    if (e.target.src !== fallback) e.target.src = fallback;
                                  }}
                                />
                                <span className="ai-dish-cat">{dish.category}</span>
                              </div>
                              <div className="ai-dish-info">
                                <h5 
                                  onClick={() => {
                                    setIsOpen(false);
                                    navigate(`/food/${dish._id}`);
                                  }}
                                >
                                  {dish.name}
                                </h5>
                                <div className="ai-dish-price-row">
                                  <span className="ai-price">₹{dish.price}</span>
                                  <span className="ai-rating">⭐ 4.8</span>
                                </div>
                                <button
                                  className="ai-add-cart-btn"
                                  onClick={() => addToCart(dish._id)}
                                >
                                  {cartItems[dish._id] ? `Added (${cartItems[dish._id]}) ✓` : "+ Add to Cart"}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="ai-message-row bot">
                  <div className="ai-msg-avatar">👨‍🍳</div>
                  <div className="ai-message-bubble typing-bubble">
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Footer */}
            <form 
              className="ai-chat-footer"
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
            >
              <input
                type="text"
                placeholder="Ask Chef: 'Spicy rolls under 200' or 'Checkout cart'..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
              />
              <button type="submit" disabled={!inputMessage.trim()} aria-label="Send Message">
                ➔
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIChatBot;

import React, { useState, useContext, useEffect, useRef } from 'react';
import './AIChatBot.css';
import { StoreContext } from '../../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const AIChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const { food_list, addToCart, cartItems, url } = useContext(StoreContext);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: "Hey there, foodie! 👨‍🍳 Starving? Tell me what flavor you're craving right now—spicy street-style rolls, velvety cheesy pasta, or a decadent molten dessert—and I'll pick the ultimate feast for you!",
      recommendations: []
    }
  ]);

  const quickPrompts = [
    { label: "🔥 Chef's Bestsellers", prompt: "What are your most popular dishes right now?" },
    { label: "🧀 Cheesy & Comforting", prompt: "I'm craving something hot, cheesy and super comforting!" },
    { label: "🌶️ Spicy & Savory", prompt: "I want something spicy and full of flavor!" },
    { label: "🥗 Healthy & Fresh", prompt: "Suggest something fresh, healthy and guilt-free." },
    { label: "🍰 Sweet Tooth Cravings", prompt: "What is your most irresistible sweet dessert?" },
    { label: "💰 Budget Meals under ₹180", prompt: "Show me delicious meals under ₹180." }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping]);

  // AI Craving Engine
  const generateAIResponse = (userQuery) => {
    const q = userQuery.toLowerCase();
    let replyText = "";
    let recommendedDishes = [];

    if (q.includes("cheese") || q.includes("cheesy") || q.includes("creamy") || q.includes("comfort")) {
      recommendedDishes = food_list.filter(item => 
        item.name.toLowerCase().includes("cheese") || 
        item.name.toLowerCase().includes("creamy") || 
        item.category === "Pasta" || 
        item.name.toLowerCase().includes("lasagna")
      ).slice(0, 3);

      replyText = "Ooh, there's nothing quite like warm, melted comfort! 🧀 Imagine al dente pasta ribbons smothered in a velvety, slow-simmered 4-cheese Alfredo reduction, finished with cracked black pepper and golden parmesan crust. You are going to fall in love with these:";
    } 
    else if (q.includes("sweet") || q.includes("dessert") || q.includes("cake") || q.includes("ice cream") || q.includes("sugar")) {
      recommendedDishes = food_list.filter(item => item.category === "Desserts" || item.category === "Cake").slice(0, 3);
      replyText = "Time to indulge your sweet tooth! 🍨 Picture rich double-churned vanilla cream swirled with decadent Belgian chocolate ripples, or moist caramelized sponge cakes that melt like butter on your tongue. Here is pure happiness on a plate:";
    }
    else if (q.includes("spicy") || q.includes("hot") || q.includes("chili") || q.includes("peri peri") || q.includes("tikka")) {
      recommendedDishes = food_list.filter(item => 
        item.name.toLowerCase().includes("peri") || 
        item.name.toLowerCase().includes("chicken roll") || 
        item.category === "Rolls" || 
        item.name.toLowerCase().includes("cooked noodles")
      ).slice(0, 3);
      replyText = "Get ready for an explosion of bold heat! 🌶️ Think tender spiced bites wrapped in flaky golden parathas with zesty mint chutney and crunchy pickled onions. These will set your tastebuds on fire in the best way possible:";
    }
    else if (q.includes("healthy") || q.includes("salad") || q.includes("diet") || q.includes("veg") || q.includes("light") || q.includes("green")) {
      recommendedDishes = food_list.filter(item => item.category === "Salad" || item.category === "Pure Veg").slice(0, 3);
      replyText = "Nourishing your body with vibrant freshness! 🥗 Crisp garden-picked greens, sun-ripened tomatoes, and creamy Mediterranean feta drizzled with golden extra-virgin olive oil and aromatic herbs. Guilt-free, crunchy, and absolutely delicious:";
    }
    else if (q.includes("budget") || q.includes("cheap") || q.includes("under 180") || q.includes("under 200") || q.includes("pocket")) {
      recommendedDishes = food_list.filter(item => item.price <= 180).slice(0, 3);
      replyText = "Gourmet flavors that are super kind to your wallet! 💰 You don't have to break the bank to enjoy artisanal street wraps, buttery noodles, and refreshing starters. Check out these value-packed feasts:";
    }
    else if (q.includes("track") || q.includes("order") || q.includes("status") || q.includes("delivery")) {
      replyText = "You can easily track your live order progress in the **'My Orders'** tab! 🛵 Our kitchen is busy cooking your meal fresh, and our live stepper will show when it's out for delivery. Click the profile icon in the top right to check your live status.";
    }
    else {
      // General hunger / bestseller recommendation
      recommendedDishes = food_list.filter(item => 
        ["Greek Salad", "Lasagna Rolls", "Peri Peri Rolls", "Cheese Pasta", "Butterscotch Cake"].includes(item.name)
      ).slice(0, 3);

      if (recommendedDishes.length === 0) {
        recommendedDishes = food_list.slice(0, 3);
      }

      replyText = "I know that hungry craving feeling all too well! 🤤 When you want an unforgettable meal, our kitchen's top star dishes never disappoint. Freshly hand-prepared, sizzling hot, and delivered in under 30 minutes:";
    }

    return { replyText, recommendedDishes };
  };

  const handleSendMessage = (textToSend) => {
    const text = textToSend || inputMessage;
    if (!text.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: text.trim(),
      recommendations: []
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate realistic AI thought time
    setTimeout(() => {
      const { replyText, recommendedDishes } = generateAIResponse(text);
      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: replyText,
        recommendations: recommendedDishes
      };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 700);
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
                  <h4>Chef Tomato AI</h4>
                  <p>Your Personal Food Sommelier • Online</p>
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
                    <p className="ai-msg-text">{msg.text}</p>

                    {/* Interactive Dish Recommendation Cards */}
                    {msg.recommendations && msg.recommendations.length > 0 && (
                      <div className="ai-dishes-carousel">
                        {msg.recommendations.map((dish) => {
                          const imageSrc =
                            typeof dish.image === 'string' &&
                            (dish.image.startsWith('http') || dish.image.startsWith('/') || dish.image.startsWith('data:'))
                              ? dish.image
                              : `${url}/images/${dish.image}`;

                          return (
                            <div key={dish._id} className="ai-dish-card">
                              <div 
                                className="ai-dish-img-box" 
                                onClick={() => {
                                  setIsOpen(false);
                                  navigate(`/food/${dish._id}`);
                                }}
                              >
                                <img src={imageSrc} alt={dish.name} />
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
                placeholder="Ask Chef: 'I want something cheesy...' or 'Healthy lunch'..."
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

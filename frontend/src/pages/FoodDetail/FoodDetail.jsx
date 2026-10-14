import React, { useContext, useState, useEffect } from 'react';
import './FoodDetail.css';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';
import { toast } from 'react-toastify';
import FoodItem from '../../components/FoodItem/FoodItem';

const FoodDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { food_list, cartItems, addToCart, removeFromCart, url } = useContext(StoreContext);
  const [selectedQty, setSelectedQty] = useState(1);

  // Scroll to top when page opens or id changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const foodItem = food_list.find((item) => String(item._id) === String(id));

  if (!foodItem) {
    return (
      <div className="food-detail-not-found">
        <h2>Dish Not Found 🍽️</h2>
        <p>The food item you are looking for might have been moved or is currently unavailable.</p>
        <button onClick={() => navigate('/')}>Back to Menu</button>
      </div>
    );
  }

  const imageSrc =
    typeof foodItem.image === 'string' &&
    (foodItem.image.startsWith('http') || foodItem.image.startsWith('/') || foodItem.image.startsWith('data:'))
      ? foodItem.image
      : `${url}/images/${foodItem.image}`;

  const isVeg = foodItem.category === 'Pure Veg' || foodItem.name.toLowerCase().includes('veg');
  const originalPrice = Math.round(foodItem.price * 1.25); // Show realistic discount
  const inCartQty = cartItems[foodItem._id] || 0;

  // Curated ingredients based on categories
  const ingredientsMap = {
    Salad: ['Crisp Lettuce', 'Extra Virgin Olive Oil', 'Cherry Tomatoes', 'Cucumbers', 'Fresh Herbs', 'Lemon Zest'],
    Rolls: ['Handmade Paratha', 'Signature Spices', 'Sliced Onions', 'Mint Mayo', 'Bell Peppers'],
    Desserts: ['Pure Vanilla Bean', 'Belgian Cocoa', 'Fresh Cream', 'Natural Cane Sugar', 'Choco Chunks'],
    Sandwich: ['Artisan Sourdough', 'Cheddar Cheese', 'Crisp Romaine', 'Garlic Aioli', 'Roma Tomatoes'],
    Cake: ['Organic Flour', 'Whipped Cream', 'Buttercream', 'Rich Cocoa', 'Fresh Fruit Essence'],
    'Pure Veg': ['Farm Fresh Veggies', 'Cold-Pressed Oil', 'Aromatic Indian Spices', 'Fresh Coriander', 'Ginger Garlic'],
    Pasta: ['Durum Wheat Semolina', 'Parmigiano-Reggiano', 'Extra Virgin Olive Oil', 'San Marzano Sauce', 'Fresh Basil'],
    Noodles: ['Wok-Tossed Egg Noodles', 'Dark Soy Sauce', 'Scallions & Garlic', 'Chili Crisp', 'Bok Choy']
  };

  const currentIngredients = ingredientsMap[foodItem.category] || [
    'Fresh Produce',
    'Secret Chef Spices',
    'Extra Virgin Olive Oil',
    'Fresh Herbs'
  ];

  // Dummy customer reviews
  const dummyReviews = [
    {
      name: 'Aditi Sharma',
      avatar: '👩',
      rating: 5,
      date: '2 days ago',
      comment: 'Super fresh and flavorful! Delivered piping hot within 25 minutes. Definitely ordering again!'
    },
    {
      name: 'Rahul Verma',
      avatar: '👨',
      rating: 5,
      date: '1 week ago',
      comment: 'The presentation and taste were restaurant-grade. Loved the packaging and seasoning.'
    },
    {
      name: 'Pooja Nair',
      avatar: '👩‍🦰',
      rating: 4,
      date: '2 weeks ago',
      comment: 'Generous portion size and authentic flavor. Highly recommended for weekend cravings!'
    }
  ];

  // Related items from same category
  const relatedDishes = food_list
    .filter((item) => item.category === foodItem.category && String(item._id) !== String(foodItem._id))
    .slice(0, 4);

  const handleAddMultiple = () => {
    for (let i = 0; i < selectedQty; i++) {
      addToCart(foodItem._id);
    }
    toast.success(`Added ${selectedQty} × ${foodItem.name} to cart! 🛒`);
    setSelectedQty(1);
  };

  return (
    <div className="food-detail-page">
      {/* Breadcrumb Navigation */}
      <nav className="detail-breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <Link to="/" onClick={() => setTimeout(() => document.getElementById('explore-menu')?.scrollIntoView(), 100)}>
          {foodItem.category}
        </Link>
        <span>/</span>
        <span className="current-page">{foodItem.name}</span>
      </nav>

      {/* Main Product Showcase Card */}
      <div className="detail-hero-card">
        {/* Left: Product Image & Badges */}
        <div className="detail-image-section">
          <div className="detail-img-container">
            <img src={imageSrc} alt={foodItem.name} className="detail-main-img" />
            <span className={`detail-diet-badge ${isVeg ? 'veg' : 'non-veg'}`}>
              <span className="diet-icon"></span>
              {isVeg ? 'Pure Veg' : 'Non-Veg'}
            </span>
            <span className="detail-discount-tag">20% OFF</span>
          </div>
        </div>

        {/* Right: Product Details & Purchase Actions */}
        <div className="detail-info-section">
          <div className="detail-category-row">
            <span className="detail-category-pill">{foodItem.category}</span>
            <div className="detail-rating-pill">
              <span>⭐ 4.8</span>
              <span className="review-count">(148 reviews)</span>
            </div>
          </div>

          <h1 className="detail-title">{foodItem.name}</h1>
          <p className="detail-description">{foodItem.description}</p>

          <div className="detail-price-row">
            <span className="detail-current-price">₹{foodItem.price}</span>
            <span className="detail-original-price">₹{originalPrice}</span>
            <span className="detail-savings-badge">Save ₹{originalPrice - foodItem.price}</span>
          </div>

          {/* Quick Metrics */}
          <div className="detail-highlights-grid">
            <div className="highlight-item">
              <span className="hl-icon">⚡</span>
              <div>
                <p className="hl-label">Delivery Time</p>
                <p className="hl-value">25 - 30 Mins</p>
              </div>
            </div>
            <div className="highlight-item">
              <span className="hl-icon">🔥</span>
              <div>
                <p className="hl-label">Calories</p>
                <p className="hl-value">~320 kcal</p>
              </div>
            </div>
            <div className="highlight-item">
              <span className="hl-icon">👨‍🍳</span>
              <div>
                <p className="hl-label">Kitchen</p>
                <p className="hl-value">Freshly Cooked</p>
              </div>
            </div>
            <div className="highlight-item">
              <span className="hl-icon">🍽️</span>
              <div>
                <p className="hl-label">Portion</p>
                <p className="hl-value">Serves 1-2</p>
              </div>
            </div>
          </div>

          {/* Key Ingredients */}
          <div className="detail-ingredients-box">
            <h4>Key Ingredients & Aromatics</h4>
            <div className="ingredients-tags">
              {currentIngredients.map((ing, idx) => (
                <span key={idx} className="ing-tag">
                  {ing}
                </span>
              ))}
            </div>
          </div>

          {/* Quantity & Add to Cart Controls */}
          <div className="detail-action-bar">
            {inCartQty > 0 ? (
              <div className="incart-active-box">
                <span className="incart-label">In Your Cart:</span>
                <div className="detail-counter-pill">
                  <button onClick={() => removeFromCart(foodItem._id)}>−</button>
                  <span>{inCartQty}</span>
                  <button onClick={() => addToCart(foodItem._id)}>+</button>
                </div>
                <button className="view-cart-btn" onClick={() => navigate('/cart')}>
                  Go to Cart 🛒
                </button>
              </div>
            ) : (
              <div className="add-cart-row">
                <div className="detail-qty-stepper">
                  <button onClick={() => setSelectedQty(Math.max(1, selectedQty - 1))}>−</button>
                  <span>{selectedQty}</span>
                  <button onClick={() => setSelectedQty(selectedQty + 1)}>+</button>
                </div>
                <button className="detail-add-btn" onClick={handleAddMultiple}>
                  Add to Cart • ₹{foodItem.price * selectedQty}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <div className="detail-reviews-section">
        <div className="section-header-row">
          <h3>Customer Reviews (148)</h3>
          <span className="verified-badge">✓ 100% Verified Diners</span>
        </div>
        <div className="reviews-grid">
          {dummyReviews.map((rev, idx) => (
            <div key={idx} className="review-card">
              <div className="review-top-row">
                <div className="rev-user">
                  <span className="rev-avatar">{rev.avatar}</span>
                  <div>
                    <p className="rev-name">{rev.name}</p>
                    <p className="rev-date">{rev.date}</p>
                  </div>
                </div>
                <div className="rev-stars">{'⭐'.repeat(rev.rating)}</div>
              </div>
              <p className="rev-comment">"{rev.comment}"</p>
            </div>
          ))}
        </div>
      </div>

      {/* Related Dishes Carousel */}
      {relatedDishes.length > 0 && (
        <div className="detail-related-section">
          <h3>More Delicious Dishes in {foodItem.category}</h3>
          <div className="related-dishes-grid">
            {relatedDishes.map((dish) => (
              <FoodItem
                key={dish._id}
                id={dish._id}
                name={dish.name}
                price={dish.price}
                description={dish.description}
                image={dish.image}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodDetail;

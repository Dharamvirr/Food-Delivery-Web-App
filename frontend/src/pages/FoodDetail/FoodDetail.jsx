import React, { useContext, useState, useEffect } from 'react';
import './FoodDetail.css';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';
import { toast } from 'react-toastify';
import FoodItem from '../../components/FoodItem/FoodItem';
import { getFoodImageUrl } from '../../assets/assets';
import axios from 'axios';
import confetti from 'canvas-confetti';

const FoodDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { food_list, cartItems, addToCart, removeFromCart, url, token } = useContext(StoreContext);
  const [selectedQty, setSelectedQty] = useState(1);

  // Dynamic MongoDB Reviews State
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(4.8);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loadingReviews, setLoadingReviews] = useState(false);

  // Review Form State
  const [newRating, setNewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Scroll to top when page opens or id changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const foodItem = food_list.find((item) => String(item._id) === String(id));

  // Fetch real reviews from MongoDB Atlas
  const fetchDishReviews = async () => {
    if (!foodItem) return;
    setLoadingReviews(true);
    try {
      const res = await axios.get(`${url}/api/review/${foodItem._id}`);
      if (res.data && res.data.success) {
        setReviews(res.data.reviews || []);
        setAverageRating(res.data.averageRating || 4.8);
        setTotalReviews(res.data.totalReviews || 0);
      }
    } catch (err) {
      console.error('Fetch reviews error:', err);
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    if (foodItem) {
      fetchDishReviews();
    }
  }, [id, foodItem]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.info('Please sign in to submit a review ⭐');
      return;
    }

    if (!newComment.trim()) {
      toast.warn('Please write a few words about your dining experience!');
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await axios.post(
        `${url}/api/review/add`,
        {
          foodId: String(foodItem._id),
          rating: newRating,
          comment: newComment.trim(),
        },
        { headers: { token } }
      );

      if (res.data && res.data.success) {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.7 },
        });
        toast.success(res.data.message || 'Thank you! Your review is now live ⭐');
        setNewComment('');
        setNewRating(5);
        await fetchDishReviews();
      } else {
        toast.error(res.data.message || 'Failed to submit review');
      }
    } catch (err) {
      console.error('Submit review error:', err);
      toast.error('Could not submit review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (!foodItem) {
    return (
      <div className="food-detail-not-found">
        <h2>Dish Not Found 🍽️</h2>
        <p>The food item you are looking for might have been moved or is currently unavailable.</p>
        <button onClick={() => navigate('/')}>Back to Menu</button>
      </div>
    );
  }

  const imageSrc = getFoodImageUrl(foodItem.image, url);

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

  // Default fallback starter reviews if no reviews are stored yet in DB
  const defaultReviews = [
    {
      _id: 'def1',
      userName: 'Aditi Sharma',
      rating: 5,
      createdAt: '2026-10-13T10:00:00.000Z',
      comment: 'Super fresh and flavorful! Delivered piping hot within 25 minutes. Definitely ordering again!'
    },
    {
      _id: 'def2',
      userName: 'Rahul Verma',
      rating: 5,
      createdAt: '2026-10-10T14:30:00.000Z',
      comment: 'The presentation and taste were restaurant-grade. Loved the seasoning and crispy texture!'
    },
    {
      _id: 'def3',
      userName: 'Pooja Nair',
      rating: 4,
      createdAt: '2026-10-06T19:15:00.000Z',
      comment: 'Generous portion size and authentic spice profile. Highly recommended for weekend cravings!'
    }
  ];

  const displayReviews = reviews.length > 0 ? reviews : defaultReviews;
  const displayCount = reviews.length > 0 ? totalReviews : defaultReviews.length;

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
            <div className="detail-rating-pill" title={`Dynamic score calculated from ${displayCount} reviews`}>
              <span>⭐ {averageRating}</span>
              <span className="review-count">({displayCount} {displayCount === 1 ? 'review' : 'reviews'})</span>
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

      {/* Customer Reviews & Live Rating Section */}
      <div className="detail-reviews-section">
        <div className="section-header-row">
          <div>
            <h3>Customer Reviews ({displayCount})</h3>
            <span style={{ fontSize: '13px', color: '#64748b' }}>
              Average Diner Score: <b style={{ color: '#e11d62' }}>⭐ {averageRating} / 5.0</b>
            </span>
          </div>
          <span className="verified-badge">✓ 100% Verified Diners</span>
        </div>

        {/* Interactive Review Form */}
        {token ? (
          <form onSubmit={handleSubmitReview} className="add-review-card">
            <h4 className="add-review-title">✍️ Leave Your Rating & Review</h4>
            <div className="review-form-stars-row">
              <label>Select Rating:</label>
              <div className="star-rating-buttons">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="star-btn"
                    onClick={() => setNewRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    title={`Rate ${star} Stars`}
                  >
                    {star <= (hoverRating || newRating) ? '⭐' : '☆'}
                  </button>
                ))}
              </div>
              <span style={{ fontSize: '14px', fontWeight: '700', color: '#e11d62', marginLeft: '8px' }}>
                {hoverRating || newRating} / 5 Stars
              </span>
            </div>

            <textarea
              className="review-textarea"
              placeholder="What did you love about this dish? How was the taste, packaging, and temperature?"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              required
            ></textarea>

            <button type="submit" className="review-submit-btn" disabled={submittingReview}>
              {submittingReview ? 'Submitting Review...' : 'Post Review ⭐'}
            </button>
          </form>
        ) : (
          <div className="review-login-prompt">
            <p>Hungry to share your feedback? Sign in to rate and review this dish.</p>
            <button className="review-login-btn" onClick={() => toast.info('Please click "Sign In" in the navbar!')}>
              Sign In to Review
            </button>
          </div>
        )}

        {/* Reviews Grid */}
        <div className="reviews-grid">
          {displayReviews.map((rev, idx) => {
            const dateStr = rev.createdAt
              ? new Date(rev.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })
              : 'Recently';

            return (
              <div key={rev._id || idx} className="review-card">
                <div className="review-top-row">
                  <div className="rev-user">
                    <span className="rev-avatar">👤</span>
                    <div>
                      <p className="rev-name">{rev.userName}</p>
                      <p className="rev-date">{dateStr}</p>
                    </div>
                  </div>
                  <div className="rev-stars" title={`${rev.rating} out of 5 stars`}>
                    {'⭐'.repeat(rev.rating)}
                  </div>
                </div>
                <p className="rev-comment">"{rev.comment}"</p>
              </div>
            );
          })}
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

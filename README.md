# 🍕 Tomato — Full-Stack Food Delivery Web Application

A full-stack, responsive food ordering application built with **React**, **Node.js**, **Express**, **MongoDB Atlas**, and **Stripe**. Designed for fast ordering, category filtering, cart management, and seamless payments.

---

## 🚀 Live Demo & Links
- **Frontend App (Live):** [https://food-delivery-web-app-tau.vercel.app/](https://food-delivery-web-app-tau.vercel.app/)
- **Backend API (Render):** [https://food-del-backend-ihmv.onrender.com/](https://food-del-backend-ihmv.onrender.com/)
- **GitHub Repository:** [https://github.com/Dharamvirr/Food-Delivery-Web-App](https://github.com/Dharamvirr/Food-Delivery-Web-App)

---

## ✨ Features

- 🎬 **Cinematic App Entrance:** Smooth animated splash loader ("Tomato.") with silk-fade curtain reveal for a memorable first impression.
- 🤖 **Chef Tomato AI Assistant:** Smart craving-based conversational bot with mouth-watering English descriptions and 1-click cart addition.
- 🔍 **Live Search & Filter Modal:** Instant keyword search with category badges and 🌱 pure veg toggle.
- 🍽️ **Product Detail Page (`/food/:id`):** Full dish showcase with dietary badges, calories, prep time, ingredients, customer reviews, and recommended pairings.
- 🛒 **Dynamic Floating Island Cart:** Sleek pill bar tracking your order items & total anywhere on the page.
- 🍔 **Interactive Menu & Category Filtering:** Explore salads, rolls, desserts, sandwiches, pasta, noodles, and pure veg dishes.
- 🛒 **Modern Cart & Checkout:** Free delivery progress bar (₹400 threshold), promo code support (`TOMATO50`, `WELCOME`), and celebratory confetti bursts.
- 🔐 **JWT Authentication:** Secure user registration, password hashing with bcrypt, and token-based sessions.
- 💳 **Dual Checkout Methods:**
  - **Online Payment:** Secure checkout powered by **Stripe**.
  - **Cash on Delivery (COD):** 1-click test checkout with instant confirmation.
- 📦 **Real-Time Order Tracking:** 4-stage visual progress stepper (`Confirmed` ➔ `Preparing` ➔ `Out for Delivery` ➔ `Delivered`).
- 📱 **Fully Responsive UI:** Optimized for desktop, tablet, and mobile devices.

---

## 🛠️ Tech Stack

### Frontend
- **React 19** + **Vite**
- **React Router v7**
- **Axios** (API integration)
- **React-Toastify** (Modern notification alerts)

### Backend
- **Node.js** + **Express 5**
- **MongoDB Atlas** + **Mongoose ODM**
- **Stripe API** (Online payment gateway)
- **JSON Web Token (JWT)** & **Bcrypt** (Auth & Security)

---

## 📂 Project Structure

```
├── backend/
│   ├── config/          # MongoDB connection configuration
│   ├── controllers/     # Food, User, Cart, Order controllers
│   ├── middleware/      # Auth middleware (JWT verification)
│   ├── models/          # Mongoose schemas (Food, User, Order)
│   ├── routes/          # Express route definitions
│   ├── uploads/         # Food dish images
│   ├── seed.js          # Database seeder for 32 dishes
│   └── server.js        # Server entry point
│
├── frontend/
│   ├── public/          # Static assets & favicon
│   ├── src/
│   │   ├── assets/      # Icons, images, fallback catalog
│   │   ├── components/  # Navbar, Header, FoodDisplay, Footer, etc.
│   │   ├── context/     # Global StoreContext (Cart, Auth, State)
│   │   ├── pages/       # Home, Cart, PlaceOrder, MyOrders, Verify
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── vite.config.js
└── README.md
```

---

## ⚙️ Getting Started Locally

### 1. Clone the repository
```bash
git clone https://github.com/Dharamvirr/Food-Delivery-Web-App.git
cd Food-Delivery-Web-App
```

### 2. Configure Backend
Create `backend/.env`:
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
STRIPE_SECRET_KEY=your_stripe_secret_key
PORT=4000
FRONTEND_URL=http://localhost:5173
```

Install dependencies & seed products:
```bash
cd backend
npm install
node seed.js      # Seeds 32 realistic restaurant dishes into MongoDB
npm run server    # Starts server at http://localhost:4000
```

### 3. Configure Frontend
Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:4000
```

Install dependencies & start client:
```bash
cd ../frontend
npm install
npm run dev       # Starts Vite dev server at http://localhost:5173
```

---

## 👨‍💻 Author & Contact

**Dharamvir Singh**  
- **Email:** [dharamvir78914@gmail.com](mailto:dharamvir78914@gmail.com)  
- **Phone:** [+91-6350113604](tel:+916350113604)  
- **Portfolio:** [https://dharamvir-singh.vercel.app](https://dharamvir-singh.vercel.app)  
- **GitHub:** [@Dharamvirr](https://github.com/Dharamvirr)  

---

## 📄 License
This project is open-source and available under the ISC License.

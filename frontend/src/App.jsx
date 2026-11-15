import React, { useState } from "react";
import Navbar from "./components/Navbar/Navbar.jsx";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home/Home";
import Cart from "./pages/Cart/Cart";
import PlaceOrder from "./pages/PlaceOrder/PlaceOrder";
import Footer from "./components/Footer/Footer.jsx";
import LoginPopup from "./components/LoginPopup/LoginPopup.jsx";
import Verify from "./pages/Verify/Verify.jsx";
import MyOrders from "./pages/MyOrders/MyOrders.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import FoodDetail from "./pages/FoodDetail/FoodDetail.jsx";
import FloatingCart from "./components/FloatingCart/FloatingCart.jsx";
import AIChatBot from "./components/AIChatBot/AIChatBot.jsx";

const App = () => {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      {showLogin ? <LoginPopup setShowLogin={setShowLogin} /> : null}

      {/* Full-width sticky header for edge-to-edge smoothness */}
      <Navbar setShowLogin={setShowLogin} />

      <div className="app">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/order" element={<PlaceOrder />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/myorders" element={<MyOrders />} />
          <Route path="/food/:id" element={<FoodDetail />} />
        </Routes>
      </div>

      <FloatingCart />
      <AIChatBot />
      <Footer />
    </>
  );
};

export default App;

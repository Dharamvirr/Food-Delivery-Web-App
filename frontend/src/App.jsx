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
import FloatingActions from "./components/FloatingActions/FloatingActions.jsx";
import PageLoader from "./components/PageLoader/PageLoader.jsx";
import GlitterParticles from "./components/GlitterParticles/GlitterParticles.jsx";

const App = () => {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <>
      <GlitterParticles />
      <div className="diwali-fairy-lights-streamer" />
      <PageLoader />
      <ToastContainer />
      {showLogin ? <LoginPopup setShowLogin={setShowLogin} /> : <></>}

      <div className="app">
        <Navbar setShowLogin={setShowLogin}/>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/order" element={<PlaceOrder />} />
          <Route path="/verify" element={<Verify></Verify>} />
          <Route path="/myorders" element={<MyOrders/>} />
          <Route path="/food/:id" element={<FoodDetail />} />
        </Routes>
      </div>
      <FloatingCart />
      <FloatingActions />
      <Footer />
    </>
  );
};

export default App;

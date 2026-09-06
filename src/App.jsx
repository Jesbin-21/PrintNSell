import LoginPage from "./pages/LoginPage";
import Home from "./pages/Home";
import Header from "./components/Header";
import SellerOrders from "./pages/sellerOrders/SellerOrders";
import Seller from "./pages/Seller";
import AllProducts from "./pages/AllProducts";
import Cart from "./pages/cart";
import ProductInfo from "./components/productInfo";
import { Routes, Route } from "react-router-dom";
import About from "./pages/About";
import Checkout from "./pages/checkout/Checkout";
import Profile from "./pages/profile/Profile";
import Order from "./pages/order/Order";
import React, { useEffect, useRef, useState } from "react";
import Lenis from "@studio-freight/lenis";
import "./App.css";

function App() {
  const lenis = useRef(null);
  const [showScroll, setShowScroll] = useState(true);

  useEffect(() => {
    lenis.current = new Lenis({
      duration: 0.6,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      smooth: true,
      smoothTouch: true,
    });

    function animate(time) {
      lenis.current.raf(time);
      requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);

    return () => {
      lenis.current.destroy();
    };
  }, []);

  useEffect(() => {
    const checkScroll = () => {
      const scrollTop = window.scrollY;
      const viewportHeight = window.innerHeight;
      const pageHeight = document.documentElement.scrollHeight;

      const reachedBottom =
        scrollTop + viewportHeight >= pageHeight - 5;

      setShowScroll(!reachedBottom);
    };

    window.addEventListener("scroll", checkScroll);

    checkScroll();

    return () => {
      window.removeEventListener("scroll", checkScroll);
    };
  }, []);

  return (
    <>
      <Header />

      <main className="pages">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/seller" element={<Seller />} />
          <Route path="/about" element={<About />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/ShowCase" element={<AllProducts />} />
          <Route path="/ProductInfo/:id" element={<ProductInfo />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/orders" element={<Order />} />
          <Route
  path="/seller/orders"
  element={<SellerOrders />}
/>
        </Routes>
      </main>

      {showScroll && (
        <div className="scrolldown">
          <div className="chevrons">
            <div className="chevrondown"></div>
            <div className="chevrondown"></div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
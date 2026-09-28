import "./Header.css";
import { Store, LogOut, Menu, ShoppingCart, ClipboardClock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Button from "./Button";

function Header() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [newOrderCount, setNewOrderCount] = useState(0);

  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    setNewOrderCount(0);
    navigate("/login");
  };

  useEffect(() => {
    if (!token) {
      setNewOrderCount(0);
      return;
    }

    const fetchNewOrderCount = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/seller/orders/new-count`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await res.json();
        if (data.success && typeof data.count === "number") {
          setNewOrderCount(data.count);
        }
      } catch (err) {
        // Silently ignore network errors
      }
    };

    fetchNewOrderCount();

    // Check for incoming orders every 10 seconds
    const interval = setInterval(fetchNewOrderCount, 10000);

    // Also update when user switches back to this tab or order status updates
    window.addEventListener("focus", fetchNewOrderCount);
    window.addEventListener("orderStatusUpdated", fetchNewOrderCount);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", fetchNewOrderCount);
      window.removeEventListener("orderStatusUpdated", fetchNewOrderCount);
    };
  }, [token]);

  return (
    <div className="header">
      <h1>#3D</h1>

      <ul>
        <li onClick={() => navigate("/")}>Home</li>

        <li onClick={() => navigate("/ShowCase")}>
          Explore
        </li>

        <li
          onClick={() => {
            navigate("/about");
            console.log("ABOUT CLICKED");
          }}
        >
          About
        </li>

        <li
          className="seller-nav-item"
          onClick={() => navigate("/seller")}
        >
          Seller
          {newOrderCount > 0 && (
            <span
              className="seller-order-badge"
              title={`${newOrderCount} new order${newOrderCount > 1 ? "s" : ""}`}
            >
              {newOrderCount > 99 ? "99+" : newOrderCount}
            </span>
          )}
        </li>
      </ul>

      <div className="header-options">
        <div
          className="dropdown"
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          <button className="menu-btn">
            <Menu size={30} />
          </button>

          {open && (
            <div className="dropdown-content">
              <div className="mobile-sell-wrapper">
                <Button
                  text="Sell"
                  onClick={() => navigate("/seller")}
                  variant="buy"
                  icon={<Store size={18} />}
                />
                {newOrderCount > 0 && (
                  <span className="seller-order-badge mobile-badge">
                    {newOrderCount > 99 ? "99+" : newOrderCount}
                  </span>
                )}
              </div>

              <Button
                text="My Orders"
                onClick={() => navigate("/orders")}
                variant="buy"
                icon={<ClipboardClock size={18} />}
              />

              <Button
                text="My Cart"
                onClick={() => navigate("/cart")}
                variant="buy"
                icon={<ShoppingCart size={18} />}
              />

               <Button
                text="Profile"
                onClick={() => navigate("/profile")}
                variant="buy"
                icon={<ShoppingCart size={18} />}
              />

              {!token ? (
                <Button
                  text="Login"
                  onClick={() => navigate("/login")}
                />
              ) : (
                <Button
                  text="Logout"
                  onClick={handleLogout}
                  icon={<LogOut size={18} />}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Header;
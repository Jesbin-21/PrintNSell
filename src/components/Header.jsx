import "./Header.css";
import { Store, LogOut, Menu, ShoppingCart, ClipboardClock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Button from "./Button";

function Header() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

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

        <li onClick={() => navigate("/seller")}>
          Seller
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
              <Button
                text="Sell"
                onClick={() => navigate("/seller")}
                variant="buy"
                icon={<Store size={18} />}
              />

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
import "./cart.css";
import Button from "../components/Button";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, ShoppingCart   } from "lucide-react";

function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);

  useEffect(() => {
    getCart();
  }, []);

  async function getCart() {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (data.success) {
        setCart(data.cart);
      }
    } catch (err) {
      console.error("Failed to load cart:", err);
    }
  }

  async function updateQuantity(cartId, change) {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/cart/${cartId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          change,
        }),
      });

      const data = await res.json();

      if (data.success) {
        getCart();
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error("Failed to update quantity:", err);
    }
  }

  async function removeItem(cartId, currentQuantity) {
    // Decrementing by currentQuantity reduces quantity to 0, triggering backend deletion
    await updateQuantity(cartId, -currentQuantity);
  }

  const total = cart.reduce((sum, item) => {
    if (!item.productId) return sum;
    return sum + item.productId.price * item.quantity;
  }, 0);

  // Check if any cart item exceeds available stock or is out of stock
  const hasStockIssue = cart.some((item) => {
    const stock = Number(item.productId?.stock) || 0;
    return stock <= 0 || item.quantity > stock;
  });

  return (
    <div className="cart-page">
      <div className="cart-left">
        <div className="cart-header-title">
          <h2>My Cart</h2>
          {cart.length > 0 && <span className="cart-count-badge">{cart.length} {cart.length === 1 ? 'item' : 'items'}</span>}
        </div>

        {cart.length === 0 ? (
          <div className="cart-empty-state">
            <div className="empty-cart-icon">{<ShoppingCart size={50}/>}</div>
            <h3>Your cart is empty</h3>
            <p>Looks like you haven't added anything to your cart yet.</p>
            <Button
              text="Explore Products"
              onClick={() => navigate("/ShowCase")}
            />
          </div>
        ) : (
          cart.map((item) => {
            const product = item.productId;
            if (!product) return null;
            const stock = Number(product.stock) || 0;
            const isOutOfStock = stock <= 0;
            const isMaxReached = item.quantity >= stock;
            const exceedsStock = item.quantity > stock;

            return (
              <div className="cart-card" key={item._id}>
                <div className="cart-card-media">
                  
<img
  src={
    product.images?.[0]
      ? product.images[0].startsWith("http")
        ? product.images[0]
        : `${import.meta.env.VITE_API_URL}/${product.images[0]}`
      : "/placeholder.png"
  }
  alt={product.productName}
  loading="lazy"
/>


                </div>

                <div className="cart-info">
                  <div className="cart-item-header">
                    <h3>{product.productName}</h3>
                    <button
                      className="cart-remove-btn"
                      onClick={() => removeItem(item._id, item.quantity)}
                      title="Remove item"
                      aria-label="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <p className="cart-item-price">₹{product.price}</p>

                  <div className="cart-card-bottom">
                    <div className="quantity">
                      <button
                        className="add"
                        onClick={() => updateQuantity(item._id, -1)}
                        disabled={item.quantity <= 1}
                        title={item.quantity <= 1 ? "Minimum quantity is 1" : "Decrease"}
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>

                      <span>{item.quantity}</span>

                      <button
                        className="add"
                        onClick={() => updateQuantity(item._id, 1)}
                        disabled={isOutOfStock || isMaxReached}
                        title={
                          isOutOfStock
                            ? "Out of stock"
                            : isMaxReached
                            ? `Max available quantity reached (${stock})`
                            : "Increase"
                        }
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    <div className="cart-item-total">
                      <span className="cart-total-label">Total:</span>
                      <h4>₹{product.price * item.quantity}</h4>
                    </div>
                  </div>

                  {isOutOfStock && (
                    <span className="cart-stock-badge out-of-stock">
                      Out of Stock
                    </span>
                  )}
                  {!isOutOfStock && exceedsStock && (
                    <span className="cart-stock-badge warning">
                      Only {stock} available in stock!
                    </span>
                  )}
                  {!isOutOfStock && !exceedsStock && isMaxReached && (
                    <span className="cart-stock-hint">
                      Max available stock selected ({stock})
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {cart.length > 0 && (
        <div className="cart-summary">
          <h2>Price Summary</h2>

          <div className="cart-summary-row">
            <span>Items</span>
            <span>{cart.length}</span>
          </div>

          <div className="cart-summary-row">
            <span>Subtotal</span>
            <span>₹{total}</span>
          </div>

          <div className="cart-summary-row">
            <span>Shipping</span>
            <span className="cart-free-shipping">Free</span>
          </div>

          <hr />

          <div className="cart-total-box">
            <span>Total</span>
            <h2>₹{total}</h2>
          </div>

          {hasStockIssue && (
            <p className="cart-error-message">
              ⚠️ Please adjust item quantities to match available stock before checkout.
            </p>
          )}

          <Button
            text="Checkout"
            variant=""
            onClick={() => navigate("/checkout")}
            disabled={hasStockIssue}
          />
        </div>
      )}
    </div>
  );
}

export default Cart;

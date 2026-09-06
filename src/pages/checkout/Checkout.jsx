import "./Checkout.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Wallet, CreditCard, Lock} from "lucide-react";

// Helper function to reliably load Razorpay checkout.js script
function loadRazorpayScript() {
  return new Promise((resolve) => {
    // 1. If Razorpay is already available on window, resolve immediately
    if (typeof window !== "undefined" && window.Razorpay) {
      resolve(true);
      return;
    }

    // 2. If a script element was already added, attach listener or resolve
    const existingScript = document.getElementById("razorpay-checkout-script");
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(!!window.Razorpay));
      existingScript.addEventListener("error", () => resolve(false));
      if (window.Razorpay) {
        resolve(true);
      }
      return;
    }

    // 3. Create and append the script element
    const script = document.createElement("script");
    script.id = "razorpay-checkout-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(!!window.Razorpay);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function Checkout() {
  const navigate = useNavigate();

  const [cart, setCart] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);

  const [paymentMethod, setPaymentMethod] = useState("COD");

  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);

  // ==========================================
  // GET CHECKOUT DATA
  // ==========================================
  useEffect(() => {
    getCheckoutData();
  }, []);

  async function getCheckoutData() {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const [cartRes, addressRes] = await Promise.all([
        fetch("http://localhost:5000/cart", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),

        fetch("http://localhost:5000/addresses", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      const cartData = await cartRes.json();
      const addressData = await addressRes.json();

      if (cartData.success) {
        setCart(cartData.cart);
      } else {
        alert(cartData.message);
      }

      if (addressData.success) {
        setAddresses(addressData.addresses);

        const defaultAddress = addressData.addresses.find(
          (address) => address.isDefault
        );

        if (defaultAddress) {
          setSelectedAddress(defaultAddress._id);
        } else if (addressData.addresses.length > 0) {
          setSelectedAddress(addressData.addresses[0]._id);
        }
      } else {
        alert(addressData.message);
      }

      setLoading(false);
    } catch (error) {
      console.log("CHECKOUT DATA ERROR:", error);
      setLoading(false);
    }
  }

  // ==========================================
  // TOTAL
  // ==========================================
  const total = cart.reduce((sum, item) => {
    const product = item.productId;
    if (!product) return sum;
    return sum + product.price * item.quantity;
  }, 0);

  // ==========================================
  // STOCK CHECK
  // ==========================================
  const hasStockIssue = cart.some((item) => {
    const stock = Number(item.productId?.stock) || 0;
    return stock <= 0 || item.quantity > stock;
  });

  // ==========================================
  // PLACE ORDER (COD & ONLINE)
  // ==========================================
  async function placeOrder() {
    if (!selectedAddress) {
      alert("Please select a delivery address");
      return;
    }

    if (cart.length === 0) {
      alert("Your cart is empty");
      return;
    }

    if (hasStockIssue) {
      alert(
        "Some items in your cart exceed available stock. Please return to the cart and update quantities."
      );
      return;
    }

    if (!paymentMethod) {
      alert("Please select a payment method");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    // ==========================================
    // FLOW 1: CASH ON DELIVERY (COD)
    // ==========================================
    if (paymentMethod === "COD") {
      setPlacingOrder(true);

      try {
        const res = await fetch("http://localhost:5000/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            addressId: selectedAddress,
            paymentMethod: "COD",
          }),
        });

        const data = await res.json();

        if (data.success) {
          alert("Order placed successfully 🎉");
          navigate("/orders");
        } else {
          alert(data.message || "Failed to place order");
        }
      } catch (error) {
        console.log("COD ORDER ERROR:", error);
        alert("Something went wrong while placing the COD order: " + (error.message || "Network error"));
      } finally {
        setPlacingOrder(false);
      }

      return;
    }

    // ==========================================
    // FLOW 2: ONLINE PAYMENT (RAZORPAY TEST MODE)
    // ==========================================
    if (paymentMethod === "ONLINE") {
      setPlacingOrder(true);

      try {
        // Step A: Load Razorpay SDK script
        const isLoaded = await loadRazorpayScript();
        if (!isLoaded || typeof window.Razorpay !== "function") {
          alert(
            "Failed to load Razorpay SDK. If you are using an ad-blocker or Brave Shields, please disable it and refresh."
          );
          setPlacingOrder(false);
          return;
        }

        // Step B: Ask backend to create a Razorpay Test Order
        const orderRes = await fetch("http://localhost:5000/payment/create-order", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const orderData = await orderRes.json();

        if (!orderData.success) {
          alert(orderData.message || "Failed to create payment order");
          setPlacingOrder(false);
          return;
        }

        if (!orderData.keyId || !orderData.razorpayOrderId) {
          alert(
            "Payment configuration error: Missing Key ID or Order ID from backend response. Please check RAZORPAY_KEY_ID in backend/.env."
          );
          setPlacingOrder(false);
          return;
        }

        // Find selected address to prefill user details in modal
        const addressObj = addresses.find((addr) => addr._id === selectedAddress);

        // Step C: Configure Razorpay Options
        const options = {
          key: orderData.keyId, // Razorpay Test Key ID from backend
          amount: orderData.amount, // in paise
          currency: orderData.currency || "INR",
          name: "PrintNSell",
          description: "Test Mode Payment",
          order_id: orderData.razorpayOrderId,

          // Triggered when payment succeeds in the Razorpay popup
          handler: async function (response) {
            try {
              // Step D: Send payment details to backend to verify signature & create order
              const verifyRes = await fetch("http://localhost:5000/payment/verify", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  addressId: selectedAddress,
                }),
              });

              const verifyData = await verifyRes.json();

              if (verifyData.success) {
                alert("Payment successful! Order placed 🎉");
                navigate("/orders");
              } else {
                alert(verifyData.message || "Payment verification failed");
              }
            } catch (err) {
              console.log("PAYMENT VERIFY FETCH ERROR:", err);
              alert("Payment verification request failed: " + (err.message || "Network error"));
            } finally {
              setPlacingOrder(false);
            }
          },

          prefill: {
            name: addressObj ? addressObj.name : "",
            contact: addressObj ? addressObj.phone : "",
          },

          theme: {
            color: "#2563eb",
          },

          modal: {
            ondismiss: function () {
              setPlacingOrder(false);
            },
          },
        };

        // Step E: Open the Razorpay Payment Gateway Popup
        const paymentModal = new window.Razorpay(options);

        paymentModal.on("payment.failed", function (response) {
          console.log("RAZORPAY PAYMENT FAILED:", response.error);
          alert(
            "Payment failed: " +
              (response.error?.description || response.error?.reason || "Payment declined")
          );
          setPlacingOrder(false);
        });

        paymentModal.open();
      } catch (error) {
        console.log("ONLINE PAYMENT ERROR:", error);
        alert(
          "Payment Initialization Error: " +
            (error.message || "Something went wrong while initiating online payment")
        );
        setPlacingOrder(false);
      }
    }
  }

  // ==========================================
  // LOADING
  // ==========================================
  if (loading) {
    return <div className="checkout-loading">Loading checkout...</div>;
  }

  // ==========================================
  // PAGE
  // ==========================================
  return (
    <div className="checkout-page">
      {/* LEFT SIDE */}
      <div className="checkout-left">
        {/* TITLE */}
        <div className="checkout-title">
          <h1>Checkout</h1>
          <p>Complete your order</p>
        </div>

        {/* ADDRESS */}
        <div className="checkout-section">
          <div className="checkout-section-header">
            <div>
              <h2>Delivery Address</h2>
              <p>Select where you want your order delivered</p>
            </div>

            <button
              className="add-new-address"
              onClick={() => navigate("/profile")}
            >
              + Add Address
            </button>
          </div>

          {addresses.length === 0 ? (
            <div className="no-address">
              <div className="no-address-icon">📍</div>
              <h3>No address found</h3>
              <p>Add a delivery address before placing your order.</p>
              <button onClick={() => navigate("/profile")}>Add Address</button>
            </div>
          ) : (
            <div className="checkout-addresses">
              {addresses.map((address) => (
                <div
                  key={address._id}
                  className={`checkout-address ${
                    selectedAddress === address._id ? "selected" : ""
                  }`}
                  onClick={() => setSelectedAddress(address._id)}
                >
                  <div className="address-radio">
                    <div
                      className={`radio ${
                        selectedAddress === address._id ? "radio-active" : ""
                      }`}
                    >
                      {selectedAddress === address._id && <div />}
                    </div>
                  </div>

                  <div className="address-content">
                    <div className="address-top">
                      <strong>{address.name}</strong>

                      {address.type && (
                        <span className="address-label">{address.type}</span>
                      )}

                      {address.isDefault && (
                        <span className="default-label">Default</span>
                      )}
                    </div>

                    <p>{address.phone}</p>
                    <p>{address.address}</p>
                    <p>
                      {address.city}, {address.state} - {address.pincode}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* PAYMENT METHOD */}
        <div className="checkout-section">
          <h2>Payment Method</h2>
          <p className="payment-description">Choose how you want to pay</p>

          <div className="payment-methods">
            {/* COD */}
            <div
              className={`payment-option ${
                paymentMethod === "COD" ? "selected" : ""
              }`}
              onClick={() => setPaymentMethod("COD")}
            >
              <div className="payment-radio">
                <div
                  className={`radio ${
                    paymentMethod === "COD" ? "radio-active" : ""
                  }`}
                >
                  {paymentMethod === "COD" && <div />}
                </div>
              </div>

              <div className="payment-icon">{<Wallet/>}</div>

              <div>
                <strong>Cash on Delivery</strong>
                <p>Pay when your order arrives</p>
              </div>
            </div>

            {/* ONLINE PAYMENT */}
            <div
              className={`payment-option ${
                paymentMethod === "ONLINE" ? "selected" : ""
              }`}
              onClick={() => setPaymentMethod("ONLINE")}
            >
              <div className="payment-radio">
                <div
                  className={`radio ${
                    paymentMethod === "ONLINE" ? "radio-active" : ""
                  }`}
                >
                  {paymentMethod === "ONLINE" && <div />}
                </div>
              </div>

              <div className="payment-icon">{<CreditCard/>}</div>

              <div>
                <strong>Online Payment</strong>
                <p>Pay securely using UPI, card or net banking (Test Mode)</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="checkout-right">
        <div className="order-summary">
          <h2>Order Summary</h2>

          {/* PRODUCTS */}
          <div className="checkout-products">
            {cart.map((item) => {
              const product = item.productId;
              if (!product) return null;

              const stock = Number(product.stock) || 0;
              const isOutOfStock = stock <= 0;
              const exceedsStock = item.quantity > stock;

              return (
                <div className="checkout-product" key={item._id}>
                  {product.images?.[0] ? (
                    <img
                      src={`http://localhost:5000/${product.images[0]}`}
                      alt={product.productName}
                    />
                  ) : (
                    <div className="no-product-image">No Image</div>
                  )}

                  <div className="checkout-product-info">
                    <h3>{product.productName}</h3>
                    <p>
                      ₹{product.price} × {item.quantity}
                    </p>

                    {isOutOfStock && (
                      <span
                        style={{
                          color: "#f43f5e",
                          fontSize: "12px",
                          fontWeight: "600",
                        }}
                      >
                        Out of stock
                      </span>
                    )}

                    {!isOutOfStock && exceedsStock && (
                      <span
                        style={{
                          color: "#f59e0b",
                          fontSize: "12px",
                          fontWeight: "600",
                        }}
                      >
                        Only {stock} available
                      </span>
                    )}

                    <strong>₹{product.price * item.quantity}</strong>
                  </div>
                </div>
              );
            })}
          </div>

          {/* PRICE DETAILS */}
          <div className="price-details">
            <div>
              <span>Items</span>
              <span>{cart.length}</span>
            </div>

            <div>
              <span>Subtotal</span>
              <span>₹{total}</span>
            </div>

            <div>
              <span>Shipping</span>
              <span className="free">Free</span>
            </div>
          </div>

          {/* TOTAL */}
          <div className="total-row">
            <strong>Total</strong>
            <strong>₹{total}</strong>
          </div>

          {/* STOCK WARNING */}
          {hasStockIssue && (
            <p
              style={{
                color: "#f43f5e",
                fontSize: "13px",
                margin: "10px 0 0",
                textAlign: "center",
              }}
            >
              ⚠️ Stock limit exceeded. Please update cart.
            </p>
          )}

          {/* PLACE ORDER BUTTON */}
          <button
            className="place-order"
            onClick={placeOrder}
            disabled={
              placingOrder ||
              !selectedAddress ||
              !paymentMethod ||
              cart.length === 0 ||
              hasStockIssue
            }
          >
            {placingOrder
              ? "Processing..."
              : paymentMethod === "ONLINE"
              ? "Pay Online"
              : "Place Order"}
          </button>

          <p className="secure-checkout">
            {<Lock/>}Your order is securely processed
          </p>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
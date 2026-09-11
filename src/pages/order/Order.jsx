import "./Order.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Star, MessageSquare, Pencil, CheckCircle2 } from "lucide-react";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState({}); // { `${orderId}_${productId}`: review }
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null); // Track item currently processing cancel/deliver
  
  // Review form states
  const [activeReviewForms, setActiveReviewForms] = useState({}); // { `${orderId}_${productId}`: { rating, comment, hoverRating } }
  const [submittingReviewKey, setSubmittingReviewKey] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchOrdersAndReviews();
  }, []);

  // ==========================================
  // GET ORDERS & REVIEWS
  // ==========================================
  async function fetchOrdersAndReviews() {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const [ordersRes, reviewsRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${import.meta.env.VITE_API_URL}/reviews/user`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const ordersData = await ordersRes.json();
      const reviewsData = await reviewsRes.json();

      if (ordersData.success) {
        setOrders(ordersData.orders);
      } else {
        alert(ordersData.message || "Failed to load orders");
      }

      if (reviewsData.success && Array.isArray(reviewsData.reviews)) {
        const revMap = {};
        reviewsData.reviews.forEach((rev) => {
          const key = `${rev.orderId}_${rev.productId}`;
          revMap[key] = rev;
        });
        setReviews(revMap);
      }
    } catch (error) {
      console.error("FETCH ORDERS / REVIEWS ERROR:", error);
    } finally {
      setLoading(false);
    }
  }

  // ==========================================
  // CANCEL ORDER PRODUCT
  // ==========================================
  async function cancelOrder(orderId, productId) {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to cancel this item?"
    );

    if (!confirmed) {
      return;
    }

    setActionId(productId);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/orders/${orderId}/product/${productId}/cancel`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (data.success) {
        alert(data.message || "Order item cancelled successfully.");
        fetchOrdersAndReviews();
      } else {
        alert(data.message || "Failed to cancel order");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to cancel order");
    } finally {
      setActionId(null);
    }
  }

  // ==========================================
  // BUYER CONFIRM DELIVERY
  // ==========================================
  async function confirmDelivery(orderId, productId) {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    const confirmed = window.confirm(
      "Have you received this item in good condition?"
    );

    if (!confirmed) {
      return;
    }

    setActionId(productId);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/orders/${orderId}/product/${productId}/deliver`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (data.success) {
        alert("Delivery confirmed successfully 🎉");
        fetchOrdersAndReviews();
      } else {
        alert(data.message || "Failed to confirm delivery");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to confirm delivery");
    } finally {
      setActionId(null);
    }
  }

  // ==========================================
  // REVIEW FORM HANDLERS
  // ==========================================
  function startReview(orderId, productId, existingReview) {
    const key = `${orderId}_${productId}`;
    setActiveReviewForms((prev) => ({
      ...prev,
      [key]: {
        rating: existingReview ? existingReview.rating : 5,
        comment: existingReview ? existingReview.comment : "",
        hoverRating: 0,
        isOpen: true,
      },
    }));
  }

  function cancelReviewForm(orderId, productId) {
    const key = `${orderId}_${productId}`;
    setActiveReviewForms((prev) => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
  }

  function setFormRating(orderId, productId, rating) {
    const key = `${orderId}_${productId}`;
    setActiveReviewForms((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        rating,
      },
    }));
  }

  function setFormHoverRating(orderId, productId, hoverRating) {
    const key = `${orderId}_${productId}`;
    setActiveReviewForms((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        hoverRating,
      },
    }));
  }

  function setFormComment(orderId, productId, comment) {
    const key = `${orderId}_${productId}`;
    setActiveReviewForms((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        comment,
      },
    }));
  }

  async function submitReview(orderId, productId) {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const key = `${orderId}_${productId}`;
    const formData = activeReviewForms[key];

    if (!formData || !formData.rating) {
      alert("Please select a star rating");
      return;
    }

    setSubmittingReviewKey(key);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderId,
          productId,
          rating: formData.rating,
          comment: formData.comment,
        }),
      });

      const data = await res.json();

      if (data.success) {
        // Save review in local state
        setReviews((prev) => ({
          ...prev,
          [key]: data.review,
        }));
        // Close review form
        cancelReviewForm(orderId, productId);
        alert("Thank you! Your review has been submitted 🎉");
      } else {
        alert(data.message || "Failed to submit review");
      }
    } catch (error) {
      console.error("SUBMIT REVIEW ERROR:", error);
      alert("Failed to submit review");
    } finally {
      setSubmittingReviewKey(null);
    }
  }

  const ratingDescriptions = {
    1: "Poor",
    2: "Fair",
    3: "Good",
    4: "Very Good",
    5: "Excellent!",
  };

  // ==========================================
  // FORMAT DATE
  // ==========================================
  function formatDate(date) {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  // ==========================================
  // LOADING
  // ==========================================
  if (loading) {
    return <div className="orders-loading">Loading orders...</div>;
  }

  return (
    <div className="orders-page">
      {/* ==========================================
          HEADER
      ========================================== */}
      <div className="orders-header">
        <div>
          <h1>My Orders</h1>
          <p>Track and manage your orders & reviews</p>
        </div>

        <button onClick={() => navigate("/")} className="continue-shopping">
          Continue Shopping
        </button>
      </div>

      {/* ==========================================
          EMPTY
      ========================================== */}
      {orders.length === 0 ? (
        <div className="no-orders">
          <div className="no-orders-icon">📦</div>
          <h2>No orders yet</h2>
          <p>You haven't placed any orders yet.</p>
          <button onClick={() => navigate("/")}>Start Shopping</button>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div className="order-card" key={order._id}>
              {/* ==========================================
                  ORDER HEADER
              ========================================== */}
              <div className="order-header">
                <div>
                  <span>ORDER PLACED</span>
                  <strong>{formatDate(order.createdAt)}</strong>
                </div>

                <div>
                  <span>TOTAL</span>
                  <strong>₹{order.totalAmount}</strong>
                </div>

                <div>
                  <span>PAYMENT</span>
                  <strong>
                    {order.paymentMethod} ({order.paymentStatus})
                  </strong>
                </div>

                <div>
                  <span>ORDER ID</span>
                  <strong>#{order._id.slice(-8)}</strong>
                </div>
              </div>

              {/* ==========================================
                  PRODUCTS
              ========================================== */}
              <div className="order-products">
                {order.products.map((item) => {
                  const actualProductId = item.productId?._id || item.productId;
                  const reviewKey = `${order._id}_${actualProductId}`;
                  const existingReview = reviews[reviewKey];
                  const activeForm = activeReviewForms[reviewKey];
                  const isDelivered = item.status === "Delivered";

                  return (
                    <div className="order-product" key={item._id}>
                      
{/* PRODUCT IMAGE */}
{item.productId?.images?.[0] ? (
  <img
    src={
      item.productId.images[0].startsWith("http")
        ? item.productId.images[0]
        : `${import.meta.env.VITE_API_URL}/${item.productId.images[0]}`
    }
    alt={item.productId?.productName || "Product"}
    loading="lazy"
  />
) : (
  <div className="no-product-image">No Image</div>
)}


                      {/* PRODUCT INFO */}
                      <div className="order-product-info">
                        <div className="order-product-header">
                          <h3>
                            {item.productId?.productName || "Product unavailable"}
                          </h3>
                        </div>

                        <p>Quantity: {item.quantity}</p>
                        <p>Price: ₹{item.price}</p>

                        {/* ==========================================
                            STATUS BADGE
                        ========================================== */}
                        <div className="status-row">
                          <span
                            className={`status ${
                              item.status
                                ?.toLowerCase()
                                .replace(/\s+/g, "-") || "placed"
                            }`}
                          >
                            {item.status || "Placed"}
                          </span>
                        </div>

                        {/* ==========================================
                            1. CANCEL BUTTON (Placed / Confirmed)
                        ========================================== */}
                        {(item.status === "Placed" ||
                          item.status === "Confirmed") && (
                          <button
                            className="cancel-order-button"
                            disabled={actionId === item._id}
                            onClick={() => cancelOrder(order._id, item._id)}
                          >
                            {actionId === item._id
                              ? "Cancelling..."
                              : "Cancel Order"}
                          </button>
                        )}

                        {/* ==========================================
                            2. CONFIRM DELIVERY BUTTON (Shipped)
                        ========================================== */}
                        {item.status === "Shipped" && (
                          <button
                            className="confirm-delivery-button"
                            disabled={actionId === item._id}
                            onClick={() => confirmDelivery(order._id, item._id)}
                          >
                            {actionId === item._id
                              ? "Confirming..."
                              : "Confirm Delivery"}
                          </button>
                        )}

                        {/* ==========================================
                            3. CANCELLED MESSAGE
                        ========================================== */}
                        {item.status === "Cancelled" && (
                          <p className="order-cancelled">Cancelled</p>
                        )}

                        {/* ==========================================
                            4. DELIVERED SECTION + REVIEW INTERFACE
                        ========================================== */}
                        {isDelivered && (
                          <div className="order-delivered-container">
                            <div className="delivered-badge-row">
                              <span className="order-delivered">
                                <CheckCircle2 size={16} /> Delivered
                              </span>

                              {/* Write / Edit review trigger button if not in form mode */}
                              {!activeForm?.isOpen && (
                                <button
                                  className="review-toggle-btn"
                                  onClick={() =>
                                    startReview(
                                      order._id,
                                      actualProductId,
                                      existingReview
                                    )
                                  }
                                >
                                  {existingReview ? (
                                    <>
                                      <Pencil size={14} /> Edit Review
                                    </>
                                  ) : (
                                    <>
                                      <Star size={14} /> Rate & Review Product
                                    </>
                                  )}
                                </button>
                              )}
                            </div>

                            {/* DISPLAY EXISTING REVIEW (When not editing) */}
                            {existingReview && !activeForm?.isOpen && (
                              <div className="existing-review-box">
                                <div className="existing-review-header">
                                  <div className="review-stars-display">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <Star
                                        key={star}
                                        size={16}
                                        className={`star-icon ${
                                          star <= existingReview.rating
                                            ? "filled"
                                            : "empty"
                                        }`}
                                      />
                                    ))}
                                    <span className="rating-score">
                                      {existingReview.rating} / 5
                                    </span>
                                  </div>
                                  <span className="review-date">
                                    {formatDate(existingReview.updatedAt || existingReview.createdAt)}
                                  </span>
                                </div>

                                {existingReview.comment ? (
                                  <p className="review-comment-text">
                                    <MessageSquare size={14} className="quote-icon" />
                                    "{existingReview.comment}"
                                  </p>
                                ) : (
                                  <p className="review-comment-empty">
                                    No written comment provided.
                                  </p>
                                )}
                              </div>
                            )}

                            {/* ACTIVE REVIEW FORM (Add or Edit) */}
                            {activeForm?.isOpen && (
                              <div className="review-form-card">
                                <div className="review-form-header">
                                  <h4>
                                    {existingReview
                                      ? "Edit Your Review"
                                      : "Rate & Review This Product"}
                                  </h4>
                                  <button
                                    type="button"
                                    className="close-review-form-btn"
                                    onClick={() =>
                                      cancelReviewForm(order._id, actualProductId)
                                    }
                                  >
                                    ✕
                                  </button>
                                </div>

                                {/* STAR SELECTOR */}
                                <div className="star-rating-selector">
                                  <div className="stars-input-row">
                                    {[1, 2, 3, 4, 5].map((star) => {
                                      const isHovered =
                                        activeForm.hoverRating >= star;
                                      const isSelected =
                                        !activeForm.hoverRating &&
                                        activeForm.rating >= star;
                                      const isFilled = isHovered || isSelected;

                                      return (
                                        <button
                                          key={star}
                                          type="button"
                                          className={`star-select-btn ${
                                            isFilled ? "active" : ""
                                          }`}
                                          onMouseEnter={() =>
                                            setFormHoverRating(
                                              order._id,
                                              actualProductId,
                                              star
                                            )
                                          }
                                          onMouseLeave={() =>
                                            setFormHoverRating(
                                              order._id,
                                              actualProductId,
                                              0
                                            )
                                          }
                                          onClick={() =>
                                            setFormRating(
                                              order._id,
                                              actualProductId,
                                              star
                                            )
                                          }
                                          aria-label={`${star} Star`}
                                        >
                                          <Star
                                            size={26}
                                            className={`star-icon ${
                                              isFilled ? "filled" : "empty"
                                            }`}
                                          />
                                        </button>
                                      );
                                    })}
                                  </div>

                                  <span className="rating-label">
                                    {
                                      ratingDescriptions[
                                        activeForm.hoverRating || activeForm.rating
                                      ]
                                    }
                                  </span>
                                </div>

                                {/* COMMENT TEXTAREA */}
                                <div className="review-textarea-container">
                                  <textarea
                                    className="review-textarea"
                                    placeholder="Write your review here... How was the print quality, detail, and material finish?"
                                    value={activeForm.comment}
                                    onChange={(e) =>
                                      setFormComment(
                                        order._id,
                                        actualProductId,
                                        e.target.value
                                      )
                                    }
                                    rows={3}
                                    maxLength={800}
                                  />
                                </div>

                                {/* FORM ACTIONS */}
                                <div className="review-form-actions">
                                  <button
                                    type="button"
                                    className="review-submit-btn"
                                    disabled={submittingReviewKey === reviewKey}
                                    onClick={() =>
                                      submitReview(order._id, actualProductId)
                                    }
                                  >
                                    {submittingReviewKey === reviewKey ? (
                                      "Submitting..."
                                    ) : (
                                      <>
                                        <CheckCircle2 size={16} />
                                        {existingReview
                                          ? "Update Review"
                                          : "Submit Review"}
                                      </>
                                    )}
                                  </button>

                                  <button
                                    type="button"
                                    className="review-cancel-btn"
                                    onClick={() =>
                                      cancelReviewForm(order._id, actualProductId)
                                    }
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ==========================================
                  ADDRESS
              ========================================== */}
              <div className="order-address">
                <h3>Delivery Address</h3>
                <p>
                  <strong>{order.address?.name}</strong>
                </p>
                <p>{order.address?.phone}</p>
                <p>{order.address?.address}</p>
                <p>
                  {order.address?.city}, {order.address?.state} -{" "}
                  {order.address?.pincode}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Orders;
import { useParams } from "react-router-dom";
import { ShoppingCart, Star, MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "./Button";
import "./productInfo.css";

function ProductInfo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [selectedImage, setSelectedImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch product details
    fetch(`${import.meta.env.VITE_API_URL}/product/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.product) {
          setProduct(data.product);
          setSelectedImage(data.product.images?.[0] || "");
          const availableStock = Number(data.product.stock) || 0;
          setQuantity(availableStock > 0 ? 1 : 0);
        }
      })
      .catch((err) => console.error("Error fetching product:", err));

    // Fetch product reviews
    fetch(`${import.meta.env.VITE_API_URL}/reviews/product/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.reviews)) {
          setReviews(data.reviews);
        }
      })
      .catch((err) => console.error("Error fetching reviews:", err));
  }, [id]);

  if (!product) return <h2>Loading...</h2>;

  const stock = Number(product.stock) || 0;
  const isOutOfStock = stock <= 0;
  const hasRating = product.averageRating && product.averageRating > 0;

  async function addToCart() {
    if (isOutOfStock) {
      alert("This product is currently out of stock");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login first to add items to your cart");
      navigate("/login");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: product._id,
          quantity,
        }),
      });

      const data = await res.json();
      if (data.success) {
        navigate("/cart");
      } else {
        alert(data.message || "Failed to add to cart");
      }
    } catch (err) {
      console.error(err);
      alert("Error adding item to cart");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="product-info-container">
      <div className="product-info">
        <div className="product-card">
          <Button
            text="Back"
            variant="back-btn"
            onClick={() => navigate("/ShowCase")}
          />
          <h2>{product.productName}</h2>
          <p>{product.description}</p>
          <div className="info">
            <p>
              <strong>Category:</strong> {product.category}
            </p>
            <p>
              <strong>Material:</strong> {product.material}
            </p>

            <p>
              <strong>Dimensions:</strong>
              {product.length} × {product.width} × {product.height}{" "}
              {product.sizeUnit}
            </p>

            <p>
              <strong>Weight:</strong> {product.weight} {product.weightUnit}
            </p>

            <p>
              <strong>Surface:</strong> {product.surface}
            </p>

            <p>
              <strong>Availability:</strong>
              {isOutOfStock ? (
                <span className="stock-status out-of-stock">Out of Stock</span>
              ) : (
                <span className="stock-status in-stock">{stock} Available</span>
              )}
            </p>

            {/* PRICE & RATING SUMMARY ROW */}
            <div className="product-info-price-row">
              <h3>₹{product.price}</h3>
              <div
                className={`product-info-rating ${hasRating ? "has-rating" : "new-rating"}`}
                title={
                  product.numReviews > 0
                    ? `${product.averageRating} out of 5 stars (${product.numReviews} review${product.numReviews > 1 ? "s" : ""})`
                    : "No reviews yet"
                }
              >
                <Star
                  size={20}
                  className={`star-icon ${hasRating ? "filled" : "empty"}`}
                />
                <span className="rating-value">
                  {hasRating
                    ? Number(product.averageRating).toFixed(1)
                    : "New"}
                </span>
                {product.numReviews > 0 && (
                  <span className="rating-count">
                    ({product.numReviews} review{product.numReviews > 1 ? "s" : ""})
                  </span>
                )}
              </div>
            </div>

            <div className="back">
              <div className="quantity">
                <button
                  className="add"
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  disabled={isOutOfStock || quantity <= 1}
                  title={
                    quantity <= 1 ? "Minimum quantity is 1" : "Decrease quantity"
                  }
                >
                  -
                </button>

                <span>{isOutOfStock ? 0 : quantity}</span>

                <button
                  className="add"
                  onClick={() => setQuantity((prev) => Math.min(stock, prev + 1))}
                  disabled={isOutOfStock || quantity >= stock}
                  title={
                    quantity >= stock
                      ? "Maximum available stock reached"
                      : "Increase quantity"
                  }
                >
                  +
                </button>
              </div>
              <Button
                text={
                  isOutOfStock
                    ? "Out of Stock"
                    : loading
                      ? "Adding..."
                      : "Add To Cart"
                }
                variant={isOutOfStock ? "disabled" : "add"}
                icon={<ShoppingCart />}
                onClick={addToCart}
                disabled={isOutOfStock || loading}
              />
            </div>
          </div>
        </div>

        <div className="right">
          <div className="fullImage">
            <img
              src={`${import.meta.env.VITE_API_URL}/${selectedImage}`}
              alt={product.productName}
            />
          </div>
          <div className="image-gallery">
            {product.images?.map((image, index) => (
              <div className="imageCard" key={index}>
                <img
                  src={`${import.meta.env.VITE_API_URL}/${image}`}
                  onClick={() => setSelectedImage(image)}
                  width="300"
                  alt={`Product ${index + 1}`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CUSTOMER REVIEWS SECTION */}
      <div className="product-reviews-section">
        <div className="reviews-section-header">
          <h3>Customer Reviews ({reviews.length})</h3>
          {hasRating && (
            <div className="reviews-average-summary">
              <Star size={20} className="star-icon filled" />
              <strong>{Number(product.averageRating).toFixed(1)} / 5</strong>
              <span>Based on {product.numReviews} review{product.numReviews > 1 ? "s" : ""}</span>
            </div>
          )}
        </div>

        {reviews.length === 0 ? (
          <div className="no-reviews-box">
            <p>No reviews yet for this product. Be the first to leave a review after your order is delivered!</p>
          </div>
        ) : (
          <div className="reviews-list-grid">
            {reviews.map((rev) => (
              <div className="customer-review-card" key={rev._id}>
                <div className="customer-review-header">
                  <div className="customer-rating-stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={16}
                        className={`star-icon ${
                          star <= rev.rating ? "filled" : "empty"
                        }`}
                      />
                    ))}
                    <span className="customer-score">{rev.rating} / 5</span>
                  </div>
                  <span className="customer-review-date">
                    {new Date(rev.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>

                {rev.comment && (
                  <p className="customer-comment">
                    <MessageSquare size={14} className="comment-quote-icon" />
                    "{rev.comment}"
                  </p>
                )}

                <div className="reviewer-tag">
                  <span>Verified Buyer</span>
                  {rev.userEmail && <span>• {rev.userEmail.split("@")[0]}***</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductInfo;

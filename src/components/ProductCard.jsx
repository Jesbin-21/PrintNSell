import { useNavigate } from "react-router-dom";
import { Star } from "lucide-react";
import "./ProductCard.css";

function ProductCard({ product }) {
  const navigate = useNavigate();

  function openProduct() {
    navigate(`/ProductInfo/${product._id}`);
  }

  const hasRating = product.averageRating && product.averageRating > 0;

  return (
    <div
      className="latest-product-card"
      onClick={openProduct}
    >
      <div className="latest-product-image">
        {product.images?.[0] ? (
          <img
  src={
    product.images[0].startsWith("http")
      ? product.images[0]
      : `${import.meta.env.VITE_API_URL}/${product.images[0]}`
  }
  alt={product.productName}
/>
        ) : (
          <div className="latest-product-no-image">
            No Image
          </div>
        )}
      </div>

      <div className="latest-product-info">
        <h3>{product.productName}</h3>

        <p className="latest-product-category">
          {product.category}
        </p>

        {/* PRICE & RATING ROW (Star on right side of price) */}
        <div className="product-card-price-row">
          <strong>
            ₹{product.price}
          </strong>

          <div
            className={`product-card-rating ${hasRating ? "has-rating" : "new-rating"}`}
            title={
              product.numReviews > 0
                ? `${product.averageRating} out of 5 stars (${product.numReviews} review${product.numReviews > 1 ? "s" : ""})`
                : "No reviews yet"
            }
          >
            <Star
              size={14}
              className={`star-icon ${hasRating ? "filled" : "empty"}`}
            />
            <span className="rating-value">
              {hasRating
                ? Number(product.averageRating).toFixed(1)
                : "New"}
            </span>
            {product.numReviews > 0 && (
              <span className="rating-count">({product.numReviews})</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;

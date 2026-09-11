import { useEffect, useState } from "react";
import Button from "./Button";
import { useNavigate } from "react-router-dom";
import { Star, Search, X, ArrowUp } from "lucide-react";
import "./Showcase.css";

function ShowCase() {
  const navigate = useNavigate();

  // All products fetched from the server
  const [products, setProducts] = useState([]);

  // Search and Filter states (beginner friendly!)
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("default");

  // Scroll to top button visibility state
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/allProducts`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setProducts(data.products);
        }
      })
      .catch((err) => console.error("Error fetching all products:", err));
  }, []);

  // Monitor window scroll to show or hide the "Scroll to Top" button
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Smooth scroll back to the top of the page
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Extract unique categories from products list
  const categories = [
    "all",
    ...Array.from(
      new Set(
        products
          .map((item) => item.category?.trim())
          .filter(Boolean)
      )
    ),
  ];

  // Filter products based on search term and category
  const filteredProducts = products
    .filter((product) => {
      const cleanSearch = searchTerm.toLowerCase().trim();

      // Check if product name or description matches search
      const matchesSearch =
        !cleanSearch ||
        (product.productName || "").toLowerCase().includes(cleanSearch) ||
        (product.description || "").toLowerCase().includes(cleanSearch);

      // Check if category matches selected category
      const matchesCategory =
        selectedCategory === "all" ||
        (product.category || "").toLowerCase() === selectedCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === "price-low") {
        return Number(a.price) - Number(b.price);
      }
      if (sortBy === "price-high") {
        return Number(b.price) - Number(a.price);
      }
      if (sortBy === "rating") {
        return (Number(b.averageRating) || 0) - (Number(a.averageRating) || 0);
      }
      return 0; // Default ordering
    });

  // Reset all filters back to default
  const handleReset = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSortBy("default");
  };

  const isFiltered =
    searchTerm.trim() !== "" ||
    selectedCategory !== "all" ||
    sortBy !== "default";

  return (
    <div className="showcase-container">
      {/* SEARCH AND FILTER CONTROLS */}
      <div className="showcase-controls">
        {/* Search bar */}
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search products by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => setSearchTerm("")}
              title="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Filter & Sort Row */}
        <div className="filters-row">
          {/* Category Filter */}
          <div className="filter-group">
            <label htmlFor="category-select">Category:</label>
            <select
              id="category-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Categories</option>
              {categories
                .filter((cat) => cat !== "all")
                .map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="filter-group">
            <label htmlFor="sort-select">Sort By:</label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="default">Default</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>

          {/* Reset button if any filter is active */}
          {isFiltered && (
            <button
              type="button"
              onClick={handleReset}
              className="reset-filters-btn"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Results Count */}
        <div className="results-count">
          Showing <strong>{filteredProducts.length}</strong> of{" "}
          <strong>{products.length}</strong> products
        </div>
      </div>

      {/* PRODUCTS CARDS GRID */}
      {filteredProducts.length > 0 ? (
        <div className="showcase">
          {filteredProducts.map((product) => {
            const stock = Number(product.stock) || 0;
            const isOutOfStock = stock <= 0;
            const hasRating = product.averageRating && product.averageRating > 0;

            return (
              <div className="card" key={product._id}>
                <div className="wrapper">
                  <div className="card-image">
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
                      <div className="no-product-image">No Image</div>
                    )}
                    {isOutOfStock && (
                      <span className="showcase-badge out-of-stock">
                        Out of Stock
                      </span>
                    )}
                  </div>

                  <div className="content">
                    <h1 className="title">{product.productName}</h1>

                    <h2 className="description">
                      {product.description?.length > 40
                        ? product.description.slice(0, 40) + "..."
                        : product.description}
                    </h2>
                    <div className="tags-row">
                      <h3 className="tag">{product.category}</h3>
                      {isOutOfStock ? (
                        <span className="stock-tag out-of-stock">
                          Out of Stock
                        </span>
                      ) : stock <= 5 ? (
                        <span className="stock-tag low-stock">
                          Only {stock} left
                        </span>
                      ) : (
                        <span className="stock-tag in-stock">
                          {stock} in stock
                        </span>
                      )}
                    </div>

                    {/* PRICE & STAR RATING ROW (Star on right side of price) */}
                    <div className="showcase-price-row">
                      <h1 className="price">₹{product.price}</h1>

                      <div
                        className={`showcase-rating ${
                          hasRating ? "has-rating" : "new-rating"
                        }`}
                        title={
                          product.numReviews > 0
                            ? `${product.averageRating} out of 5 stars (${product.numReviews} review${
                                product.numReviews > 1 ? "s" : ""
                              })`
                            : "No reviews yet"
                        }
                      >
                        <Star
                          size={16}
                          className={`star-icon ${
                            hasRating ? "filled" : "empty"
                          }`}
                        />
                        <span className="rating-value">
                          {hasRating
                            ? Number(product.averageRating).toFixed(1)
                            : "New"}
                        </span>
                        {product.numReviews > 0 && (
                          <span className="rating-count">
                            ({product.numReviews})
                          </span>
                        )}
                      </div>
                    </div>

                    <Button
                      text={isOutOfStock ? "Out of Stock" : "View Details"}
                      variant={isOutOfStock ? "back-btn" : "buy"}
                      onClick={() => navigate(`/ProductInfo/${product._id}`)}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* EMPTY STATE WHEN NO CARDS MATCH */
        <div className="showcase-empty">
          <p className="empty-title">No matching products found</p>
          <p className="empty-subtitle">
            Try adjusting your search query or selecting a different category.
          </p>
          {isFiltered && (
            <button
              type="button"
              onClick={handleReset}
              className="clear-filter-btn"
            >
              Clear All Filters
            </button>
          )}
        </div>
      )}

      {/* SCROLL TO TOP BUTTON */}
      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTop}
          className="scroll-to-top-btn"
          title="Back to top"
          aria-label="Back to top"
        >
          <ArrowUp size={22} />
        </button>
      )}
    </div>
  );
}

export default ShowCase;

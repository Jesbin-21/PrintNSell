import ProductForm from "./ProductForm";
import { useState, useEffect } from "react";
import Button from "./Button";
import { useNavigate } from "react-router-dom";
import "./seller.css";

// Module-level caches for instant loading across route navigations
let cachedSellerData = null;
let cachedSellerProducts = null;

const getInitialSeller = () => {
  if (cachedSellerData && Object.keys(cachedSellerData).length > 0) {
    return cachedSellerData;
  }
  try {
    const stored = sessionStorage.getItem("cached_seller_data");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && typeof parsed === "object") {
        cachedSellerData = parsed;
        return parsed;
      }
    }
  } catch {
    // Ignore storage errors
  }
  return {};
};

const getInitialProducts = () => {
  if (cachedSellerProducts && cachedSellerProducts.length > 0) {
    return cachedSellerProducts;
  }
  try {
    const stored = sessionStorage.getItem("cached_seller_products");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        cachedSellerProducts = parsed;
        return parsed;
      }
    }
  } catch {
    // Ignore storage errors
  }
  return [];
};

function SellerDashboard() {
  const navigate = useNavigate();

  // View state: "products" or "form"
  const [view, setView] = useState("products");

  // Initialized with cache for instant display on page open
  const [seller, setSeller] = useState(getInitialSeller);
  const [products, setProducts] = useState(getInitialProducts);
  const [editProduct, setEditProduct] = useState(null);

  // DELETE PRODUCT
  const deleteProduct = async (id) => {
    console.log("Delete clicked", id);

    const token = localStorage.getItem("token");

    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/product/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();

    if (data.success) {
      setProducts((prevProducts) => {
        const updated = prevProducts.filter(
          (product) => product._id !== id
        );
        cachedSellerProducts = updated;
        try {
          sessionStorage.setItem("cached_seller_products", JSON.stringify(updated));
        } catch {
          // Ignore storage errors
        }
        return updated;
      });
    } else {
      alert(data.message);
    }
  };

  // GET SELLER
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.log("User not logged in");
      return;
    }

    fetch(`${import.meta.env.VITE_API_URL}/seller`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.message) {
          setSeller(data);
          cachedSellerData = data;
          try {
            sessionStorage.setItem("cached_seller_data", JSON.stringify(data));
          } catch {
            // Ignore storage errors
          }
        }
      })
      .catch((err) => console.log(err));
  }, []);

  // GET PRODUCTS
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.log("User not logged in");
      return;
    }

    fetch(`${import.meta.env.VITE_API_URL}/products`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProducts(data);
          cachedSellerProducts = data;
          try {
            sessionStorage.setItem("cached_seller_products", JSON.stringify(data));
          } catch {
            // Ignore storage errors
          }
        }
      })
      .catch((err) => console.log(err));
  }, []);


  const reloadProducts = async () => {
    const token = localStorage.getItem("token");

    if (!token) return;

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/products`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (Array.isArray(data)) {
        setProducts(data);
        cachedSellerProducts = data;
        try {
          sessionStorage.setItem("cached_seller_products", JSON.stringify(data));
        } catch {
          // Ignore storage errors
        }
      }
      setEditProduct(null);
      setView("products");
    } catch (err) {
      console.log(err);
    }
  };


  return (
    <div className="productContainer sellerDashboardContainer">
      {/* BANNER WITH SELLER INFO & SWITCH/ORDERS BUTTONS */}
      <div className="banner">
        <div className="image">
          <img
            src={
              seller.Image
                ? seller.Image.startsWith("http")
                  ? seller.Image
                  : `${import.meta.env.VITE_API_URL}/${seller.Image}`
                : "/default-avatar.png"
            }
            alt={seller.shopName || "Seller"}
            decoding="async"
            fetchPriority="high"
          />
        </div>

        <div className="about">
          <h1>{seller.name || "Seller Dashboard"}</h1>
          <div className="shopNameHeader">
            <p>{seller.shopName || "My Shop"}</p>
            <Button
              text="Edit"
              onClick={() => navigate("/profile")}
            />
          </div>
        </div>

        {/* ACTION BUTTONS: VIEW SWITCH BUTTON & ORDERS */}
        <div className="bannerActions">
          

          <Button
            text="Orders"
            onClick={() => navigate("/seller/orders")}
          />
        </div>
      </div>

      {/* ================= PRODUCTS VIEW ================= */}
      {view === "products" && (
        <div className="productCards">
          <div className="dashboardSectionHeader">
            <h2>Your Products ({products.length})</h2>
            <Button
              text="+ Add New Product"
              onClick={() => {
                setEditProduct(null);
                setView("form");
              }}
            />
          </div>

          {products.length === 0 ? (
            <div className="emptyProductsState">
              <p>No products added yet.</p>
              <Button
                text="Add Your First Product"
                onClick={() => {
                  setEditProduct(null);
                  setView("form");
                }}
              />
            </div>
          ) : (
            <div className="cards">
              {products.map((product) => (
                <div className="card" key={product._id}>
                  {/* PRODUCT IMAGE */}
                  <div className="cardImage">
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
  decoding="async"
/>
                  </div>

                  {/* PRODUCT INFO */}
                  <div className="cardInfo">
                    <h1>{product.productName}</h1>
                    <h2>{product.description}</h2>

                    <div className="cardPriceRow">
                      <h3>₹{product.price}</h3>
                      {Number(product.stock) <= 0 ? (
                        <span className="seller-stock out-of-stock">
                          Out of Stock
                        </span>
                      ) : (
                        <span className="seller-stock in-stock">
                          Stock: {product.stock}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* EDIT / DELETE BUTTONS */}
                  <div className="buttons">
                    <Button
                      text="Edit"
                      onClick={() => {
                        setEditProduct(product);
                        setView("form");
                      }}
                    />
                    <Button
                      text="delete"
                      variant="danger"
                      onClick={() => deleteProduct(product._id)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= PRODUCT FORM VIEW ================= */}
      {view === "form" && (
        <div className="productFormWrapper">
          <div className="formHeader">
            <Button
              text="← Back to Products"
              variant="back-btn"
              onClick={() => setView("products")}
            />
            <h2>{editProduct ? "Edit Product" : "Add New Product"}</h2>
          </div>

          <ProductForm
            reloadPage={reloadProducts}
            editProduct={editProduct}
          />
        </div>
      )}

    </div>
  );
}

export default SellerDashboard;

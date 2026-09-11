import ProductForm from "./ProductForm";
import { useState, useEffect } from "react";
import Button from "./Button";
import { useNavigate } from "react-router-dom";
import "./seller.css";

function SellerDashboard() {
  const navigate = useNavigate();

  // View state: "products" or "form"
  const [view, setView] = useState("products");

  const [seller, setSeller] = useState({});
  const [products, setProducts] = useState([]);
  const [editProduct, setEditProduct] = useState(null);

  // Shop Edit Modal state
  const [showShopEdit, setShowShopEdit] = useState(false);
  const [shopData, setShopData] = useState({ name: "", shopName: "", location: "" });
  const [shopImage, setShopImage] = useState(null);
  const [shopPreview, setShopPreview] = useState("");

  const openShopEditModal = () => {
    setShopData({
      name: seller.name || "",
      shopName: seller.shopName || "",
      location: seller.location || "",
    });
    setShopImage(null);
    setShopPreview(
      seller.Image
        ? seller.Image.startsWith("http")
          ? seller.Image
          : `${import.meta.env.VITE_API_URL}/${seller.Image}`
        : ""
    );
    setShowShopEdit(true);
  };

  const handleShopEditSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!token) return;

    try {
      const formData = new FormData();
      formData.append("name", shopData.name);
      formData.append("shopName", shopData.shopName);
      formData.append("location", shopData.location);
      if (shopImage) {
        formData.append("shopImage", shopImage);
      }

      const res = await fetch(`${import.meta.env.VITE_API_URL}/seller`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        alert("Shop profile updated successfully");
        setSeller(data.seller || {});
        setShowShopEdit(false);
      } else {
        alert(data.message || "Failed to update shop profile");
      }
    } catch (err) {
      console.log(err);
      alert("Something went wrong");
    }
  };

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
      setProducts((prevProducts) =>
        prevProducts.filter(
          (product) => product._id !== id
        )
      );
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
        console.log(data);
        setSeller(data || {});
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
        console.log(data);
        setProducts(data || []);
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

    setProducts(data || []);
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
/>
        </div>

        <div className="about">
          <h1>{seller.name || "Seller Dashboard"}</h1>
          <div className="shopNameHeader">
            <p>{seller.shopName || "My Shop"}</p>
            <Button
              text="Edit"
              onClick={openShopEditModal}
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

      {/* ================= SHOP EDIT MODAL ================= */}
      {showShopEdit && (
        <div className="sellerModalOverlay">
          <div className="sellerModalContent">
            <h2>Edit Shop Profile</h2>
            <form onSubmit={handleShopEditSubmit}>
              <div className="inputField">
                <h1>Seller Name</h1>
                <input
                  type="text"
                  value={shopData.name}
                  onChange={(e) =>
                    setShopData({ ...shopData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="inputField">
                <h1>Shop Name</h1>
                <input
                  type="text"
                  value={shopData.shopName}
                  onChange={(e) =>
                    setShopData({ ...shopData, shopName: e.target.value })
                  }
                  required
                />
              </div>

              <div className="inputField">
                <h1>Location</h1>
                <input
                  type="text"
                  value={shopData.location}
                  onChange={(e) =>
                    setShopData({ ...shopData, location: e.target.value })
                  }
                  required
                />
              </div>

              <div className="inputField">
                <h1>Shop Image</h1>
                {shopPreview && (
                  <div className="modalShopImagePreview">
                    <img src={shopPreview} alt="Shop Preview" />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setShopImage(file);
                      setShopPreview(URL.createObjectURL(file));
                    }
                  }}
                />
              </div>

              <div className="modalButtons">
                <Button type="submit" text="Save Changes" />
                <Button
                  text="Cancel"
                  variant="secondary"
                  onClick={() => setShowShopEdit(false)}
                />
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default SellerDashboard;

import "./Profile.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, CircleUser } from 'lucide-react';
import Button from "../../components/Button";


function Profile() {
  const navigate = useNavigate();

const [addresses, setAddresses] = useState([]);
const [user, setUser] = useState(null);
const [showForm, setShowForm] = useState(false);
const [editingId, setEditingId] = useState(null);

const [seller, setSeller] = useState(null);
const [showSellerForm, setShowSellerForm] = useState(false);
const [sellerData, setSellerData] = useState({ name: "", shopName: "", location: "" });
const [sellerImage, setSellerImage] = useState(null);
const [sellerPreview, setSellerPreview] = useState("");

const [address, setAddress] = useState({
  name: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  type: "Home",
});

useEffect(() => {
  getProfile();
  getAddresses();
  getSellerProfile();
}, []);

async function getProfile() {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (data.success) {
      setUser(data.user);
    } else {
      alert(data.message);
    }
  } catch (error) {
    console.log(error);
  }
}

  async function getAddresses() {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/addresses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.success) {
        setAddresses(data.addresses);
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function getSellerProfile() {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/seller`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data && data._id) {
        setSeller(data);
      } else {
        setSeller(null);
      }
    } catch (error) {
      console.log(error);
    }
  }

  function openEditSellerForm() {
    if (!seller) return;
    setSellerData({
      name: seller.name || "",
      shopName: seller.shopName || "",
      location: seller.location || "",
    });
    setSellerImage(null);
    setSellerPreview(
      seller.Image
        ? seller.Image.startsWith("http")
          ? seller.Image
          : `${import.meta.env.VITE_API_URL}/${seller.Image}`
        : ""
    );
    setShowSellerForm(true);
  }

  async function saveSellerProfile(e) {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const formData = new FormData();
      formData.append("name", sellerData.name);
      formData.append("shopName", sellerData.shopName);
      formData.append("location", sellerData.location);
      if (sellerImage) {
        formData.append("shopImage", sellerImage);
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
        alert("Seller shop profile updated successfully");
        setShowSellerForm(false);
        getSellerProfile();
      } else {
        alert(data.message || "Failed to update seller profile");
      }
    } catch (error) {
      console.log(error);
      alert("Something went wrong");
    }
  }

  async function deleteSellerProfile() {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete your seller shop profile? This action cannot be undone."
    );

    if (!confirmDelete) return;

    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/seller`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.success) {
        alert(data.message);
        setSeller(null);
        setShowSellerForm(false);
        localStorage.setItem("isSeller", "false");
      } else {
        alert(data.message || "Failed to delete seller profile");
      }
    } catch (error) {
      console.log(error);
      alert("Something went wrong");
    }
  }

  function handleChange(e) {
    setAddress({
      ...address,
      [e.target.name]: e.target.value,
    });
  }

  function openAddForm() {
    setEditingId(null);

    setAddress({
      name: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      type: "Home",
    });

    setShowForm(true);
  }

  function openEditForm(item) {
    setEditingId(item._id);

    setAddress({
      name: item.name,
      phone: item.phone,
      address: item.address,
      city: item.city,
      state: item.state,
      pincode: item.pincode,
      type: item.type,
    });

    setShowForm(true);
  }

  async function saveAddress(e) {
    e.preventDefault();

    const token = localStorage.getItem("token");

    try {
      const url = editingId
        ? `${import.meta.env.VITE_API_URL}/addresses/${editingId}`
        : `${import.meta.env.VITE_API_URL}/addresses`;

      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(address),
      });

      const data = await res.json();

      if (data.success) {
        alert(
          editingId
            ? "Address updated successfully"
            : "Address added successfully"
        );

        setShowForm(false);
        setEditingId(null);

        getAddresses();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.log(error);
      alert("Something went wrong");
    }
  }

  async function deleteAddress(id) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this address?"
    );

    if (!confirmDelete) return;

    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/addresses/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (data.success) {
        getAddresses();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function setDefault(id) {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/addresses/${id}/default`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (data.success) {
        getAddresses();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.log(error);
    }
  }

  function logout() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  return (
    <div className="profile-page">

      {/* PROFILE HEADER */}

      <div className="profile-header">
        <div className="profile-avatar">
          <CircleUser size={70} color="black"/>
        </div>

        <div>
          <h1>My Profile</h1>
          <p>Manage your account and addresses</p>
        </div>
      </div>


      {/* ACCOUNT */}

      <div className="profile-section">

        <div className="section-header">
          <h2>Account Information</h2>

          <Button
          text="My Orders" variant="myOrders"
            onClick={() => navigate("/orders")}
            className="orders-btn"
          >
            {<Box/>} My Orders
          </Button>
        </div>

        <div className="account-info">

<div>
  <span>Email</span>
  <strong>{user?.email || "Loading..."}</strong>
</div>

        </div>

      </div>


      {/* SELLER SHOP PROFILE */}

      {seller && seller._id && (
        <div className="profile-section seller-profile-section">
          <div className="section-header">
            <h2>Seller Shop Profile</h2>
            <div className="seller-profile-actions">
              <Button
                text="Edit Shop"
                onClick={openEditSellerForm}
              />
              <Button
                text="Delete Shop"
                variant="danger"
                onClick={deleteSellerProfile}
              />
            </div>
          </div>

          {!showSellerForm ? (
            <div className="seller-shop-card">
              <div className="seller-shop-avatar">
                <img
                  src={
                    seller.Image
                      ? seller.Image.startsWith("http")
                        ? seller.Image
                        : `${import.meta.env.VITE_API_URL}/${seller.Image}`
                      : "/default-avatar.png"
                  }
                  alt={seller.shopName}
                />
              </div>
              <div className="seller-shop-details">
                <div>
                  <span>Shop Name</span>
                  <strong>{seller.shopName}</strong>
                </div>
                <div>
                  <span>Seller Name</span>
                  <strong>{seller.name}</strong>
                </div>
                <div>
                  <span>Location</span>
                  <strong>{seller.location}</strong>
                </div>
              </div>
            </div>
          ) : (
            <form className="address-form seller-edit-form" onSubmit={saveSellerProfile}>
              <h3>Edit Seller Shop Profile</h3>

              <div className="seller-form-group">
                <label>Seller Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Seller Name"
                  value={sellerData.name}
                  onChange={(e) =>
                    setSellerData({ ...sellerData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="seller-form-group">
                <label>Shop Name</label>
                <input
                  type="text"
                  name="shopName"
                  placeholder="Shop Name"
                  value={sellerData.shopName}
                  onChange={(e) =>
                    setSellerData({ ...sellerData, shopName: e.target.value })
                  }
                  required
                />
              </div>

              <div className="seller-form-group">
                <label>Location</label>
                <input
                  type="text"
                  name="location"
                  placeholder="Location"
                  value={sellerData.location}
                  onChange={(e) =>
                    setSellerData({ ...sellerData, location: e.target.value })
                  }
                  required
                />
              </div>

              <div className="seller-form-group">
                <label>Shop Image</label>
                {sellerPreview && (
                  <div className="seller-preview-wrapper">
                    <img
                      src={sellerPreview}
                      alt="Shop Preview"
                    />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setSellerImage(file);
                      setSellerPreview(URL.createObjectURL(file));
                    }
                  }}
                />
              </div>

              <div className="form-buttons">
                <button type="submit" className="save-btn">
                  Save Shop Changes
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowSellerForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}


      {/* ADDRESSES */}

      <div className="profile-section">

        <div className="section-header">

          <h2>My Addresses</h2>

          <Button text="+ Add New Address" variant="addAddress"
            className="add-address"
            onClick={openAddForm}
          >
            + Add New Address
          </Button>

        </div>


        {/* ADDRESS FORM */}

        {showForm && (
          <form
            className="address-form"
            onSubmit={saveAddress}
          >

            <h3>
              {editingId
                ? "Edit Address"
                : "Add New Address"}
            </h3>

            <input
              name="name"
              placeholder="Full Name"
              value={address.name}
              onChange={handleChange}
              required
            />

            <input
              name="phone"
              placeholder="Phone Number"
              value={address.phone}
              onChange={handleChange}
              required
            />

            <textarea
              name="address"
              placeholder="House / Street / Address"
              value={address.address}
              onChange={handleChange}
              required
            />

            <div className="form-row">

              <input
                name="city"
                placeholder="City"
                value={address.city}
                onChange={handleChange}
                required
              />

              <input
                name="state"
                placeholder="State"
                value={address.state}
                onChange={handleChange}
                required
              />

              <input
                name="pincode"
                placeholder="PIN Code"
                value={address.pincode}
                onChange={handleChange}
                required
              />

            </div>


            <div className="address-type">

              <label>Address Type</label>

              <select
                name="type"
                value={address.type}
                onChange={handleChange}
              >
                <option value="Home">Home</option>
                <option value="Work">Work</option>
                <option value="Other">Other</option>
              </select>

            </div>


            <div className="form-buttons">

              <button
                type="submit"
                className="save-btn"
              >
                {editingId
                  ? "Update Address"
                  : "Save Address"}
              </button>

              <button
                type="button"
                className="cancel-btn"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>

            </div>

          </form>
        )}


        {/* ADDRESS LIST */}

        <div className="addresses">

          {addresses.length === 0 ? (

            <div className="empty-address">
              <h3>No addresses saved</h3>
              <p>Add an address for faster checkout.</p>
            </div>

          ) : (

            addresses.map((item) => (

              <div
                className="address-card"
                key={item._id}
              >

                <div className="address-card-header">

                  <div>

                    <span className="address-type">
                      {item.type}
                    </span>

                    {item.isDefault && (
                      <span className="default-badge">
                        Default
                      </span>
                    )}

                  </div>

                </div>


                <h3>{item.name}</h3>

                <p>{item.phone}</p>

                <p>{item.address}</p>

                <p>
                  {item.city}, {item.state} -{" "}
                  {item.pincode}
                </p>


                <div className="address-actions">

                  <button
                  utton
                    onClick={() =>
                      openEditForm(item)
                    }
                  >
                    Edit
                  </button>

                  <button
                    onClick={() =>
                      deleteAddress(item._id)
                    }
                  >
                    Delete
                  </button>

                  {!item.isDefault && (
                    <button
                      onClick={() =>
                        setDefault(item._id)
                      }
                    >
                      Make Default
                    </button>
                  )}

                </div>

              </div>

            ))

          )}

        </div>

      </div>


      {/* LOGOUT */}

      <div className="logout-section">

        <button
          className="logout-btn"
          onClick={logout}
        >
          🚪 Logout
        </button>

      </div>

    </div>
  );
}

export default Profile;
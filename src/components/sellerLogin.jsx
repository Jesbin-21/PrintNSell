import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "./Button";
import "./sellerLogin.css"


function SellerLogin() {
  console.log("SELLER LOGIN UPDATED");

  const [name, setName] = useState("");
  const [shopName, setShopName] = useState("");
  const [location, setLocation] = useState("");
  const [image, setImage] = useState("");
  const [preview, setPreview] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login first");
      navigate("/login");
      return;
    }

    const formData = new FormData();

    formData.append("name", name);
    formData.append("shopName", shopName);
    formData.append("location", location);
    formData.append("shopImage", image);

    const res = await fetch(`${import.meta.env.VITE_API_URL}/seller`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await res.json();

    alert(data.message);

    if (data.success) {
  localStorage.setItem("isSeller", "true");
  navigate("/seller");
}
  };

  return (
    <div className="sell-container">

      <form onSubmit={handleSubmit}>
        {
          preview && (
            <img className="preImage"
              src={preview}
              alt="preview"
              width="200"
            />
          )
        }
        <input
          type="text"
          placeholder="Name"
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="text"
          placeholder="Shop Name"
          onChange={(e) => setShopName(e.target.value)}
        />

        <input
          type="text"
          placeholder="Location"
          onChange={(e) => setLocation(e.target.value)}
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {

            const file = e.target.files[0];

            setImage(file);

            setPreview(URL.createObjectURL(file));

          }}
        />

<Button type="submit" text="Submit" /> 
     </form>
    </div>
  );
}

export default SellerLogin;

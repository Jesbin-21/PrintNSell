import SellerLogin from "../components/sellerLogin";
import SellerDashboard from "../components/SellerDashboard";
import { Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Button from "../components/Button";

function Seller() {
  const token = localStorage.getItem("token");
  const [isSeller, setIsSeller] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    fetch("http://localhost:5000/seller", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && data._id) {
          setIsSeller(true);
          localStorage.setItem("isSeller", "true");
        } else {
          setIsSeller(false);
          localStorage.setItem("isSeller", "false");
        }
      })
      .catch((err) => {
        console.error("Error verifying seller status:", err);
        setIsSeller(false);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  // User is not logged in
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return (
      <div
        className="sellerPage"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
          color: "#ffffff",
        }}
      >
        <h2>Loading seller details...</h2>
      </div>
    );
  }

  return (
    <div className="sellerPage">

      {isSeller ? <SellerDashboard /> : <SellerLogin />}
    </div>
  );
}

export default Seller;
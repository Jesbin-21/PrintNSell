
import SellerLogin from "../components/sellerLogin";
import SellerDashboard from "../components/SellerDashboard";
import { Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

function Seller() {
  const token = localStorage.getItem("token");
  const savedSeller = localStorage.getItem("isSeller");

  const [isSeller, setIsSeller] = useState(savedSeller === "true");
  const [checking, setChecking] = useState(!savedSeller);

  useEffect(() => {
    if (!token) {
      return;
    }

    fetch(`${import.meta.env.VITE_API_URL}/seller`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to check seller");
        }

        return response.json();
      })
      .then((data) => {
        const sellerExists = Boolean(data && data._id);

        setIsSeller(sellerExists);
        localStorage.setItem(
          "isSeller",
          sellerExists ? "true" : "false"
        );
      })
      .catch((error) => {
        console.error("Seller check error:", error);
      })
      .finally(() => {
        setChecking(false);
      });
  }, [token]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Only show loading when we have never checked before
  if (checking) {
    return (
      <div className="sellerPage">
        <h2>Loading...</h2>
      </div>
    );
  }

  return (
    <div className="sellerPage">
      {isSeller ? <SellerDashboard /> : <SellerLogin />}
    </div>
  );
}



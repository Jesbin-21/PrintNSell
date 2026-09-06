import "./SellerOrders.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button";

function SellerOrders() {

  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    getOrders();
  }, []);


  async function getOrders() {

    const token = localStorage.getItem("token");

    try {

      const res = await fetch(
        "http://localhost:5000/seller/orders",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (data.success) {
        setOrders(data.orders);
      } else {
        alert(data.message);
      }

    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);

    }
  }


  async function updateStatus(
    orderId,
    productId,
    status
  ) {

    const token = localStorage.getItem("token");

    try {

      const res = await fetch(
        `http://localhost:5000/seller/orders/${orderId}/product/${productId}/status`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            status,
          }),
        }
      );

      const data = await res.json();

      if (data.success) {

        getOrders();

      } else {

        alert(data.message);

      }

    } catch (error) {

      console.log(error);

      alert("Failed to update status");

    }
  }


  function getNextStatus(status) {
    switch (status) {
      case "Placed":
        return "Confirmed";

      case "Confirmed":
        return "Shipped";

      default:
        return null;
    }
  }


  if (loading) {

    return (
      <div className="seller-orders-loading">
        Loading orders...
      </div>
    );

  }


  return (

    <div className="seller-orders-page">


      {/* HEADER */}

      <div className="seller-orders-header">

        <div>

          <h1>Orders</h1>

          <p>
            Manage orders for your products
          </p>

        </div>


        <Button
          text="Back to Dashboard"
          onClick={() =>
            navigate("/seller")
          }
        />

      </div>


      {/* NO ORDERS */}

      {orders.length === 0 ? (

        <div className="seller-no-orders">

          <div>
            📦
          </div>

          <h2>
            No orders yet
          </h2>

          <p>
            You don't have any product orders.
          </p>

        </div>

      ) : (

        <div className="seller-orders-list">

          {orders.map((order) => (

            <div
              className="seller-order-card"
              key={order._id}
            >


              {/* ORDER HEADER */}

              <div className="seller-order-header">

                <div>

                  <span>
                    ORDER ID
                  </span>

                  <strong>
                    #{order._id.slice(-8)}
                  </strong>

                </div>


                <div>

                  <span>
                    ORDER DATE
                  </span>

                  <strong>
                    {new Date(
                      order.createdAt
                    ).toLocaleDateString("en-IN")}
                  </strong>

                </div>


                <div>

                  <span>
                    CUSTOMER
                  </span>

                  <strong>
                    {order.userId?.name ||
                      "Customer"}
                  </strong>

                </div>

              </div>


              {/* PRODUCTS */}

              {order.products.map((item) => {

                const nextStatus =
                  getNextStatus(item.status);

                return (

                  <div
                    className="seller-order-product"
                    key={item._id}
                  >

                    <img
                      src={
                        item.productId?.images?.[0]
                          ? `http://localhost:5000/${item.productId.images[0]}`
                          : ""
                      }
                      alt={
                        item.productId?.productName ||
                        "Product"
                      }
                    />


                    <div className="seller-product-info">

                      <h2>
                        {item.productId?.productName}
                      </h2>

                      <p>
                        Quantity: {item.quantity}
                      </p>

                      <p>
                        Price: ₹{item.price}
                      </p>


                      {/* STATUS */}

                      <div className="seller-status">

                        <span>
                          Status:
                        </span>

                        <strong
                          className={`status ${item.status.toLowerCase()}`}
                        >
                          {item.status}
                        </strong>

                      </div>


                      {/* CHANGE STATUS */}

                      {nextStatus && (

                        <Button
                          variant="primary"
                          text={
                            nextStatus === "Confirmed"
                              ? "Confirm Order"
                              : nextStatus === "Shipped"
                              ? "Mark as Shipped"
                              : nextStatus
                          }
                          className="status-button"
                          onClick={() =>
                            updateStatus(
                              order._id,
                              item._id,
                              nextStatus
                            )
                          }
                        />

                      )}


                      {/* CANCEL ORDER */}

                      {(item.status === "Placed" ||
                        item.status === "Confirmed") && (

                        <Button
                          text="Cancel Order"
                          className="cancel-order-button"
                          onClick={() =>
                            updateStatus(
                              order._id,
                              item._id,
                              "Cancelled"
                            )
                          }
                        />

                      )}


                      {/* SHIPPED (DISPATCHED) */}

                      {item.status === "Shipped" && (

                        <p
                          style={{
                            color: "#6841b5",
                            fontWeight: "600",
                            marginTop: "10px",
                          }}
                        >
                          🚚 Dispatched & on the way
                        </p>

                      )}


                      {/* COMPLETED */}

                      {item.status === "Delivered" && (

                        <p className="completed">
                          ✓ Order completed
                        </p>

                      )}


                      {/* CANCELLED */}

                      {item.status === "Cancelled" && (

                        <p className="cancelled">
                          Order cancelled
                        </p>

                      )}

                    </div>

                  </div>

                );

              })}


              {/* ADDRESS */}

              <div className="seller-order-address">

                <h3>
                  Delivery Address
                </h3>

                <p>
                  <strong>
                    {order.address?.name}
                  </strong>
                </p>

                <p>
                  {order.address?.phone}
                </p>

                <p>
                  {order.address?.address}
                </p>

                <p>
                  {order.address?.city},{" "}
                  {order.address?.state} -{" "}
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

export default SellerOrders;
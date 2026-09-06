import express from "express";
import jwt from "jsonwebtoken";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

const router = express.Router();


// ==========================================
// GET SELLER ORDERS
// ==========================================

router.get("/seller/orders", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "secretkey"
    );

    const sellerId = decoded.userId;

    const orders = await Order.find({
      "products.sellerId": sellerId,
    })
      .populate("userId", "name email")
      .populate("products.productId")
      .sort({ createdAt: -1 });


    // Only send this seller's products
    const sellerOrders = orders.map((order) => {

      const sellerProducts = order.products.filter(
        (item) =>
          item.sellerId.toString() === sellerId.toString()
      );

      return {
        ...order.toObject(),
        products: sellerProducts,
      };
    });


    res.json({
      success: true,
      orders: sellerOrders,
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "Failed to get seller orders",
    });
  }
});


// ==========================================
// UPDATE PRODUCT ORDER STATUS
// ==========================================

router.put(
  "/seller/orders/:orderId/product/:productId/status",
  async (req, res) => {
    try {

      const authHeader = req.headers.authorization;

      if (!authHeader) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }


      const token = authHeader.split(" ")[1];

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "secretkey"
      );

      const sellerId = decoded.userId;


      const {
        orderId,
        productId,
      } = req.params;


      const { status } = req.body;


      // ==========================================
      // ALLOWED STATUSES FOR SELLER
      // ==========================================

      const allowedStatuses = [
        "Placed",
        "Confirmed",
        "Shipped",
        "Cancelled",
      ];

      if (status === "Delivered") {
        return res.status(400).json({
          success: false,
          message:
            "Sellers cannot mark orders as Delivered. Only the customer can confirm delivery.",
        });
      }

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status",
        });
      }


      // ==========================================
      // GET ORDER
      // ==========================================

      const order = await Order.findOne({
        _id: orderId,
      });


      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }


      // ==========================================
      // FIND SELLER PRODUCT
      // ==========================================

      const product = order.products.find(
        (item) =>
          item._id.toString() === productId &&
          item.sellerId.toString() === sellerId.toString()
      );


      if (!product) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to update this product",
        });
      }


      // ==========================================
      // PREVENT CHANGING COMPLETED/CANCELLED/SHIPPED
      // ==========================================

      if (
        product.status === "Cancelled" ||
        product.status === "Delivered" ||
        product.status === "Shipped"
      ) {
        return res.status(400).json({
          success: false,
          message: `Cannot change status of a ${product.status.toLowerCase()} product`,
        });
      }


      // ==========================================
      // ALLOWED STATUS TRANSITIONS FOR SELLER
      // ==========================================

      const validTransitions = {
        Placed: ["Confirmed", "Cancelled"],
        Confirmed: ["Shipped", "Cancelled"],
        Shipped: [], // Seller cannot change once Shipped!
        Delivered: [],
        Cancelled: [],
      };


      if (
        !validTransitions[product.status]?.includes(status)
      ) {
        return res.status(400).json({
          success: false,
          message: `Cannot change status from ${product.status} to ${status}`,
        });
      }


      // ==========================================
      // RESTORE STOCK IF CANCELLED
      // ==========================================

      if (status === "Cancelled") {

        await Product.findByIdAndUpdate(
          product.productId,
          {
            $inc: {
              stock: product.quantity,
            },
          }
        );
      }


      // ==========================================
      // UPDATE STATUS
      // ==========================================

      product.status = status;

      await order.save();


      // ==========================================
      // RESPONSE
      // ==========================================

      res.json({
        success: true,
        message: "Order status updated",
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({
        success: false,
        message: "Failed to update order status",
      });
    }
  }
);


export default router;
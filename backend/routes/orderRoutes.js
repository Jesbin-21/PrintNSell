import express from "express";
import jwt from "jsonwebtoken";
import Razorpay from "razorpay";
import Address from "../models/Address.js";
import Cart from "../models/cart.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

const router = express.Router();

// Initialize Razorpay instance for Test Mode refunds
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});


// ==========================================
// CREATE ORDER
// ==========================================

router.post("/orders", async (req, res) => {
  try {

    // ==========================================
    // AUTHENTICATION
    // ==========================================

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token missing",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "secretkey"
    );

    const userId = decoded.userId;


    // ==========================================
    // GET REQUEST DATA
    // ==========================================

    const {
      addressId,
      paymentMethod,
    } = req.body;


    // ==========================================
    // CHECK PAYMENT METHOD
    // ==========================================

    if (!paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "Please select a payment method",
      });
    }


    if (
      paymentMethod !== "COD" &&
      paymentMethod !== "ONLINE"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method",
      });
    }


    // ==========================================
    // GET ADDRESS
    // ==========================================

    const selectedAddress = await Address.findOne({
      _id: addressId,
      userId,
    });

    if (!selectedAddress) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }


    // ==========================================
    // GET CART
    // ==========================================

    const cart = await Cart.find({
      userId,
    }).populate("productId");

    if (cart.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }


    // ==========================================
    // CHECK STOCK + CREATE PRODUCTS
    // ==========================================

    let totalAmount = 0;

    const products = [];


    for (const item of cart) {

      const product = item.productId;


      // ========================================
      // PRODUCT DELETED
      // ========================================

      if (!product) {
        return res.status(400).json({
          success: false,
          message:
            "One of the products no longer exists",
        });
      }


      // ========================================
      // VALIDATE QUANTITY
      // ========================================

      if (
        !Number.isInteger(item.quantity) ||
        item.quantity <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid product quantity",
        });
      }


      // ========================================
      // CHECK STOCK
      // ========================================

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message:
            `${product.productName} has only ${product.stock} items available`,
        });
      }


      // ========================================
      // CALCULATE PRICE
      // ========================================

      const price = product.price;

      totalAmount +=
        price * item.quantity;


      // ========================================
      // ADD PRODUCT TO ORDER
      // ========================================

      products.push({
        productId: product._id,
        sellerId: product.userId || product.sellerId || userId,
        quantity: item.quantity,
        price,
        status: "Placed",
      });
    }


    // ==========================================
    // PAYMENT STATUS
    // ==========================================

    let paymentStatus = "Pending";

    if (paymentMethod === "COD") {
      paymentStatus = "Pending";
    }

    if (paymentMethod === "ONLINE") {
      paymentStatus = "Pending";
    }


    // ==========================================
    // CREATE ORDER
    // ==========================================

    const order = new Order({
      userId,
      products,
      address: {
        name: selectedAddress.name || "Customer",
        phone: selectedAddress.phone || "",
        address: selectedAddress.address || "",
        city: selectedAddress.city || "",
        state: selectedAddress.state || "",
        pincode: selectedAddress.pincode || "",
      },
      totalAmount,
      paymentMethod,
      paymentStatus,
      paymentId: null,
      razorpayOrderId: null,
    });


    await order.save();


    // ==========================================
    // REDUCE STOCK
    // ==========================================

    for (const item of cart) {
      if (item.productId?._id) {
        await Product.findByIdAndUpdate(
          item.productId._id,
          {
            $inc: {
              stock: -item.quantity,
            },
          }
        );
      }
    }


    // ==========================================
    // CLEAR CART
    // ==========================================

    await Cart.deleteMany({
      userId,
    });


    // ==========================================
    // RESPONSE
    // ==========================================

    res.json({
      success: true,
      message: "Order placed successfully 🎉",
      order,
    });

  } catch (error) {
    console.log(
      "CREATE ORDER ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message || "Failed to place order",
    });
  }
});


// ==========================================
// GET USER ORDERS
// ==========================================

router.get("/orders", async (req, res) => {
  try {

    const authHeader =
      req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }


    const token =
      authHeader.split(" ")[1];


    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token missing",
      });
    }


    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "secretkey"
    );


    const userId =
      decoded.userId;


    // ==========================================
    // GET USER ORDERS
    // ==========================================

    const orders = await Order.find({
      userId,
    })
      .populate("products.productId")
      .sort({
        createdAt: -1,
      });


    res.json({
      success: true,
      orders,
    });

  } catch (error) {

    console.log(
      "GET ORDERS ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to get orders",
    });
  }
});


// ==========================================
// CANCEL ORDER PRODUCT (WITH RAZORPAY REFUND)
// ==========================================

router.put(
  "/orders/:orderId/product/:productId/cancel",
  async (req, res) => {
    try {
      // ------------------------------------------
      // AUTHENTICATION
      // ------------------------------------------
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const token = authHeader.split(" ")[1];

      if (!token) {
        return res.status(401).json({
          success: false,
          message: "Token missing",
        });
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "secretkey"
      );

      const userId = decoded.userId;

      // ------------------------------------------
      // PARAMS
      // ------------------------------------------
      const { orderId, productId } = req.params;

      // ------------------------------------------
      // FIND USER ORDER
      // ------------------------------------------
      const order = await Order.findOne({
        _id: orderId,
        userId,
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      // ------------------------------------------
      // FIND PRODUCT INSIDE ORDER
      // ------------------------------------------
      const orderProduct = order.products.find(
        (item) => item._id.toString() === productId
      );

      if (!orderProduct) {
        return res.status(404).json({
          success: false,
          message: "Product not found in this order",
        });
      }

      // ------------------------------------------
      // CHECK CANCELLATION ELIGIBILITY
      // Customer can cancel only when Placed or Confirmed
      // ------------------------------------------
      if (orderProduct.status === "Cancelled") {
        return res.status(400).json({
          success: false,
          message: "Product is already cancelled",
        });
      }

      if (orderProduct.status === "Shipped") {
        return res.status(400).json({
          success: false,
          message: "Cannot cancel a shipped product",
        });
      }

      if (orderProduct.status === "Delivered") {
        return res.status(400).json({
          success: false,
          message: "Cannot cancel a delivered product",
        });
      }

      if (
        orderProduct.status !== "Placed" &&
        orderProduct.status !== "Confirmed"
      ) {
        return res.status(400).json({
          success: false,
          message: `Cannot cancel product with status ${orderProduct.status}`,
        });
      }

      // ------------------------------------------
      // RAZORPAY ONLINE PAYMENT REFUND
      // If customer paid online, refund only this product's amount
      // ------------------------------------------
      let refundSuccess = false;

      if (
        order.paymentMethod === "ONLINE" &&
        order.paymentStatus === "Paid" &&
        order.paymentId
      ) {
        const itemRefundAmountPaise = Math.round(
          orderProduct.price * orderProduct.quantity * 100
        );

        try {
          // Request partial/item refund from Razorpay
          await razorpay.payments.refund(order.paymentId, {
            amount: itemRefundAmountPaise,
            notes: {
              orderId: order._id.toString(),
              productId: orderProduct.productId.toString(),
              reason: "Customer cancelled product before shipment",
            },
          });

          refundSuccess = true;
          console.log(
            `RAZORPAY REFUND SUCCESS: ₹${orderProduct.price * orderProduct.quantity} refunded for payment ${order.paymentId}`
          );
        } catch (refundError) {
          console.log("RAZORPAY REFUND FAILED:", refundError);

          return res.status(500).json({
            success: false,
            message:
              "Failed to process Razorpay refund. Order item was not cancelled.",
          });
        }
      }

      // ------------------------------------------
      // UPDATE PRODUCT STATUS TO CANCELLED
      // ------------------------------------------
      orderProduct.status = "Cancelled";

      // If all products in this order are now cancelled, mark paymentStatus as Refunded (for online paid)
      const allCancelled = order.products.every(
        (item) => item.status === "Cancelled"
      );

      if (
        allCancelled &&
        order.paymentMethod === "ONLINE" &&
        order.paymentStatus === "Paid"
      ) {
        order.paymentStatus = "Refunded";
      }

      await order.save();

      // ------------------------------------------
      // RESTORE STOCK TO PRODUCT
      // ------------------------------------------
      await Product.findByIdAndUpdate(orderProduct.productId, {
        $inc: {
          stock: orderProduct.quantity,
        },
      });

      // ------------------------------------------
      // RESPONSE
      // ------------------------------------------
      const successMessage = refundSuccess
        ? "Cancellation successful. Your refund has been initiated."
        : "Order item cancelled successfully.";

      res.json({
        success: true,
        message: successMessage,
      });
    } catch (error) {
      console.log("CANCEL ORDER ERROR:", error);

      res.status(500).json({
        success: false,
        message: "Failed to cancel order",
      });
    }
  }
);


// ==========================================
// BUYER CONFIRM DELIVERY
// ==========================================
// Route: PUT /orders/:orderId/product/:productId/deliver
router.put(
  "/orders/:orderId/product/:productId/deliver",
  async (req, res) => {
    try {
      // ------------------------------------------
      // AUTHENTICATION (Buyer only)
      // ------------------------------------------
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const token = authHeader.split(" ")[1];

      if (!token) {
        return res.status(401).json({
          success: false,
          message: "Token missing",
        });
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "secretkey"
      );

      const userId = decoded.userId;

      // ------------------------------------------
      // PARAMS
      // ------------------------------------------
      const { orderId, productId } = req.params;

      // ------------------------------------------
      // FIND ORDER BELONGING TO THIS BUYER
      // ------------------------------------------
      const order = await Order.findOne({
        _id: orderId,
        userId,
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      // ------------------------------------------
      // FIND PRODUCT INSIDE ORDER
      // ------------------------------------------
      const orderProduct = order.products.find(
        (item) => item._id.toString() === productId
      );

      if (!orderProduct) {
        return res.status(404).json({
          success: false,
          message: "Product not found in this order",
        });
      }

      // ------------------------------------------
      // VERIFY STATUS IS EXACTLY "Shipped"
      // ------------------------------------------
      if (orderProduct.status === "Delivered") {
        return res.status(400).json({
          success: false,
          message: "This product is already marked as Delivered",
        });
      }

      if (orderProduct.status !== "Shipped") {
        return res.status(400).json({
          success: false,
          message: `Cannot confirm delivery. Product is currently ${orderProduct.status}.`,
        });
      }

      // ------------------------------------------
      // UPDATE STATUS: Shipped -> Delivered
      // ------------------------------------------
      orderProduct.status = "Delivered";

      await order.save();

      // ------------------------------------------
      // RESPONSE
      // ------------------------------------------
      res.json({
        success: true,
        message: "Delivery confirmed successfully",
      });
    } catch (error) {
      console.log("CONFIRM DELIVERY ERROR:", error);

      res.status(500).json({
        success: false,
        message: "Failed to confirm delivery",
      });
    }
  }
);

export default router;
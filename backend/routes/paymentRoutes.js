import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import Address from "../models/Address.js";
import Cart from "../models/cart.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

const router = express.Router();

// Initialize Razorpay instance with your test keys from .env
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ==========================================
// 1. CREATE RAZORPAY PAYMENT ORDER
// ==========================================
// Route: POST /payment/create-order
router.post(["/payment/create-order", "/payment/create"], async (req, res) => {
  try {
    // ------------------------------------------
    // AUTHENTICATION CHECK
    // ------------------------------------------
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ success: false, message: "Token missing" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretkey");
    const userId = decoded.userId;

    // ------------------------------------------
    // FETCH USER'S CART FROM DATABASE
    // (Never trust total amount sent from frontend)
    // ------------------------------------------
    const cart = await Cart.find({ userId }).populate("productId");

    if (!cart || cart.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty",
      });
    }

    // ------------------------------------------
    // CALCULATE TOTAL AMOUNT & CHECK STOCK
    // ------------------------------------------
    let totalAmount = 0;

    for (const item of cart) {
      const product = item.productId;

      if (!product) {
        return res.status(400).json({
          success: false,
          message: "One of the products in your cart no longer exists",
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `${product.productName} has only ${product.stock} items left in stock`,
        });
      }

      totalAmount += product.price * item.quantity;
    }

    if (totalAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid cart total",
      });
    }

    // ------------------------------------------
    // CONVERT RUPEES TO PAISE
    // Razorpay accepts amounts in paise (1 INR = 100 paise)
    // ------------------------------------------
    const amountInPaise = Math.round(totalAmount * 100);

    // ------------------------------------------
    // CREATE ORDER ON RAZORPAY
    // ------------------------------------------
    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `receipt_${userId.toString().slice(-6)}_${Date.now()}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // ------------------------------------------
    // SEND ORDER DETAILS BACK TO REACT
    // ------------------------------------------
    res.json({
      success: true,
      keyId: process.env.RAZORPAY_KEY_ID, // Safe public Key ID for React
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount, // in paise
      currency: razorpayOrder.currency,
    });
  } catch (error) {
    console.log("CREATE RAZORPAY ORDER ERROR:", error);
    const errorMessage =
      error?.error?.description ||
      error?.message ||
      "Failed to create Razorpay payment order";
    res.status(500).json({
      success: false,
      message: errorMessage,
    });
  }
});

// ==========================================
// 2. VERIFY PAYMENT & CREATE MONGODB ORDER
// ==========================================
// Route: POST /payment/verify
router.post("/payment/verify", async (req, res) => {
  try {
    // ------------------------------------------
    // AUTHENTICATION CHECK
    // ------------------------------------------
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ success: false, message: "Token missing" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretkey");
    const userId = decoded.userId;

    // ------------------------------------------
    // GET PAYMENT DETAILS SENT FROM REACT
    // ------------------------------------------
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      addressId,
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !addressId
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment details or address are missing",
      });
    }

    // ------------------------------------------
    // VERIFY RAZORPAY SIGNATURE
    // ------------------------------------------
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment signature verification failed. Possible fraud.",
      });
    }

    // ------------------------------------------
    // PREVENT DUPLICATE ORDERS
    // Check if an order with this paymentId already exists
    // ------------------------------------------
    const existingOrder = await Order.findOne({
      paymentId: razorpay_payment_id,
    });

    if (existingOrder) {
      return res.json({
        success: true,
        message: "Order already placed",
        order: existingOrder,
      });
    }

    // ------------------------------------------
    // GET DELIVERY ADDRESS
    // ------------------------------------------
    const selectedAddress = await Address.findOne({
      _id: addressId,
      userId,
    });

    if (!selectedAddress) {
      return res.status(404).json({
        success: false,
        message: "Delivery address not found",
      });
    }

    // ------------------------------------------
    // GET USER CART
    // ------------------------------------------
    const cart = await Cart.find({ userId }).populate("productId");

    if (!cart || cart.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    // ------------------------------------------
    // CHECK STOCK AGAIN BEFORE CREATING ORDER
    // ------------------------------------------
    let totalAmount = 0;
    const products = [];

    for (const item of cart) {
      const product = item.productId;

      if (!product) {
        return res.status(400).json({
          success: false,
          message: "A product in your cart is no longer available",
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Sorry, ${product.productName} is out of stock! In Test Mode, payment was recorded but order could not be placed.`,
        });
      }

      totalAmount += product.price * item.quantity;

      products.push({
        productId: product._id,
        sellerId: product.userId,
        quantity: item.quantity,
        price: product.price,
        status: "Placed",
      });
    }

    // ------------------------------------------
    // CREATE THE MONGODB ORDER (STATUS = PAID)
    // ------------------------------------------
    const newOrder = new Order({
      userId,
      products,
      address: {
        name: selectedAddress.name,
        phone: selectedAddress.phone,
        address: selectedAddress.address,
        city: selectedAddress.city,
        state: selectedAddress.state,
        pincode: selectedAddress.pincode,
      },
      totalAmount,
      paymentMethod: "ONLINE",
      paymentStatus: "Paid", // Successfully verified!
      paymentId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id,
    });

    await newOrder.save();

    // ------------------------------------------
    // REDUCE PRODUCT STOCK
    // ------------------------------------------
    for (const item of cart) {
      await Product.findByIdAndUpdate(item.productId._id, {
        $inc: { stock: -item.quantity },
      });
    }

    // ------------------------------------------
    // CLEAR USER'S CART
    // ------------------------------------------
    await Cart.deleteMany({ userId });

    // ------------------------------------------
    // SEND SUCCESS RESPONSE
    // ------------------------------------------
    res.json({
      success: true,
      message: "Payment verified and order placed successfully 🎉",
      order: newOrder,
    });
  } catch (error) {
    console.log("PAYMENT VERIFICATION ERROR:", error);
    const errorMessage =
      error?.error?.description ||
      error?.message ||
      "Failed to verify payment and place order";
    res.status(500).json({
      success: false,
      message: errorMessage,
    });
  }
});

export default router;
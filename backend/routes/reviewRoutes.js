import express from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import Review from "../models/Review.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

const router = express.Router();

// Helper to recalculate average rating and review count for a product
async function updateProductRatingStats(productId) {
  try {
    const stats = await Review.aggregate([
      {
        $match: {
          productId: new mongoose.Types.ObjectId(productId),
        },
      },
      {
        $group: {
          _id: "$productId",
          averageRating: { $avg: "$rating" },
          numReviews: { $sum: 1 },
        },
      },
    ]);

    if (stats.length > 0) {
      await Product.findByIdAndUpdate(productId, {
        averageRating: Math.round(stats[0].averageRating * 10) / 10,
        numReviews: stats[0].numReviews,
      });
    } else {
      await Product.findByIdAndUpdate(productId, {
        averageRating: 0,
        numReviews: 0,
      });
    }
  } catch (error) {
    console.error("Error updating product rating stats:", error);
  }
}

// ==========================================
// SUBMIT OR UPDATE A PRODUCT REVIEW
// ==========================================
router.post("/reviews", async (req, res) => {
  try {
    // 1. Authenticate user
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please log in.",
      });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token missing",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "secretkey"
    );
    const userId = decoded.userId;

    // 2. Validate request body
    const { orderId, productId, rating, comment } = req.body;

    if (!orderId || !productId) {
      return res.status(400).json({
        success: false,
        message: "Order ID and Product ID are required.",
      });
    }

    const numericRating = Number(rating);
    if (!numericRating || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid rating between 1 and 5 stars.",
      });
    }

    // 3. Verify order exists and belongs to this user
    const order = await Order.findOne({
      _id: orderId,
      userId,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    // 4. Verify product is inside this order and its status is 'Delivered'
    const orderProduct = order.products.find(
      (item) => item.productId.toString() === productId || item._id.toString() === productId
    );

    if (!orderProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found in this order.",
      });
    }

    if (orderProduct.status !== "Delivered") {
      return res.status(400).json({
        success: false,
        message: `Reviews can only be submitted for delivered products. Current status is ${orderProduct.status}.`,
      });
    }

    // Product's actual ObjectId (in case orderProduct._id was passed)
    const actualProductId = orderProduct.productId;

    // Fetch user email for reviewer info
    const user = await User.findById(userId).select("email");
    const userEmail = user?.email || decoded.email || "Customer";

    // 5. Create or update review (Upsert)
    const review = await Review.findOneAndUpdate(
      {
        userId,
        productId: actualProductId,
        orderId,
      },
      {
        userId,
        userEmail,
        productId: actualProductId,
        orderId,
        rating: numericRating,
        comment: (comment || "").trim(),
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    // 6. Recalculate product rating & review count
    await updateProductRatingStats(actualProductId);

    const updatedProduct = await Product.findById(actualProductId).select("averageRating numReviews");

    res.json({
      success: true,
      message: "Review submitted successfully! Thank you for your feedback.",
      review,
      averageRating: updatedProduct?.averageRating || numericRating,
      numReviews: updatedProduct?.numReviews || 1,
    });
  } catch (error) {
    console.error("SUBMIT REVIEW ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to submit review",
    });
  }
});

// ==========================================
// GET REVIEWS FOR LOGGED-IN USER
// ==========================================
router.get("/reviews/user", async (req, res) => {
  try {
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

    const reviews = await Review.find({ userId }).sort({ updatedAt: -1 });

    res.json({
      success: true,
      reviews,
    });
  } catch (error) {
    console.error("GET USER REVIEWS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get user reviews",
    });
  }
});

// ==========================================
// GET ALL REVIEWS FOR A PRODUCT (PUBLIC)
// ==========================================
router.get("/reviews/product/:productId", async (req, res) => {
  try {
    const { productId } = req.params;

    const reviews = await Review.find({ productId })
      .sort({ createdAt: -1 })
      .select("-userId");

    const product = await Product.findById(productId).select("averageRating numReviews");

    res.json({
      success: true,
      reviews,
      averageRating: product?.averageRating || 0,
      numReviews: product?.numReviews || 0,
    });
  } catch (error) {
    console.error("GET PRODUCT REVIEWS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get product reviews",
    });
  }
});

export default router;

import express from "express";
import { protect } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import Seller from "../models/Seller.js";

const router = express.Router();

// ==========================================
// SELLER ROUTES
// ==========================================

// REGISTER / UPDATE SELLER PROFILE
router.post(
  "/seller",
  protect,
  upload.single("shopImage"),
  async (req, res, next) => {
    try {
      const { name, shopName, location } = req.body;

      if (!name || !shopName || !location) {
        return res.status(400).json({
          success: false,
          message: "All fields (name, shopName, location) are required",
        });
      }

      const existingSeller = await Seller.findOne({ userId: req.user.userId });
      if (!existingSeller && !req.file) {
        return res.status(400).json({
          success: false,
          message: "Shop image is required for seller registration",
        });
      }

      const updateData = {
        userId: req.user.userId,
        name,
        shopName,
        location,
      };

      if (req.file) {
  updateData.Image = req.file.path;
}

      const seller = await Seller.findOneAndUpdate(
        { userId: req.user.userId },
        updateData,
        { new: true, upsert: true, runValidators: true }
      );

      res.json({
        success: true,
        message: "Seller Registered",
        seller,
      });
    } catch (err) {
      next(err);
    }
  }
);

// GET CURRENT USER SELLER PROFILE
router.get("/seller", protect, async (req, res, next) => {
  try {
    const seller = await Seller.findOne({
      userId: req.user.userId,
    });

    if (!seller) {
      return res.json({
        message: "Seller not found",
      });
    }

    res.json(seller);
  } catch (err) {
    next(err);
  }
});

// DELETE SELLER PROFILE
router.delete("/seller", protect, async (req, res, next) => {
  try {
    const seller = await Seller.findOneAndDelete({
      userId: req.user.userId,
    });

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller profile not found",
      });
    }

    res.json({
      success: true,
      message: "Seller shop profile deleted successfully",
    });
  } catch (err) {
    next(err);
  }
});

export default router;

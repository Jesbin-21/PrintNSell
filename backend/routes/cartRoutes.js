import express from "express";
import { protect } from "../middleware/auth.js";
import Cart from "../models/cart.js";
import Product from "../models/Product.js";

const router = express.Router();


// ==========================================
// ADD TO CART
// ==========================================

router.post("/cart", protect, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { productId, quantity } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }


    // ==========================================
    // CHECK STOCK
    // ==========================================

    if (product.stock <= 0) {
      return res.status(400).json({
        success: false,
        message: "Product is out of stock",
      });
    }


    const qty = Math.max(
      1,
      Number(quantity) || 1
    );


    // ==========================================
    // FIND EXISTING CART ITEM
    // ==========================================

    let item = await Cart.findOne({
      userId,
      productId,
    });


    if (item) {

      const newQuantity =
        item.quantity + qty;


      // Don't allow cart quantity above stock
      if (newQuantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} items available`,
        });
      }


      item.quantity = newQuantity;

      await item.save();

    } else {

      // Don't allow initial quantity above stock
      if (qty > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} items available`,
        });
      }


      await Cart.create({
        userId,
        productId,
        quantity: qty,
      });
    }


    res.json({
      success: true,
      message: "Added to cart",
    });

  } catch (err) {
    next(err);
  }
});


// ==========================================
// GET CART
// ==========================================

router.get("/cart", protect, async (req, res, next) => {
  try {

    const cart = await Cart.find({
      userId: req.user.userId,
    }).populate("productId");


    // Remove deleted products
    const validCart = cart.filter(
      (item) => item.productId !== null
    );


    res.json({
      success: true,
      cart: validCart,
    });

  } catch (err) {
    next(err);
  }
});


// ==========================================
// UPDATE CART QUANTITY
// ==========================================

router.put("/cart/:id", protect, async (req, res, next) => {
  try {

    const { change } = req.body;


    const item = await Cart.findById(
      req.params.id
    ).populate("productId");


    if (
      !item ||
      item.userId.toString() !==
        req.user.userId.toString()
    ) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }


    const product = item.productId;


    // Product was deleted
    if (!product) {

      await Cart.findByIdAndDelete(
        req.params.id
      );

      return res.status(404).json({
        success: false,
        message: "Product no longer exists",
      });
    }


    const changeAmount =
      Number(change) || 0;


    const newQuantity =
      item.quantity + changeAmount;


    // ==========================================
    // REMOVE ITEM
    // ==========================================

    if (newQuantity <= 0) {

      await Cart.findByIdAndDelete(
        req.params.id
      );

      return res.json({
        success: true,
        message: "Item removed",
      });
    }


    // ==========================================
    // CHECK STOCK
    // ==========================================

    if (newQuantity > product.stock) {

      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} items available`,
      });
    }


    item.quantity = newQuantity;

    await item.save();


    res.json({
      success: true,
      message: "Quantity updated",
      quantity: item.quantity,
    });

  } catch (err) {
    next(err);
  }
});


export default router;
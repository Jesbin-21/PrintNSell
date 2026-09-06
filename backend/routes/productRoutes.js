import express from "express";
import fs from "fs";
import { protect } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import Product from "../models/Product.js";
import Cart from "../models/cart.js";

const router = express.Router();

// ==========================================
// PRODUCT ROUTES
// ==========================================

// ADD PRODUCT
router.post(
  "/productForm",
  protect,
  upload.array("images", 6),
  async (req, res, next) => {
    try {
      const imagePaths = req.files
        ? req.files.map((file) => file.path.replace(/\\/g, "/"))
        : [];

      const {
        productName,
        Description,
        Category,
        Material,
        Length,
        Width,
        Height,
        SizeUnit,
        weight,
        Surface,
        WeightUnit,
        Price,
        Stock
      } = req.body;

    if (!productName || Price === undefined || Stock === undefined) {
  return res.status(400).json({
    success: false,
    message: "Product name, price and stock are required",
  });
}

      const newProduct = new Product({
        userId: req.user.userId,
        productName,
        description: Description || "",
        category: Category || "",
        material: Material || "",
        length: Number(Length) || 0,
        width: Number(Width) || 0,
        height: Number(Height) || 0,
        sizeUnit: SizeUnit || "mm",
        weight: Number(weight) || 0,
        weightUnit: WeightUnit || "g",
        surface: Surface || "",
        price: Number(Price) || 0,
        stock: Number(Stock),
        images: imagePaths,
      });

      await newProduct.save();

      res.json({
        success: true,
        message: "Product added",
        product: newProduct,
      });
    } catch (err) {
      next(err);
    }
  }
);

// GET LOGGED-IN SELLER PRODUCTS
router.get("/products", protect, async (req, res, next) => {
  try {
    const products = await Product.find({
      userId: req.user.userId,
    }).sort({ createdAt: -1 });

    res.json(products);
  } catch (err) {
    next(err);
  }
});

// GET ALL PRODUCTS (PUBLIC)
router.get("/allProducts", async (req, res, next) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      products,
    });
  } catch (err) {
    next(err);
  }
});

// GET SINGLE PRODUCT (PUBLIC)
router.get("/product/:id", async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      product,
    });
  } catch (err) {
    next(err);
  }
});

// UPDATE PRODUCT
router.put(
  "/product/:id",
  protect,
  upload.array("images", 6),
  async (req, res, next) => {
    try {
      const { id } = req.params;

      const product = await Product.findById(id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      // Check ownership
      if (product.userId.toString() !== req.user.userId.toString()) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized: You do not own this product",
        });
      }

      const {
        productName,
        Description,
        Category,
        Material,
        Length,
        Width,
        Height,
        SizeUnit,
        weight,
        Surface,
        WeightUnit,
        Price,
          Stock,

        indexes,
      } = req.body;

      const updatedImages = [...product.images];

      if (req.files && req.files.length > 0 && indexes !== undefined) {
        const imageIndexes = Array.isArray(indexes) ? indexes : [indexes];

        req.files.forEach((file, i) => {
          const targetIndex = Number(imageIndexes[i]);
          if (!isNaN(targetIndex) && targetIndex >= 0 && targetIndex < 6) {
            updatedImages[targetIndex] = file.path.replace(/\\/g, "/");
          }
        });
      }

      const updatedProduct = await Product.findByIdAndUpdate(
        id,
        {
          productName: productName !== undefined ? productName : product.productName,
          description: Description !== undefined ? Description : product.description,
          category: Category !== undefined ? Category : product.category,
          material: Material !== undefined ? Material : product.material,
          length: Length !== undefined ? Number(Length) : product.length,
          width: Width !== undefined ? Number(Width) : product.width,
          height: Height !== undefined ? Number(Height) : product.height,
          sizeUnit: SizeUnit !== undefined ? SizeUnit : product.sizeUnit,
          weight: weight !== undefined ? Number(weight) : product.weight,
          weightUnit: WeightUnit !== undefined ? WeightUnit : product.weightUnit,
          surface: Surface !== undefined ? Surface : product.surface,
          price: Price !== undefined ? Number(Price) : product.price,
          stock: Stock !== undefined ? Number(Stock) : product.stock,
          images: updatedImages,
        },
        { new: true }
      );

      res.json({
        success: true,
        message: "Product updated",
        product: updatedProduct,
      });
    } catch (err) {
      next(err);
    }
  }
);

// DELETE PRODUCT
router.delete("/product/:id", protect, async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check ownership
    if (product.userId.toString() !== req.user.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: You do not own this product",
      });
    }

    // Delete uploaded image files from disk safely
    if (Array.isArray(product.images)) {
      product.images.forEach((imgPath) => {
        if (imgPath && fs.existsSync(imgPath)) {
          fs.unlink(imgPath, (err) => {
            if (err) console.error(`Failed to delete file ${imgPath}:`, err);
          });
        }
      });
    }

    await Product.findByIdAndDelete(id);

    // Clean up cart items referencing this product
    await Cart.deleteMany({ productId: id });

    res.json({
      success: true,
      message: "Deleted successfully",
    });
  } catch (err) {
    next(err);
  }
});

export default router;

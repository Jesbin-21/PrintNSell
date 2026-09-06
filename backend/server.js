import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import sellerOrderRoutes from "./routes/sellerOrderRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import sellerRoutes from "./routes/sellerRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import addressRoutes from "./routes/addressRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
// Connect to MongoDB
connectDB();

const app = express();

// Enable CORS & JSON parsing
app.use(cors());
app.use(express.json());

// Serve uploaded static files
app.use("/uploads", express.static("uploads"));

// Mount Routes
app.use("/", authRoutes);
app.use("/", sellerRoutes);
app.use("/", productRoutes);
app.use("/", cartRoutes);
app.use("/", addressRoutes);
app.use("/", orderRoutes);
app.use("/", profileRoutes);
app.use("/", sellerOrderRoutes);
app.use("/", paymentRoutes);
app.use("/", reviewRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled Error Stack:", err);

  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

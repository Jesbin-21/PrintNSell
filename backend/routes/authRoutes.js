import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();
const getJwtSecret = () => process.env.JWT_SECRET || "secretkey";

// ==========================================
// AUTH ROUTES
// ==========================================

// SIGNUP
router.post("/signup", async (req, res, next) => {
  try {
    let { email, password, confirmPassword } = req.body;

    if (!email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Please fill all fields",
      });
    }

    email = email.toLowerCase().trim();

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({
        success: false,
        message: "email already registered",
      });
    }

    const user = new User({
      email,
      password,
    });

    await user.save();

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
      },
      getJwtSecret()
    );

    res.json({
      success: true,
      message: "signup is successful",
      token,
    });
  } catch (err) {
    next(err);
  }
});

// LOGIN
router.post("/login", async (req, res, next) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    email = email.toLowerCase().trim();

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    if (user.password !== password) {
      return res.json({
        success: false,
        message: "Wrong password",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
      },
      getJwtSecret()
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
    });
  } catch (err) {
    next(err);
  }
});

export default router;

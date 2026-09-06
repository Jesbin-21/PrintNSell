import express from "express";
import jwt from "jsonwebtoken";
import Address from "../models/Address.js";

const router = express.Router();

// ==========================================
// ADDRESS ROUTES
// ==========================================

// GET ALL ADDRESSES
router.get("/addresses", async (req, res) => {
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

    const userId = decoded.userId;

    const addresses = await Address.find({ userId })
      .sort({ isDefault: -1, createdAt: -1 });

    res.json({
      success: true,
      addresses,
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Failed to get addresses",
    });
  }
});

// ADD ADDRESS
router.post("/addresses", async (req, res) => {
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

    const userId = decoded.userId;

    const {
      name,
      phone,
      address,
      city,
      state,
      pincode,
      type,
    } = req.body;

    // Check whether user already has an address
    const existingAddress = await Address.findOne({
      userId,
    });

    // First address automatically becomes default
    const isDefault = existingAddress
      ? false
      : true;

    const newAddress = new Address({
      userId,
      name,
      phone,
      address,
      city,
      state,
      pincode,
      type,
      isDefault,
    });

    await newAddress.save();

    res.json({
      success: true,
      message: "Address added successfully",
      address: newAddress,
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Failed to add address",
    });
  }
});

// UPDATE ADDRESS
router.put("/addresses/:id", async (req, res) => {
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

    const userId = decoded.userId;

    const updatedAddress = await Address.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: userId,
      },
      {
        name: req.body.name,
        phone: req.body.phone,
        address: req.body.address,
        city: req.body.city,
        state: req.body.state,
        pincode: req.body.pincode,
        type: req.body.type,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedAddress) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    res.json({
      success: true,
      message: "Address updated successfully",
      address: updatedAddress,
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Failed to update address",
    });
  }
});

// DELETE ADDRESS
router.delete("/addresses/:id", async (req, res) => {
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

    const userId = decoded.userId;

    const address = await Address.findOneAndDelete({
      _id: req.params.id,
      userId: userId,
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    // If deleted address was default,
    // make another address default
    if (address.isDefault) {
      const anotherAddress = await Address.findOne({
        userId,
      }).sort({ createdAt: -1 });

      if (anotherAddress) {
        anotherAddress.isDefault = true;
        await anotherAddress.save();
      }
    }

    res.json({
      success: true,
      message: "Address deleted successfully",
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Failed to delete address",
    });
  }
});

// SET DEFAULT ADDRESS
router.put("/addresses/:id/default", async (req, res) => {
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

    const userId = decoded.userId;

    // Remove default from all addresses
    await Address.updateMany(
      { userId },
      { $set: { isDefault: false } }
    );

    // Set selected address as default
    const address = await Address.findOneAndUpdate(
      {
        _id: req.params.id,
        userId,
      },
      {
        $set: {
          isDefault: true,
        },
      },
      {
        new: true,
      }
    );

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    res.json({
      success: true,
      message: "Default address updated",
      address,
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Failed to set default address",
    });
  }
});

export default router;

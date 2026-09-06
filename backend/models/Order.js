import mongoose from "mongoose";


// ==========================================
// ORDER PRODUCT SCHEMA
// ==========================================

const orderProductSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    // ==========================================
    // PRODUCT ORDER STATUS
    // ==========================================

    status: {
      type: String,

      enum: [
        "Placed",
        "Confirmed",
        "Shipped",
        "Delivered",
        "Cancelled",
      ],

      default: "Placed",
    },
  },

  {
    _id: true,
  }
);


// ==========================================
// ORDER SCHEMA
// ==========================================

const orderSchema = new mongoose.Schema(
  {
    // ==========================================
    // CUSTOMER
    // ==========================================

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },


    // ==========================================
    // PRODUCTS
    // ==========================================

    products: {
      type: [orderProductSchema],
      required: true,
      validate: {
        validator: function (products) {
          return products.length > 0;
        },

        message: "Order must contain at least one product",
      },
    },


    // ==========================================
    // DELIVERY ADDRESS
    // ==========================================

    address: {
      name: {
        type: String,
        required: true,
      },

      phone: {
        type: String,
        required: true,
      },

      address: {
        type: String,
        required: true,
      },

      city: {
        type: String,
        required: true,
      },

      state: {
        type: String,
        required: true,
      },

      pincode: {
        type: String,
        required: true,
      },
    },


    // ==========================================
    // TOTAL AMOUNT
    // ==========================================

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },


    // ==========================================
    // PAYMENT METHOD
    // ==========================================

    paymentMethod: {
      type: String,

      enum: [
        "COD",
        "ONLINE",
      ],

      required: true,

      default: "COD",
    },


    // ==========================================
    // PAYMENT STATUS
    // ==========================================

    paymentStatus: {
      type: String,

      enum: [
        "Pending",
        "Paid",
        "Failed",
        "Refunded",
      ],

      default: "Pending",
    },


    // ==========================================
    // PAYMENT ID
    // ==========================================

    // Razorpay / online payment ID.
    // COD orders will normally have null.

    paymentId: {
      type: String,

      default: null,
    },

    // Razorpay Order ID
    razorpayOrderId: {
      type: String,
      default: null,
    },
  },


  // ==========================================
  // TIMESTAMPS
  // ==========================================

  {
    timestamps: true,
  }
);

// ==========================================
// CREATE MODEL
// ==========================================

const Order = mongoose.model("Order", orderSchema);

export default Order;
# 🖨️ PrintNSell — 3D Printed Products Marketplace

PrintNSell is a full-stack **MERN e-commerce platform** where users can discover, buy, and review 3D-printed products.

The platform also allows sellers to create and manage their own products, manage orders, and run their store through a dedicated seller dashboard.

---

## ✨ Features

### 🛍️ Shopping

* Browse 3D-printed products
* Search products
* Filter products by category
* Sort products by price and rating
* View detailed product information
* View product images
* Check product stock
* Add products to cart
* Update cart quantities
* Remove products from cart

### 👤 User Features

* User registration
* User login
* JWT authentication
* User profile
* Address management
* Manage saved addresses
* Order management
* View previous orders

### 🏪 Seller Features

* Seller dashboard
* Create products
* Edit products
* Delete products
* Manage product stock
* Upload product images
* View seller products
* Manage seller orders

### ⭐ Reviews & Ratings

* Product reviews
* Product ratings
* Average product rating
* Number of reviews

### 🔐 Security

* JWT-based authentication
* Protected routes
* Authentication and authorization
* Password hashing

---

## 🛠️ Tech Stack

### Frontend

* React.js
* Vite
* JavaScript
* CSS

### Backend

* Node.js
* Express.js
* REST API
* JWT Authentication
* Mongoose

### Database

* MongoDB
* MongoDB Atlas

### Additional Technologies

* Cloudinary
* Razorpay
* Axios
* Git & GitHub
* Postman

---

## 📁 Project Structure

```text
PrintNSell/
│
├── backend/
│   ├── config/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   └── server.js
│
├── public/
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── assets/
│   └── App.jsx
│
├── package.json
└── README.md
```

---

## 🔄 How It Works

```text
Customer
   │
   ▼
Browse Products
   │
   ▼
Product Details
   │
   ▼
Add to Cart
   │
   ▼
Checkout
   │
   ▼
Address Selection
   │
   ▼
Payment
   │
   ▼
Order Created
   │
   ▼
Seller Manages Order
```

### Seller Workflow

```text
Seller
   │
   ▼
Seller Dashboard
   │
   ▼
Create Product
   │
   ▼
Upload Product Images
   │
   ▼
Manage Stock
   │
   ▼
Receive Orders
   │
   ▼
Manage Orders
```

---

## 🛒 E-Commerce Flow

The application supports a complete shopping workflow:

1. User browses available products
2. User searches or filters products
3. User opens a product's details
4. User checks price, stock, and ratings
5. User adds the product to the cart
6. User selects or adds a delivery address
7. User proceeds to checkout
8. Payment is processed
9. An order is created
10. Seller can manage the order

---

## 🏪 Seller Dashboard

Sellers have access to a dedicated dashboard for managing their products and orders.

### Product Management

Sellers can:

* Add new products
* Upload product images
* Edit product information
* Update prices
* Update stock
* Delete products

### Order Management

Sellers can:

* View customer orders
* View order details
* Manage order status

---

## ⭐ Product Reviews

Customers can rate and review products after purchasing them.

Product cards display:

```text
⭐ Average Rating
💬 Number of Reviews
```

This allows customers to see product ratings before making a purchase.

---

## 🖼️ Product Images

Product images are uploaded and stored using **Cloudinary**.

The application supports multiple images for products and displays optimized product images throughout the marketplace.

---

## 💳 Payments

PrintNSell integrates **Razorpay** for online payments.

The checkout process connects the customer's cart, address, payment, and order information.

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Jesbin-21/PrintNSell.git
cd PrintNSell
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Start the frontend

```bash
npm run dev
```

The frontend runs on:

```text
http://localhost:5173
```

### 4. Install backend dependencies

Open another terminal:

```bash
cd backend
npm install
```

### 5. Start the backend

```bash
node server.js
```

The backend runs on:

```text
http://localhost:5000
```

---

## 🌐 Deployment

The application can be deployed using services such as:

* Render
* MongoDB Atlas
* Cloudinary

The frontend and backend can be deployed as separate services.

---

## 🔮 Future Improvements

* 📦 Real-time order tracking
* ❤️ Wishlist
* 🔔 Order notifications
* 💬 Seller/customer messaging
* 📊 Advanced seller analytics
* 🔎 Advanced product search
* 🏷️ Discount and coupon system
* 📱 Progressive Web App support

---

## 👨‍💻 Author

**Jesbin Jaison**

BCA Graduate | MERN Full-Stack Developer

### Technologies

```text
React.js • Node.js • Express.js • MongoDB
JavaScript • REST APIs • JWT • Cloudinary
Razorpay • Git • GitHub
```

---

## 📄 License

This project is created for educational and portfolio purposes.

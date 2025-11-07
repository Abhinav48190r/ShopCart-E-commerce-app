# E-Commerce Shopping Cart Application

A full-stack e-commerce shopping cart application built with React.js, Node.js, Express, and MongoDB. Features a modern UI, complete shopping cart functionality, and secure checkout process.

## Features

### Frontend

- Modern, responsive UI with Tailwind CSS
- Product catalog with grid layout
- Interactive shopping cart
- Quantity adjustment controls
- Checkout form with validation
- Order success page with receipt
- Mobile-friendly design
- Real-time cart updates
- Loading states and error handling

### Backend

- RESTful API architecture
- MongoDB database with Mongoose ODM
- Input validation with express-validator
- Secure CORS configuration
- Comprehensive error handling
- Session-based cart management
- Integration with Fake Store API

## Tech Stack

### Frontend

- React 18
- React Router v6
- Axios
- Tailwind CSS

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- CORS
- dotenv
- express-validator

## Prerequisites

Before running this application, ensure you have:

- Node.js (v18 or higher)
- MongoDB (v6 or higher) installed and running
- npm or yarn package manager
- Git (for version control)

## Project Structure

ecommerce-cart-app/
├── backend/
│ ├── config/
│ │ └── db.js # MongoDB connection
│ ├── controllers/
│ │ ├── productController.js # Product logic
│ │ ├── cartController.js # Cart logic
│ │ └── orderController.js # Order logic
│ ├── models/
│ │ ├── Product.js # Product schema
│ │ ├── Cart.js # Cart schema
│ │ └── Order.js # Order schema
│ ├── routes/
│ │ ├── productRoutes.js # Product routes
│ │ ├── cartRoutes.js # Cart routes
│ │ └── orderRoutes.js # Order routes
│ ├── .env.example
│ ├── .gitignore
│ ├── package.json
│ └── server.js # Entry point
│
├── frontend/
│ ├── public/
│ ├── src/
│ │ ├── components/
│ │ │ ├── Navbar.jsx
│ │ │ ├── ProductCard.jsx
│ │ │ ├── CartItem.jsx
│ │ │ ├── LoadingSpinner.jsx
│ │ │ └── ErrorMessage.jsx
│ │ ├── pages/
│ │ │ ├── ProductsPage.jsx
│ │ │ ├── CartPage.jsx
│ │ │ ├── CheckoutPage.jsx
│ │ │ └── OrderSuccessPage.jsx
│ │ ├── services/
│ │ │ └── api.js # API calls
│ │ ├── App.js
│ │ ├── index.js
│ │ └── index.css
│ ├── .env.example
│ ├── .gitignore
│ ├── package.json
│ └── tailwind.config.js
│
└── README.md

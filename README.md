# Amazon Clone (Express.js API + Next.js App Router Web App)

A fully-functional, visually stunning Amazon Clone designed for assessments. Features a lightweight, zero-configuration local database (SQLite with PostgreSQL compatibility), dynamic search and filtering, real-time shopping cart synchronization, step-by-step secure mock checkout, and purchase history tracking.

---

## 🛠️ Technology Stack

* **Frontend**: Next.js 14+ (App Router), React, Tailwind CSS, Lucide Icons
* **Backend**: Node.js, Express.js, JWT, Express Validator, Bcrypt.js
* **Database**: SQLite (local development fallback for zero setup) & PostgreSQL (production-ready)

---

## 📂 Project Structure

```
amazon-clone/
├── backend/            # Express API Server
│   ├── src/
│   │   ├── config/     # DB connections (SQLite & PG)
│   │   ├── middleware/ # Auth & validation checks
│   │   ├── routes/     # Auth, Products, Cart, Orders routers
│   │   └── server.js   # Server start point
│   ├── seeders/        # Products seeder
│   └── package.json
├── frontend/           # Next.js Web App
│   ├── src/
│   │   ├── app/        # App Router Pages (Home, Detail, Cart, Orders, Auth)
│   │   ├── components/ # Header, ProductCard, Footer components
│   │   ├── context/    # Global Cart & Auth Context (online/offline sync)
│   │   └── globals.css # Styling styles & custom animations
│   └── package.json
├── database/           # Schemas
│   ├── schema.sql      # Postgres SQL schema
│   └── schema_sqlite.sql # SQLite SQL schema
├── package.json        # Root script orchestrator
└── README.md
```

---

## 🚀 Quick Start Guide

Follow these steps to run the application locally on your Windows environment.

### Prerequisites

* [Node.js](https://nodejs.org/) (v18+ recommended)
* npm (comes bundled with Node.js)

### Step 1: Clone and Install Dependencies

Open a terminal in the root directory `amazon-clone/` and run:

```bash
# Installs packages in both backend/ and frontend/ folders
npm run install-all
```

### Step 2: Seed the Database

Populate the database with demo products, categories, and a user account:

```bash
npm run seed
```
*This command runs the SQLite migration (using `database/schema_sqlite.sql`) and populates the local `backend/database.sqlite` file with 12 realistic product listings from different categories.*

### Step 3: Run the Services

You must start the backend API and frontend client in separate terminals.

#### Term 1: Start Backend API (Port 5000)
```bash
npm run backend
```
*Runs the Express server with Nodemon. You should see `✅ Database connected at: ...` and `🚀 Server running on port 5000`.*

#### Term 2: Start Frontend Web App (Port 3000)
```bash
npm run frontend
```
*Launches the Next.js development server. Open [http://localhost:3000](http://localhost:3000) in your browser.*

---

## 👤 Demo Credentials

You can use this pre-seeded user to test authenticated cart sync, checkout, and order history:

* **Email**: `demo@amazon.com`
* **Password**: `password123`

---

## 🔌 API Endpoints Reference

### Authentication (`/api/auth`)
* `POST /signup` - Register a new account.
* `POST /login` - Sign in and get a JWT token.
* `GET /me` - Validate session token (private).

### Catalog (`/api/products` & `/api/categories`)
* `GET /categories` - Get all category names and active product counts.
* `GET /products` - List all active products. Supports query parameters:
  * `search` - search term matching title, description, or brand.
  * `category` - filter by category name.
  * `minPrice` & `maxPrice` - filter by price ranges.
  * `sort` & `order` - sort by `price`, `rating`, `name`, or `created_at`.
  * `page` & `limit` - pagination.
* `GET /products/:id` - Get detail specifications of a single product.

### Shopping Cart (`/api/cart` - Authenticated)
* `GET /` - Retrieve the user's cart items and subtotals.
* `POST /` - Add a product to the cart (checks stock availability).
* `PUT /:id` - Update quantity of a cart item.
* `DELETE /:id` - Delete a specific item from the cart.
* `DELETE /` - Empty the cart.

### Orders & Checkout (`/api/orders` - Authenticated)
* `POST /` - Create a transaction-safe order from cart items (updates stock inventory and empties cart).
* `GET /` - Retrieve user's order history.
* `GET /:id` - Retrieve specific order details with items list.

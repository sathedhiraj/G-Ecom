# Agent Context - Task 3: Backend API Routes

## Task ID: 3
## Agent Name: api-routes-agent
## Status: COMPLETED

## Work Summary
Built all 24 API route files for the G-Ecom e-commerce application covering 9 route groups: Auth, Products, Categories, Cart, Wishlist, Orders, Banners, Coupons, and Admin.

## Key Implementation Details

### Auth (`/api/auth/`)
- Login: POST, verifies email/password with simpleHash, returns user without password
- Register: POST, creates user with hashed password, auto-creates cart
- Me: GET, fetches user by userId query param

### Products (`/api/products/`)
- List: GET with search, category, brand, minPrice, maxPrice, rating filters + sort (price_asc, price_desc, rating, newest, featured) + pagination
- Detail: GET with category and reviews (including user info)

### Categories (`/api/categories/`)
- List: GET with product count per category
- CRUD: Create, Update, Delete (prevents delete if products exist)

### Cart (`/api/cart/`)
- GET: Returns cart with items, product details, subtotal, itemCount
- POST: Add item, auto-create cart, handle existing items (increment qty), stock validation
- PUT/DELETE: Update quantity (with stock check), remove items

### Wishlist (`/api/wishlist/`)
- GET/POST/DELETE: Standard CRUD with duplicate check on [userId, productId]

### Orders (`/api/orders/`)
- GET: User's orders with items and product details
- POST: Full checkout flow - cart validation, stock check, coupon application, tax (18% GST), shipping (free >₹500), stock decrement, coupon usage update, cart clear
- PUT: Admin order status updates

### Banners (`/api/banners/`)
- GET: Active banners ordered by `order` field
- Full CRUD for admin

### Coupons (`/api/coupons/`)
- POST validate: Full validation (active, expiry, usage, min purchase), returns discount calculation
- Full CRUD for admin

### Admin (`/api/admin/`)
- Stats: Total counts, revenue, orders by status, recent orders, monthly sales (6 months), top categories
- Products: List with search/pagination/review counts, create, update, soft delete
- Users: List with order/review counts, role update, delete (admin-protected)

## Lint Status
✅ Zero errors, zero warnings after fixes

# OnDemand — Integrated Digital Marketplace

> **One platform. Every product. Every service.**

A full-stack B2C marketplace built with the MERN stack where vendors list products and services, customers browse and purchase, and admins manage the platform — all in one place.

---

## 🚀 Live Demo

| Service | URL |
|---|---|
| 🌐 Frontend | [ondemand.vercel.app](https://ondemand.vercel.app) |
| ⚙️ Backend API | [ondemand-backend.onrender.com](https://ondemand-backend.onrender.com) |

---

## 📌 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Routes](#-api-routes)
- [Database Design](#-database-design)
- [Team](#-team)

---

## ✨ Features

### 👤 Authentication & Security
- JWT-based stateless authentication with role-based access control
- Three roles — **Customer**, **Vendor**, **Admin** — each with separate dashboards
- Password hashing with bcrypt (salt rounds: 10)
- Session restore on page refresh via `/api/auth/me`

### 🛒 Customer
- Browse products and services with search, category filter, and store filter
- Add to cart, apply coupon codes, and place orders
- Book services directly with a date picker
- Order tracking timeline (Placed → Confirmed → Delivered)
- Wishlist to save products for later
- My Orders, My Bookings with status tracking
- Request returns on delivered orders
- Download PDF invoice for any order
- Share products/services on WhatsApp, Facebook, Twitter, Telegram, LinkedIn

### 🏪 Vendor
- Create and manage store profile with logo and social media links
- List products and services with Cloudinary image uploads
- Set product-level discounts and store-wide sale percentage
- Create and manage coupon codes (percentage or flat discount)
- Manage incoming orders and bookings with status updates
- View return requests and approve or reject them
- Real-time chat with customers and admin

### 🛡️ Admin
- Approve or reject vendor registrations
- Manage all users — view, search, delete
- Remove inappropriate product listings
- View platform-wide statistics dashboard
- Monitor all return requests
- Chat with vendors directly
- View complete admin activity audit log (PostgreSQL)
- View daily platform analytics snapshots (PostgreSQL)
- Manage newsletter subscribers (PostgreSQL)

### 💬 Real-Time Chat (Socket.io)
- Customer ↔ Vendor chat
- Admin ↔ Vendor chat
- Persistent message history saved in MongoDB
- Typing indicator and online status
- Unread message count badge in navbar

### 📧 Email Notifications (Nodemailer)
- Order placed and status updates
- Booking confirmed and status updates
- Vendor approved / rejected by admin

### 🐘 PostgreSQL Features (Prisma)
- **Admin Audit Logs** — every admin action recorded with timestamp
- **Platform Analytics** — daily snapshots of orders, revenue, new users
- **Newsletter Subscriptions** — any visitor can subscribe from landing page

---

## 🛠 Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express.js | Server and REST API |
| MongoDB + Mongoose | Primary database |
| PostgreSQL + Prisma | Audit logs, analytics, newsletter |
| JWT | Authentication |
| bcryptjs | Password hashing |
| Socket.io | Real-time chat |
| Cloudinary + Multer | Image uploads |
| Nodemailer | Email notifications |
| pdfkit | Invoice PDF generation |

### Frontend
| Technology | Purpose |
|---|---|
| React.js (Vite) | UI framework |
| Tailwind CSS | Styling |
| React Router DOM | Client-side routing |
| Axios | HTTP requests with JWT interceptor |
| Context API | Global state management |
| Socket.io-client | Real-time chat |

### Cloud Services
| Service | Purpose |
|---|---|
| MongoDB Atlas | Cloud MongoDB database |
| Neon.tech | Free cloud PostgreSQL |
| Cloudinary | Image storage + CDN |
| Render | Backend deployment |
| Vercel | Frontend deployment |

---

## 📁 Project Structure

```
ondemand/
├── backend/
│   ├── config/
│   │   ├── db.js                  # MongoDB connection
│   │   ├── cloudinary.js          # Cloudinary + Multer setup
│   │   └── prismaClient.js        # Prisma PostgreSQL client
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── vendorController.js
│   │   ├── productController.js
│   │   ├── serviceController.js
│   │   ├── cartController.js
│   │   ├── orderController.js
│   │   ├── bookingController.js
│   │   ├── adminController.js
│   │   ├── couponController.js
│   │   ├── returnController.js
│   │   ├── chatController.js
│   │   ├── auditController.js
│   │   ├── analyticsController.js
│   │   └── newsletterController.js
│   ├── middleware/
│   │   ├── authMiddleware.js       # protect + authorizeRoles
│   │   └── errorMiddleware.js
│   ├── models/                    # MongoDB Mongoose models
│   │   ├── User.js
│   │   ├── VendorProfile.js
│   │   ├── Product.js
│   │   ├── Service.js
│   │   ├── Cart.js
│   │   ├── Order.js
│   │   ├── Booking.js
│   │   ├── Review.js
│   │   ├── Wishlist.js
│   │   ├── Coupon.js
│   │   ├── ReturnRequest.js
│   │   ├── Conversation.js
│   │   └── Message.js
│   ├── prisma/
│   │   └── schema.prisma          # PostgreSQL models
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── vendorRoutes.js
│   │   ├── productRoutes.js
│   │   ├── serviceRoutes.js
│   │   ├── cartRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── bookingRoutes.js
│   │   ├── adminRoutes.js
│   │   ├── couponRoutes.js
│   │   ├── returnRoutes.js
│   │   ├── chatRoutes.js
│   │   ├── auditRoutes.js
│   │   ├── analyticsRoutes.js
│   │   └── newsletterRoutes.js
│   ├── tests/
│   │   ├── auth.test.js
│   │   └── products.test.js
│   ├── utils/
│   │   └── emailService.js
│   ├── socketHandler.js
│   └── server.js
│
└── frontend/
    └── src/
        ├── api/
        │   └── axios.js            # Axios instance with JWT interceptor
        ├── context/
        │   ├── AuthContext.jsx
        │   └── SocketContext.jsx
        ├── routes/
        │   └── ProtectedRoute.jsx
        ├── components/
        │   ├── Navbar.jsx
        │   ├── Footer.jsx
        │   └── Loader.jsx
        └── pages/
            ├── LandingPage.jsx
            ├── VendorStore.jsx
            ├── Chat.jsx
            ├── Conversations.jsx
            ├── EditProfile.jsx
            ├── auth/
            │   ├── Login.jsx
            │   ├── Register.jsx
            │   └── Unauthorized.jsx
            ├── customer/
            │   ├── Home.jsx
            │   ├── BrowseProducts.jsx
            │   ├── BrowseServices.jsx
            │   ├── ProductDetail.jsx
            │   ├── ServiceDetail.jsx
            │   ├── Cart.jsx
            │   ├── MyOrders.jsx
            │   ├── OrderDetail.jsx
            │   ├── MyBookings.jsx
            │   └── Wishlist.jsx
            ├── vendor/
            │   ├── VendorDashboard.jsx
            │   ├── VendorProfile.jsx
            │   ├── ManageProducts.jsx
            │   ├── ManageServices.jsx
            │   ├── ManageOrders.jsx
            │   ├── ManageBookings.jsx
            │   └── ManageCoupons.jsx
            └── admin/
                ├── AdminDashboard.jsx
                ├── ManageVendors.jsx
                ├── ManageUsers.jsx
                ├── AdminManageProducts.jsx
                ├── ManageReturns.jsx
                ├── AuditLogs.jsx
                ├── PlatformAnalytics.jsx
                └── NewsletterSubscribers.jsx
```

---

## ⚡ Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- Neon.tech account (free PostgreSQL)
- Cloudinary account (free)

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/ondemand.git
cd ondemand
```

### 2. Setup Backend
```bash
cd backend
npm install

# Setup Prisma
npx prisma migrate dev --name init
npx prisma generate
```

### 3. Setup Frontend
```bash
cd frontend
npm install
```

### 4. Add environment variables (see below)

### 5. Run the project
```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

### 6. Run Tests
```bash
cd backend
npm test
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔐 Environment Variables

### Backend — create `backend/.env`

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/ondemand

# PostgreSQL (Neon.tech)
DATABASE_URL=postgresql://user:password@ep-xxx.neon.tech/neondb?sslmode=require

# JWT
JWT_SECRET=your_super_secret_jwt_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (Gmail)
EMAIL_USER=youremail@gmail.com
EMAIL_PASS=your_gmail_app_password

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

### Frontend — create `frontend/.env`

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 📡 API Routes

### Auth
| Method | Route | Description | Access |
|---|---|---|---|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login and get JWT | Public |
| GET | `/api/auth/me` | Get current user | Protected |
| PUT | `/api/auth/profile` | Update profile | Protected |

### Products
| Method | Route | Description | Access |
|---|---|---|---|
| GET | `/api/products` | Get all products | Public |
| POST | `/api/products` | Create product | Vendor |
| GET | `/api/products/:id` | Get single product | Public |
| PUT | `/api/products/:id` | Update product | Vendor |
| DELETE | `/api/products/:id` | Delete product | Vendor |
| GET | `/api/products/vendor/:vendorId` | Get vendor products | Public |

### Orders
| Method | Route | Description | Access |
|---|---|---|---|
| POST | `/api/orders` | Place order | Customer |
| GET | `/api/orders/my` | My orders | Customer |
| GET | `/api/orders/vendor` | Vendor orders | Vendor |
| PUT | `/api/orders/:id/status` | Update status | Vendor |
| GET | `/api/orders/:id/invoice` | Download invoice PDF | Customer |

> 📘 Full API documentation available at `/api-docs` (Swagger UI)

---

## 🗄 Database Design

### MongoDB Collections (7)
| Schema | Key Fields |
|---|---|
| User | name, email, password, role |
| VendorProfile | userId, storeName, category, isApproved, onSale |
| Product | vendorId, name, price, image, discountPercentage |
| Service | vendorId, name, price, duration, image |
| Cart | customerId, items[ ] |
| Order | customerId, vendorId, items[ ], totalAmount, status |
| Booking | customerId, vendorId, serviceId, scheduledDate, status |

### PostgreSQL Tables (3 — via Prisma)
| Table | Purpose |
|---|---|
| AuditLog | Admin activity history |
| DailyAnalytics | Platform stats snapshots |
| NewsletterSubscriber | Email subscriptions |

---

## 👥 Team

| Member | Role |
|---|---|
|Ansh Preet Kaur| Project Lead |
| Angelpreet kaur | Backend + Frontend | 
| Amanjot Kaur | Backend + Frontend | 
| Akshra Saluja | Backend + Frontend |

---

## 📸 Screenshots

> *(Add screenshots of your app here)*

| Landing Page | Admin Dashboard | Vendor Dashboard |
|---|---|---|
| ![Landing]() | ![Admin]() | ![Vendor]() |

| Browse Products | Cart | Chat |
|---|---|---|
| ![Browse]() | ![Cart]() | ![Chat]() |

---

## 📄 License

This project is built for academic purposes — Chitkara University, Backend Engineering-I (24CSE0214), Semester IV, Batch 2024.

---

<div align="center">
  <strong>OnDemand</strong> — One platform. Every product. Every service.
  <br/>
  Built with ❤️ using the MERN Stack
</div>

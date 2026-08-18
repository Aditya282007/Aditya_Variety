# Variety Store 🛒

A full-stack e-commerce platform for a neighborhood variety/general store. Built with React + Vite (frontend) and Express.js + MongoDB (backend).

## Features

### Customer Facing
- **Homepage** - Featured products, categories, trust badges
- **Product Catalog** - Search, filter by category, pagination
- **Product Details** - Images, description, stock status, quantity selector
- **Shopping Cart** - Persistent (localStorage), quantity controls
- **Checkout** - Address form → Creates order → Redirects to WhatsApp with pre-filled message
- **Account** - Order history, profile editing, password change

### Admin Dashboard
- **Dashboard** - Orders today, pending orders, low stock count
- **Products CRUD** - Add/edit/delete products with image upload (Cloudinary)
- **Orders Management** - View all orders, filter by status, update status
- **Low Stock Alerts** - Visual indicators for products with < 5 stock

### Technical
- JWT Authentication (HttpOnly cookies, cross-origin ready)
- Role-based access (Customer / Admin)
- Mobile-first responsive design
- Custom design system (warm brand colors, Playfair Display + DM Sans)
- SEO-friendly SPA with proper routing

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS |
| Backend | Node.js, Express.js, MongoDB (Mongoose) |
| Auth | JWT (HttpOnly cookies), bcryptjs |
| Images | Cloudinary (multer-storage-cloudinary) |
| Deployment | Vercel (Frontend), Render (Backend), MongoDB Atlas |

## Project Structure

```
Aditya-Variety/
├── backend/                 # Express.js API
│   ├── src/
│   │   ├── config/          # DB, Cloudinary
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/      # Auth, error handling
│   │   ├── models/          # User, Product, Order
│   │   ├── routes/          # API routes
│   │   └── utils/           # Seed script
│   └── .env                 # Backend env vars
├── frontend/                # React + Vite
│   ├── src/
│   │   ├── components/      # Reusable UI (Button, Card, Navbar, etc.)
│   │   ├── context/         # Auth, Cart state
│   │   ├── pages/           # Route pages
│   │   ├── services/        # API client
│   │   └── utils/           # Helpers
│   ├── vercel.json          # SPA routing config
│   └── .env                 # Frontend env vars
└── DEPLOYMENT.md            # Deployment guide
```

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Cloudinary account (for images)

### Backend Setup
```bash
cd backend
cp .env.example .env
# Edit .env with your values
npm install
npm run seed          # Creates admin user + sample products
npm run dev           # Starts on http://localhost:5000
```

### Frontend Setup
```bash
cd frontend
cp .env.example .env
# Edit .env with your API URL
npm install
npm run dev           # Starts on http://localhost:5173
```

### Admin Credentials
**For security, admin credentials are NOT hardcoded.** Set them via environment variables before running the seed script:

```env
# Backend .env
SEED_ADMIN_PHONE=9876543210      # Your admin phone number
SEED_ADMIN_PASSWORD=YourStrongPassword123  # Min 8 characters
```

Then run:
```bash
npm run seed
```

This creates the admin user with your custom credentials and seeds sample products.

### Default Development Login (Local Only)
For local development only, you can use the example `.env.example` which includes development-only defaults. **Never use these in production.**

## Environment Variables

### Backend (`.env`)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/variety-store
JWT_SECRET=your-super-secret-jwt-key
FRONTEND_URL=http://localhost:5173
WHATSAPP_NUMBER=91XXXXXXXXXX
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Admin seeding (REQUIRED)
SEED_ADMIN_PHONE=9876543210
SEED_ADMIN_PASSWORD=YourStrongPassword123
```

### Frontend (`.env`)
```env
VITE_API_URL=http://localhost:5000/api
VITE_WHATSAPP_NUMBER=91XXXXXXXXXX
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Customer registration |
| POST | `/api/auth/login` | Login (customer/admin) |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/products` | List products (filter, search, paginate) |
| GET | `/api/products/:id` | Get product details |
| POST | `/api/products` | Create product (admin) |
| PUT | `/api/products/:id` | Update product (admin) |
| DELETE | `/api/products/:id` | Delete product (admin) |
| POST | `/api/orders` | Create order (customer) |
| GET | `/api/orders/my-orders` | Customer's orders |
| GET | `/api/orders` | All orders (admin) |
| PUT | `/api/orders/:id/status` | Update order status (admin) |

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

Quick deploy:
1. Push to GitHub
2. **Frontend**: Connect to Vercel, set Root Directory to `frontend`
3. **Backend**: Connect to Render, set Build Command `npm install`, Start Command `npm start`
4. **Database**: MongoDB Atlas (free tier)
5. Add environment variables in both platforms

## License

MIT License - see [LICENSE](LICENSE) for details.
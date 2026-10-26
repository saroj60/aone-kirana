# Aone Kirana Backend (Node.js, Express, MongoDB, JWT)

REST API backend for the **Aone Kirana** grocery e-commerce web application.

## Prerequisites
- Node.js (v18+)
- MongoDB (local instance or MongoDB Atlas URI)

## Setup & Run

1. Navigate to the `server/` directory:
   ```bash
   cd server
   npm install
   ```

2. Configure environment variables in `.env`:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/aone_kirana
   JWT_SECRET=your_super_secret_jwt_key
   ```

3. Run in development mode:
   ```bash
   npm run dev
   ```

4. The server runs at `http://localhost:5000`
   - Health check: `GET http://localhost:5000/api/health`
   - Admin stats: `GET http://localhost:5000/api/admin/stats`
   - Sales chart: `GET http://localhost:5000/api/admin/sales?period=7days`
   - Update stock: `PATCH http://localhost:5000/api/admin/products/:id/stock`

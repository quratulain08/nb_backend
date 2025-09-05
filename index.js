import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import productRoutes from "./routes/products.js";
import authRoutes from "./routes/auth.js";



dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB Atlas");
    console.log("📊 Database: PRODUCTLIST");
    console.log("🌐 Cluster: NadirBrothersClusters");
    console.log("📸 Images: Cloudinary");
  })
  .catch((err) => {
    console.error("❌ MongoDB Atlas connection error:", err);
    console.error("💡 Check your credentials and IP whitelist");
    process.exit(1);
  });

// Routes
app.use("/api/products", productRoutes);

// Default Route
app.get("/", (req, res) => {
  res.json({
    message: "Nadir Brothers Backend API",
    database: "MongoDB Atlas - PRODUCTLIST",
    cluster: "NadirBrothersClusters",
    status: "Connected",
    endpoints: {
      products: "/api/products",
      uploads: "/uploads",
    },
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Backend URL: http://localhost:${PORT}`);
  console.log(`📂 API Endpoints: http://localhost:${PORT}/api/products`);
});

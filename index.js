import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import productRoutes from "./routes/products.js";

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

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

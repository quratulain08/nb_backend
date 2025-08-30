// routes/products.js
import express from "express";
import Product from "../models/product.js";
import upload from "../middleware/upload.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/cloudinaryUpload.js";

const router = express.Router();

// CREATE Product with Cloudinary image upload
router.post("/", upload.single("image"), async (req, res) => {
  try {
    console.log("Request body:", req.body);
    console.log("Request file:", req.file ? "File received" : "No file");
    
    let imageUrl = null;
    let cloudinaryPublicId = null;
    
    // Upload image to Cloudinary if provided
    if (req.file) {
      try {
        const result = await uploadToCloudinary(req.file.buffer, 'nadir-brothers/products');
        imageUrl = result.secure_url;
        cloudinaryPublicId = result.public_id;
        console.log("✅ Image uploaded to Cloudinary:", result.secure_url);
      } catch (uploadError) {
        console.error("❌ Cloudinary upload error:", uploadError);
        return res.status(500).json({ error: "Failed to upload image" });
      }
    }
    
    const newProduct = new Product({
      name: req.body.name,
      description: req.body.description || "",
      image: imageUrl,
      cloudinaryPublicId: cloudinaryPublicId,
      isAvailable: req.body.isAvailable === 'true' || req.body.isAvailable === true,
    });

    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ error: "Failed to create product", details: error.message });
  }
});

// ➡️ Get All Products (GET /api/products)
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// ➡️ Get Single Product (GET /api/products/:id)
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) {
    console.error("Error fetching product:", err);
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

// ➡️ Update Product with Cloudinary
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    console.log("Update request body:", req.body);
    console.log("Update request file:", req.file ? "File received" : "No file");
    
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    
    const updateData = {
      name: req.body.name,
      description: req.body.description || "",
      isAvailable: req.body.isAvailable === 'true' || req.body.isAvailable === true,
    };
    
    // Handle image update
    if (req.file) {
      try {
        // Delete old image from Cloudinary if exists
        if (product.cloudinaryPublicId) {
          await deleteFromCloudinary(product.cloudinaryPublicId);
          console.log("✅ Old image deleted from Cloudinary");
        }
        
        // Upload new image to Cloudinary
        const result = await uploadToCloudinary(req.file.buffer, 'nadir-brothers/products');
        updateData.image = result.secure_url;
        updateData.cloudinaryPublicId = result.public_id;
        console.log("✅ New image uploaded to Cloudinary:", result.secure_url);
      } catch (uploadError) {
        console.error("❌ Cloudinary upload error:", uploadError);
        return res.status(500).json({ error: "Failed to upload image" });
      }
    }
    
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    res.json(updated);
  } catch (err) {
    console.error("Error updating product:", err);
    res.status(500).json({ error: "Failed to update product", details: err.message });
  }
});

// ➡️ Delete Product with Cloudinary cleanup
router.delete("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    
    // Delete image from Cloudinary if exists
    if (product.cloudinaryPublicId) {
      try {
        await deleteFromCloudinary(product.cloudinaryPublicId);
        console.log("✅ Image deleted from Cloudinary");
      } catch (deleteError) {
        console.error("❌ Failed to delete image from Cloudinary:", deleteError);
        // Continue with product deletion even if image deletion fails
      }
    }
    
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

export default router;

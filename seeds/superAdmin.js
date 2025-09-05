import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import User from "../models/User.js";

dotenv.config();

const seedSuperAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const existingAdmin = await User.findOne({ username: process.env.ADMIN_USERNAME });
    if (existingAdmin) {
      console.log("Super Admin already exists");
      process.exit();
    }

    const hashedPassword = await bcrypt.hash(
      process.env.ADMIN_PASSWORD,
      Number(process.env.BCRYPT_SALT_ROUNDS)
    );

    const superAdmin = new User({
      username: process.env.ADMIN_USERNAME,
      password: hashedPassword,
      role: "superadmin",
    });

    await superAdmin.save();
    console.log("✅ Super Admin created successfully");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedSuperAdmin();



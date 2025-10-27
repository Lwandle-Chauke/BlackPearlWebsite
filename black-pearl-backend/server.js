import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import messageRoutes from "./routes/messageRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config({ path: './black-pearl-backend/.env' });
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/messages", messageRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/users", userRoutes); // Use user routes

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB error:", err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

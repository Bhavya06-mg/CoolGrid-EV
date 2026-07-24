import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cors from "cors";

// Routes
import authRoutes from "./routes/authRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import supplierRoutes from "./routes/supplierRoutes.js";
import userRoutes from "./routes/userRoutes.js";


dotenv.config();
connectDB();

const app = express();
app.use(express.json());

// Routes

// app.use("/api/customer", customerRoutes);
// app.use("/api/supplier", supplierRoutes);
// app.use("/api/user", userRoutes);
// app.get("/test", (req, res) => {
//   res.json({ message: "Backend Working" });
// });


export default app;

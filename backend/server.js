import { createServer } from "http";
import { Server } from "socket.io";
import app from "./src/app.js";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";   // ✅ REQUIRED IMPORT

import customerRoutes from "./src/routes/customerRoutes.js";
import supplierRoutes from "./src/routes/supplierRoutes.js";
import supplierStatsRoutes from "./src/routes/supplierStatsRoutes.js";
import requestRoutes from "./src/routes/requestRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";

const PORT = process.env.PORT || 5000;

// Create HTTP Server
const server = createServer(app);

// For __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//
// ---------------------------
// 🔥 SERVE REACT BUILD (NO ERRORS)
// ---------------------------
//

app.use(express.static(path.join(__dirname, "build")));

app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

//
// ---------------------------
// 🔥 SOCKET.IO (Render Compatible)
// ---------------------------
//

// ✅ Create io BEFORE using io.on()
const io = new Server(server, {
  cors: {
    origin: [
      "https://coolgrid-ev-1.onrender.com",
      "http://localhost:3000",
      "http://192.168.43.162:3000",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

// CORS middleware for API
app.use(
  cors({
    origin: [
      "https://coolgrid-ev-1.onrender.com",
      "http://localhost:3000",
      "http://192.168.43.162:3000",
    ],
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type,Authorization",
    credentials: true,
  })
);

io.on("connection", (socket) => {
  console.log("🟢 New client connected:", socket.id);

  socket.on("joinSupplierRoom", (supplierId) => {
    socket.join(supplierId);
    console.log(`🏠 Supplier joined room: ${supplierId}`);
  });

  socket.on("joinCustomerRoom", (customerId) => {
    socket.join(customerId);
    console.log(`👤 Customer joined room: ${customerId}`);
  });

  socket.on("paymentConfirmed", (data) => {
    io.to(data.supplierId).emit("paymentConfirmed", data);
  });

  socket.on("cashPaymentChosen", (data) => {
    if (!data.supplierId) {
      console.error("❌ Missing supplierId");
      return;
    }
    io.to(data.supplierId.toString()).emit("cashPaymentChosen", data);
  });

  socket.on("upiPaymentDone", (data) => {
    io.to(data.supplierId.toString()).emit("upiPaymentDone", data);
  });

  socket.on("paymentConfirmedBySupplier", (data) => {
    console.log("💚 Forwarding payment confirmation to customer");
    io.to(data.customerId).emit("paymentConfirmedBySupplier", data);
  });

  socket.on("disconnect", () => {
    console.log("🔴 Client disconnected:", socket.id);
  });
});

//
// ---------------------------
// 🔥 API Routes
// ---------------------------
//

app.use("/api/customer", customerRoutes);
app.use("/api/supplier", supplierRoutes);
app.use("/api/suppliers/stats", supplierStatsRoutes);
app.use("/api/request", requestRoutes);
app.use("/api/profile", userRoutes);

//
// ---------------------------
// 🚀 Start Server
// ---------------------------
//

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// ✅ Export io so controllers can use it
export { io };

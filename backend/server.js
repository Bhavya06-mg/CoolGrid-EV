import { createServer } from "http";
import { Server } from "socket.io";
import app from "./src/app.js";

import customerRoutes from "./src/routes/customerRoutes.js";
import supplierRoutes from "./src/routes/supplierRoutes.js";
import supplierStatsRoutes from "./src/routes/supplierStatsRoutes.js";
import requestRoutes from "./src/routes/requestRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";

const PORT = process.env.PORT || 5000;

const server = createServer(app);

// ✅ Create and export socket instance
export const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});


io.on("connection", (socket) => {
  console.log("🟢 New client connected:", socket.id);

  // Supplier joins their private room
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
    console.error("❌ Missing supplierId in cashPaymentChosen");
    return;
  }
    io.to(data.supplierId.toString()).emit("cashPaymentChosen", data);
  });

  socket.on("upiPaymentDone", (data) => {
    io.to(data.supplierId.toString()).emit("upiPaymentDone", data);
  });
  socket.on("paymentConfirmedBySupplier", (data) => {
  console.log("💚 Forwarding payment confirmation to customer:", data);

  io.to(data.customerId).emit("paymentConfirmedBySupplier", {
    message: data.message,
    requestId: data.requestId,
    supplierId: data.supplierId,
  });
});

  socket.on("disconnect", () => {
    console.log("🔴 Client disconnected:", socket.id);
  });
});


// Routes
app.use("/api/customer", customerRoutes);
app.use("/api/supplier", supplierRoutes);
app.use("/api/suppliers/stats", supplierStatsRoutes);
app.use("/api/request", requestRoutes);
app.use("/api/profile", userRoutes);


server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});



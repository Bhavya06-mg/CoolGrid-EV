import express from "express";
import {changePassword} from "../controllers/authController.js"
import { protect } from "../middleware/authMiddleware.js";
import { registerCustomer, registerSupplier, login } from "../controllers/authController.js";

const router = express.Router();

router.post("/register/customer", registerCustomer);
router.post("/register/supplier", registerSupplier);
router.post("/login", login);
router.put("/change-password/:userId", protect, changePassword);
router.post("/register/customer", (req, res, next) => {
  console.log("✅ Route reached");
  next();
}, registerCustomer);

export default router;

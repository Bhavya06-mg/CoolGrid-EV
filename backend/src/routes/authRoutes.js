import express from "express";
import {changePassword} from "../controllers/authController.js"
import { protect } from "../middleware/authMiddleware.js";
import { registerCustomer, registerSupplier, login } from "../controllers/authController.js";

const router = express.Router();

router.post("/register/customer", registerCustomer);
router.post("/register/supplier", registerSupplier);
router.post("/login", login);
router.put("/change-password/:userId", protect, changePassword);

export default router;

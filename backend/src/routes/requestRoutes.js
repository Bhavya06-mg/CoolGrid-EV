import express from "express";
import {
  createRequest,
  acceptRequest,
  rejectRequest,
  getRequestStatus,
  updateCustomerLocation,
  verifyOtp,
  startCharging,
  completeCharging,
  markPaymentDone
} from "../controllers/requestController.js";
import { protect } from "../middleware/authMiddleware.js";


const router = express.Router();

router.post("/create", protect, createRequest);
router.post("/accept/:requestId", protect, acceptRequest);
router.post("/reject/:requestId", protect, rejectRequest);
router.get("/status/:requestId", protect, getRequestStatus);
router.post("/verify-otp/:requestId",protect, verifyOtp);
router.post("/customer/update-location", updateCustomerLocation);
router.post("/start-charging/:requestId", protect, startCharging);
router.post("/complete-charging/:requestId", protect, completeCharging);
router.put("/:requestId/markPaid", markPaymentDone);



export default router;

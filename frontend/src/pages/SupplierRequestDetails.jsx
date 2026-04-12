// src/pages/SupplierRequestDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Container, Card, Button, Form, Alert, Spinner } from "react-bootstrap";
import io from "socket.io-client";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";


const BACKEND = "https://coolgrid-ev-1.onrender.com";
const socket = io(BACKEND, { autoConnect: true });



export default function SupplierRequestDetails() {
  const { requestId } = useParams();
  

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);

  // OTP
  const [enteredOtp, setEnteredOtp] = useState("");
  const [verificationMsg, setVerificationMsg] = useState("");

  // charging states
  const [chargingStarted, setChargingStarted] = useState(false);
  const [chargingCompleted, setChargingCompleted] = useState(false);
  // PAYMENT STATES
const [chargedUnits, setChargedUnits] = useState(0);
const [totalCost, setTotalCost] = useState(0);
const [showPaymentSection, setShowPaymentSection] = useState(false);

// NAVIGATION
const navigate = useNavigate();

  // payment states
  // paymentMode is derived from socket events OR backend request.payment.mode
  const [paymentMode, setPaymentMode] = useState(null); // "CASH" | "UPI" | null
  const [paymentConfirmed, setPaymentConfirmed] = useState(false); // final supplier confirmation
  const [confirmLoading, setConfirmLoading] = useState(false);

  const [message, setMessage] = useState("");

  // Fetch request and initialize UI from backend
  useEffect(() => {
    let mounted = true;

    const fetchRequest = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${BACKEND}/api/request/status/${requestId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (!mounted) return;
        const req = res.data.request;
        setRequest(req);

        // sync charging state from backend
        if (req?.status === "CHARGING") {
          setChargingStarted(true);
          setChargingCompleted(false);
        } else if (req?.status === "COMPLETED") {
          setChargingStarted(true);
          setChargingCompleted(true);
        }

        // sync payment mode from backend (if already chosen/recorded)
        if (req?.payment?.mode) {
          setPaymentMode(req.payment.mode === "CASH" ? "CASH" : req.payment.mode);
        }

        // if already marked PAID on backend
        if (req?.status === "PAID" || req?.payment) {
          setPaymentConfirmed(true);
        }
      } catch (err) {
        console.error("❌ Error fetching request details:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchRequest();

    // join the room for this request so supplier receives events relevant to this booking
    socket.emit("joinRoom", { room: requestId });
    console.log("📡 Supplier joined room:", requestId);

    // socket listeners
    socket.on("cashPaymentChosen", (data) => {
      if (data.requestId === requestId) {
        console.log("💵 Customer selected Cash:", data);
        setPaymentMode("CASH");
        setMessage("Customer has chosen Cash on Delivery. Collect payment.");
      }
    });

    socket.on("upiPaymentDone", (data) => {
      if (data.requestId === requestId) {
        console.log("💳 UPI Payment Done:", data);
        setPaymentMode("UPI");
        setMessage("Customer completed UPI payment.");
      }
    });

    // customer may emit when they themselves confirm payment (if that flow exists)
    socket.on("paymentConfirmedByCustomer", (data) => {
      if (data.requestId === requestId) {
        console.log("🟢 Payment Confirmed By Customer:", data);
        setPaymentConfirmed(true);
        setMessage("Payment confirmed by customer.");
      }
    });

    // optional: keep listening for chargingStarted/completed events (if other actors emit them)
    socket.on("chargingStarted", (data) => {
      if (data.requestId === requestId) {
        setChargingStarted(true);
        setChargingCompleted(false);
        setMessage("⚡ Charging started.");
      }
    });

   socket.on("chargingCompleted", (data) => {
  if (data.requestId === requestId) {
    setChargingStarted(true);
    setChargingCompleted(true);
    setMessage("✅ Charging completed.");

    // 👉 Set charged units and total cost coming from backend
    if (data.chargedUnits) setChargedUnits(data.chargedUnits);
    if (data.totalCost) setTotalCost(data.totalCost);

    // 👉 Update supplier details if present
    if (data.supplier) {
      setRequest((prev) => ({ ...prev, supplier: data.supplier }));
    }

    // 👉 Show the Payment Confirmation Button Section
    setShowPaymentSection(true);
  }
});


    return () => {
      mounted = false;
      socket.off("cashPaymentChosen");
      socket.off("upiPaymentDone");
      socket.off("paymentConfirmedByCustomer");
      socket.off("chargingStarted");
      socket.off("chargingCompleted");
    };
  }, [requestId]);

  // Verify OTP handler
  const handleVerifyOtp = async () => {
    try {
      if (!enteredOtp) {
        alert("Please enter OTP");
        return;
      }
      // backend expects { enteredOtp } per your controller
      const res = await axios.post(
        `${BACKEND}/api/request/verify-otp/${requestId}`,
        { enteredOtp },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      setVerificationMsg("OTP Verified Successfully!");
      setMessage("✅ OTP Verified — you can start charging.");
      // update local request status
      setRequest((prev) => (prev ? { ...prev, status: "VERIFIED" } : prev));
    } catch (err) {
      console.error("OTP verify error:", err.response?.data || err);
      setVerificationMsg(err.response?.data?.message || "Invalid OTP");
    }
  };

  // Start charging
  const handleStartCharging = async () => {
    try {
      setChargingStarted(true); // optimistic update
      const res = await axios.post(
        `${BACKEND}/api/request/start-charging/${requestId}`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      console.log("Start charging response:", res.data);
      setMessage("⚡ Charging started.");
      setRequest((prev) => (prev ? { ...prev, status: "CHARGING" } : prev));
    } catch (err) {
      console.error("Error starting charging:", err);
      // revert optimistic
      setChargingStarted(false);
      alert("Failed to start charging. See console for details.");
    }
  };

  // Complete charging
  const handleCompleteCharging = async () => {
    try {
      const res = await axios.post(
        `${BACKEND}/api/request/complete-charging/${requestId}`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      console.log("Complete charging response:", res.data);
      setChargingCompleted(true);
      setMessage("✅ Charging completed. Awaiting payment.");
      setRequest((prev) => (prev ? { ...prev, status: "COMPLETED" } : prev));

      // forward supplier -> customer notification is handled by backend (controller emits chargingCompleted)
    } catch (err) {
      console.error("Error completing charging:", err);
      alert("Failed to complete charging. See console for details.");
    }
  };

  // Supplier confirms COD payment: call backend markPaid and emit to customer
 const handleSupplierConfirmPayment = async () => {
  try {
    setConfirmLoading(true);

    const res = await axios.put(
      `https://coolgrid-ev-1.onrender.com/api/request/${requestId}/markPaid`,
      {
        mode: "CASH",
        amountPaid: totalCost,
        transactionId: "COD-" + Date.now(),
      }
    );

    // Notify customer through socket
    socket.emit("paymentConfirmedBySupplier", {
      customerId: request.customer._id,
      supplierId: request.supplier._id,
      requestId,
      message: "Payment Completed!",
    });

    // Update UI
    setPaymentConfirmed(true);

    // Redirect after success
    navigate("/dashboard/supplier");
  } catch (err) {
    console.error("Error confirming payment:", err);
  } finally {
    setConfirmLoading(false);
  }
};


  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" />
        <p>Loading request details...</p>
      </Container>
    );
  }

  if (!request) {
    return (
      <Container className="mt-5 text-center">
        <Alert variant="danger">Request not found.</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <Card className="p-4 shadow">
        <h3>🔌 Request Details</h3>

        <p>
          <b>Customer:</b> {request.customerName || request.customer?.name}
        </p>
        <p>
          <b>Units Needed:</b> {request.unitsRequested}
        </p>
        <p>
          <b>Status:</b> {request.status}
        </p>

        <hr />

        <h4>🔐 OTP Verification</h4>

        {verificationMsg && <Alert variant="info">{verificationMsg}</Alert>}

        {request.status !== "COMPLETED" && !paymentMode && (
          <>
            <Form.Group>
              <Form.Label>Enter OTP sent to customer</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter OTP"
                value={enteredOtp}
                onChange={(e) => setEnteredOtp(e.target.value)}
              />
            </Form.Group>

            <Button className="mt-3" variant="primary" onClick={handleVerifyOtp}>
              Verify OTP
            </Button>
          </>
        )}

        <hr />

        {/* Charging Controls */}
        <div className="p-4">
          <h3>Charging Controls</h3>

          <motion.div
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-3"
          >
            <Button
              variant="success"
              onClick={handleStartCharging}
              disabled={chargingStarted}
              style={{ width: "200px" }}
            >
              {chargingStarted ? "Charging Started ✔" : "Start Charging"}
            </Button>
          </motion.div>

          <motion.div
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Button
              variant="primary"
              onClick={handleCompleteCharging}
              disabled={!chargingStarted || chargingCompleted}
              style={{ width: "200px" }}
            >
              {chargingCompleted ? "Charging Completed ✔" : "Complete Charging"}
            </Button>
          </motion.div>

          <div className="mt-4">
            {chargingCompleted ? (
              <Alert variant="success">Charging fully completed!</Alert>
            ) : chargingStarted ? (
              <Alert variant="info">Charging in progress...</Alert>
            ) : (
              <Alert variant="warning">Waiting to start charging...</Alert>
            )}
          </div>
        </div>

        <hr />

         {/* *********************************************************************
              UPDATED PAYMENT SECTION (MATCHES UI STYLE OF CHARGING CONTROLS)
        ********************************************************************** */}

       {/* Payment Section */}
<h4>💳 Payment</h4>

{/* Show Confirm Payment button for COD when charging completed */}

  <div className="p-4">
    <motion.div
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Button
        variant="success"
        onClick={handleSupplierConfirmPayment}
        disabled={confirmLoading}
        style={{ width: "220px" }}
      >
        Confrirm Payment
      </Button>
    </motion.div>
  </div>


      </Card>
    </Container>
  );
}

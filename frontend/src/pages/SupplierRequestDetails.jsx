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

const glassStyles = {
  pageWrap: { position: "relative", minHeight: "100vh" },
  bgLayer: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    overflow: "hidden",
    zIndex: -1,
    background: "linear-gradient(160deg, #0b1220 0%, #10192e 45%, #0a1420 100%)",
  },
  blob: { position: "absolute", borderRadius: "50%", filter: "blur(70px)", opacity: 0.5, pointerEvents: "none" },
  blobA: { width: 380, height: 380, top: "-8%", left: "-6%", background: "radial-gradient(circle, #f59e0b, transparent 70%)", animation: "float1 15s ease-in-out infinite" },
  blobB: { width: 340, height: 340, bottom: "-8%", right: "-8%", background: "radial-gradient(circle, #38bdf8, transparent 70%)", animation: "float2 17s ease-in-out infinite" },
  blobC: { width: 260, height: 260, top: "40%", right: "20%", background: "radial-gradient(circle, #a78bfa, transparent 70%)", animation: "float3 13s ease-in-out infinite" },
};

const GlassBackground = () => (
  <>
    <style>{`
      html, body, #root { height: 100%; margin: 0; }
      @keyframes float1 { 0%,100%{transform:translate(0,0) scale(1);} 50%{transform:translate(30px,-40px) scale(1.08);} }
      @keyframes float2 { 0%,100%{transform:translate(0,0) scale(1);} 50%{transform:translate(-40px,30px) scale(1.1);} }
      @keyframes float3 { 0%,100%{transform:translate(0,0) scale(1);} 50%{transform:translate(20px,40px) scale(0.95);} }

      .rd-heading { color: #f3f6fb; font-weight: 600; }
      .rd-text { color: rgba(230,235,244,0.8); }
      .rd-text b { color: #f3f6fb; }

      .rd-glass-card {
        background: rgba(255,255,255,0.06) !important;
        backdrop-filter: blur(24px);
        -webkit-backdrop-filter: blur(24px);
        border: 1px solid rgba(255,255,255,0.15) !important;
        border-radius: 22px !important;
        box-shadow: 0 10px 34px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08);
        color: #f3f6fb;
        padding: 32px !important;
      }

      .rd-hr { border-color: rgba(255,255,255,0.12) !important; margin: 24px 0; }

      .rd-subsection {
        background: rgba(255,255,255,0.035);
        border: 1px solid rgba(255,255,255,0.09);
        border-radius: 16px;
        padding: 20px;
      }

      .rd-glass-input {
        background: rgba(255,255,255,0.05) !important;
        border: 1px solid rgba(255,255,255,0.18) !important;
        color: #f3f6fb !important;
        border-radius: 10px !important;
        padding: 10px 14px !important;
        backdrop-filter: blur(4px);
      }
      .rd-glass-input::placeholder { color: rgba(230,235,244,0.4); }
      .rd-glass-input:focus {
        background: rgba(255,255,255,0.08) !important;
        border-color: rgba(251,191,143,0.6) !important;
        box-shadow: 0 0 0 3px rgba(201,121,61,0.18) !important;
        color: #fff !important;
      }
      .rd-glass-label { color: rgba(251,191,143,0.85); font-size: 12px; font-weight: 600; letter-spacing: 0.4px; }

      .rd-alert-info {
        background: rgba(56,189,248,0.14) !important;
        border: 1px solid rgba(125,211,252,0.35) !important;
        color: #bfe8fd !important;
        border-radius: 14px !important;
        backdrop-filter: blur(10px);
      }
      .rd-alert-success {
        background: rgba(34,197,94,0.15) !important;
        border: 1px solid rgba(74,222,128,0.4) !important;
        color: #a7f3c8 !important;
        border-radius: 14px !important;
        backdrop-filter: blur(10px);
      }
      .rd-alert-warning {
        background: rgba(245,158,11,0.15) !important;
        border: 1px solid rgba(251,191,143,0.4) !important;
        color: #fde3b8 !important;
        border-radius: 14px !important;
        backdrop-filter: blur(10px);
      }
      .rd-alert-danger {
        background: rgba(220,38,38,0.15) !important;
        border: 1px solid rgba(248,113,113,0.4) !important;
        color: #fca5a5 !important;
        border-radius: 14px !important;
        backdrop-filter: blur(10px);
      }

      .rd-btn-primary {
        border: none !important;
        background: linear-gradient(180deg, rgba(56,189,248,0.9), rgba(59,130,246,0.8)) !important;
        color: #fff !important;
        font-weight: 600 !important;
        border-radius: 999px !important;
        padding: 10px 20px !important;
        box-shadow: 0 6px 18px rgba(56,189,248,0.3), inset 0 1px 0 rgba(255,255,255,0.4);
        transition: transform 0.2s ease, opacity 0.2s ease;
      }
      .rd-btn-primary:hover:not(:disabled) { transform: translateY(-2px); }
      .rd-btn-primary:disabled { opacity: 0.55; }

      .rd-btn-success {
        border: none !important;
        background: linear-gradient(180deg, rgba(74,222,128,0.9), rgba(34,197,94,0.8)) !important;
        color: #06210f !important;
        font-weight: 600 !important;
        border-radius: 999px !important;
        padding: 10px 20px !important;
        box-shadow: 0 6px 18px rgba(52,211,153,0.3), inset 0 1px 0 rgba(255,255,255,0.4);
        transition: transform 0.2s ease, opacity 0.2s ease;
      }
      .rd-btn-success:hover:not(:disabled) { transform: translateY(-2px); }
      .rd-btn-success:disabled { opacity: 0.55; }
    `}</style>
    <div style={glassStyles.bgLayer}>
      <div style={{ ...glassStyles.blob, ...glassStyles.blobA }} />
      <div style={{ ...glassStyles.blob, ...glassStyles.blobB }} />
      <div style={{ ...glassStyles.blob, ...glassStyles.blobC }} />
    </div>
  </>
);

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
      <div style={glassStyles.pageWrap}>
        <GlassBackground />
        <Container className="text-center" style={{ position: "relative", zIndex: 1, paddingTop: 120 }}>
          <Spinner animation="border" style={{ color: "#fbbf8f" }} />
          <p className="rd-text mt-3">Loading request details...</p>
        </Container>
      </div>
    );
  }

  if (!request) {
    return (
      <div style={glassStyles.pageWrap}>
        <GlassBackground />
        <Container className="mt-5 text-center" style={{ position: "relative", zIndex: 1 }}>
          <Alert className="rd-alert-danger">Request not found.</Alert>
        </Container>
      </div>
    );
  }

  return (
    <div style={glassStyles.pageWrap}>
      <GlassBackground />
      <Container style={{ position: "relative", zIndex: 1, paddingTop: 48, paddingBottom: 60, maxWidth: 720 }}>
        <Card className="rd-glass-card">
          <h3 className="rd-heading">🔌 Request Details</h3>

          <p className="rd-text mt-3">
            <b>Customer:</b> {request.customerName || request.customer?.name}
          </p>
          <p className="rd-text">
            <b>Units Needed:</b> {request.unitsRequested}
          </p>
          <p className="rd-text">
            <b>Status:</b> {request.status}
          </p>

          <hr className="rd-hr" />

          <h4 className="rd-heading" style={{ fontSize: 18 }}>🔐 OTP Verification</h4>

          {verificationMsg && <Alert className="rd-alert-info mt-2">{verificationMsg}</Alert>}

          {request.status !== "COMPLETED" && !paymentMode && (
            <div className="rd-subsection mt-3">
              <Form.Group>
                <Form.Label className="rd-glass-label">Enter OTP sent to customer</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter OTP"
                  className="rd-glass-input"
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value)}
                />
              </Form.Group>

              <Button className="rd-btn-primary mt-3" onClick={handleVerifyOtp}>
                Verify OTP
              </Button>
            </div>
          )}

          <hr className="rd-hr" />

          {/* Charging Controls */}
          <div className="rd-subsection">
            <h4 className="rd-heading" style={{ fontSize: 18, marginBottom: 16 }}>Charging Controls</h4>

            <motion.div
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-3"
            >
              <Button
                className="rd-btn-success"
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
                className="rd-btn-primary"
                onClick={handleCompleteCharging}
                disabled={!chargingStarted || chargingCompleted}
                style={{ width: "200px" }}
              >
                {chargingCompleted ? "Charging Completed ✔" : "Complete Charging"}
              </Button>
            </motion.div>

            <div className="mt-4">
              {chargingCompleted ? (
                <Alert className="rd-alert-success">Charging fully completed!</Alert>
              ) : chargingStarted ? (
                <Alert className="rd-alert-info">Charging in progress...</Alert>
              ) : (
                <Alert className="rd-alert-warning">Waiting to start charging...</Alert>
              )}
            </div>
          </div>

          <hr className="rd-hr" />

           {/* *********************************************************************
                UPDATED PAYMENT SECTION (MATCHES UI STYLE OF CHARGING CONTROLS)
          ********************************************************************** */}

         {/* Payment Section */}
          <h4 className="rd-heading" style={{ fontSize: 18 }}>💳 Payment</h4>

          {/* Show Confirm Payment button for COD when charging completed */}

          <div className="rd-subsection mt-2">
            <motion.div
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Button
                className="rd-btn-success"
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
    </div>
  );
}
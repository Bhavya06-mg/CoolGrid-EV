// src/pages/BookingPage.jsx
import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import axios from "axios";
import { Spinner, Container, Button, Alert, Image } from "react-bootstrap";

const BACKEND = "https://coolgrid-ev-1.onrender.com";

// ✅ Create a single socket connection
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
    background: "#0b0b0c",
  },
  blob: { position: "absolute", borderRadius: "50%", display: "none", opacity: 0.5, pointerEvents: "none" },
  blobA: { width: 380, height: 380, top: "-8%", left: "-6%", background: "radial-gradient(circle, #34e0a1, transparent 70%)", animation: "float1 15s ease-in-out infinite" },
  blobB: { width: 340, height: 340, bottom: "-8%", right: "-8%", background: "radial-gradient(circle, #34e0a1, transparent 70%)", animation: "float2 17s ease-in-out infinite" },
  blobC: { width: 260, height: 260, top: "40%", right: "20%", background: "radial-gradient(circle, #34e0a1, transparent 70%)", animation: "float3 13s ease-in-out infinite" },
};

const GlassBackground = () => (
  <>
    <style>{`
      html, body, #root { height: 100%; margin: 0; }
      @keyframes float1 { 0%,100%{transform:translate(0,0) scale(1);} 50%{transform:translate(30px,-40px) scale(1.08);} }
      @keyframes float2 { 0%,100%{transform:translate(0,0) scale(1);} 50%{transform:translate(-40px,30px) scale(1.1);} }
      @keyframes float3 { 0%,100%{transform:translate(0,0) scale(1);} 50%{transform:translate(20px,40px) scale(0.95);} }

      .booking-glass-card {
        background: #161718 !important;
        border: 1px solid #232526 !important;
        border-radius: 22px !important;
        box-shadow: 0 10px 34px rgba(0,0,0,0.4), inset 0 1px 0 #161718;
        color: #f2f4f3;
        padding: 30px !important;
      }
      .booking-heading { color: #f2f4f3; font-weight: 600; }
      .booking-text { color: #9aa3a0; }

      .booking-alert-info {
        background: rgba(52,224,161,0.14) !important;
        border: 1px solid rgba(52,224,161,0.35) !important;
        color: #34e0a1 !important;
        border-radius: 14px !important;
      }
      .booking-alert-success {
        background: rgba(31,168,116,0.15) !important;
        border: 1px solid rgba(52,224,161,0.4) !important;
        color: #34e0a1 !important;
        border-radius: 14px !important;
      }
      .booking-alert-danger {
        background: rgba(220,38,38,0.15) !important;
        border: 1px solid rgba(248,113,113,0.4) !important;
        color: #fca5a5 !important;
        border-radius: 14px !important;
      }
      .booking-alert-warning {
        background: rgba(245,158,11,0.15) !important;
        border: 1px solid rgba(52,224,161,0.4) !important;
        color: #34e0a1 !important;
        border-radius: 14px !important;
      }

      .booking-otp {
        color: #34e0a1;
        font-size: 1.8rem;
        font-weight: 700;
        letter-spacing: 2px;
        text-shadow: 0 0 16px rgba(52,224,161,0.5);
      }

      .booking-btn-primary {
        border: none !important;
        background: #34e0a1 !important;
        color: #fff !important;
        font-weight: 600 !important;
        border-radius: 999px !important;
        padding: 10px 26px !important;
        box-shadow: 0 6px 18px rgba(52,224,161,0.3), inset 0 1px 0 transparent;
        transition: transform 0.2s ease;
      }
      .booking-btn-primary:hover { transform: translateY(-2px); }

      .booking-btn-success {
        border: none !important;
        background: #34e0a1 !important;
        color: #04251a !important;
        font-weight: 600 !important;
        border-radius: 999px !important;
        padding: 10px 26px !important;
        box-shadow: 0 6px 18px rgba(52,224,161,0.3), inset 0 1px 0 transparent;
        transition: transform 0.2s ease;
      }
      .booking-btn-success:hover { transform: translateY(-2px); }

      .booking-btn-amber {
        border: none !important;
        background: #34e0a1 !important;
        color: #04251a !important;
        font-weight: 600 !important;
        border-radius: 999px !important;
        padding: 10px 26px !important;
        box-shadow: 0 6px 18px rgba(52,224,161,0.3), inset 0 1px 0 transparent;
        transition: transform 0.2s ease;
      }
      .booking-btn-amber:hover { transform: translateY(-2px); }

      .booking-qr-frame {
        display: inline-block;
        padding: 14px;
        border-radius: 18px;
        background: #161718;
        border: 1px solid #232526;
        box-shadow: 0 8px 24px rgba(0,0,0,0.35);
      }
    `}</style>
    <div style={glassStyles.bgLayer}>
      <div style={{ ...glassStyles.blob, ...glassStyles.blobA }} />
      <div style={{ ...glassStyles.blob, ...glassStyles.blobB }} />
      <div style={{ ...glassStyles.blob, ...glassStyles.blobC }} />
    </div>
  </>
);

function BookingPage({ requestId: propRequestId }) {
  const [status, setStatus] = useState("PENDING"); // PENDING | ACCEPTED | REJECTED | VERIFIED | CHARGING | COMPLETED
  const [otp, setOtp] = useState("");
  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(""); // Live message display
  const mounted = useRef(false);
  const [paymentMode, setPaymentMode] = useState(null);
   const [paymentDone, setPaymentDone] = useState(false);
  const [chargedUnits, setChargedUnits]= useState(0);

  // ✅ Fetch current request details
  const fetchRequest = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const url = `${BACKEND}/api/request/status/${id}`;
      const res = await axios.get(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const req = res.data.request;
      if (!req) return;

      setLoading(false);
      setStatus(req.status);
      if (req.status === "ACCEPTED") {
        setOtp(req.otp || "");
        setSupplier(req.supplier || null);
      }
    } catch (err) {
      console.error("❌ Error fetching request status:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    mounted.current = true;
    const requestId = propRequestId || localStorage.getItem("requestId");
    const customerId =
      localStorage.getItem("customerId") || localStorage.getItem("userId");

    if (requestId) fetchRequest(requestId);

    // ✅ Join customer's socket room
    if (customerId) {
      socket.emit("joinCustomerRoom", customerId);
      console.log("📡 Joined customer room:", customerId);
    } else {
      console.warn("⚠️ No customerId found in localStorage; socket join skipped.");
    }

    // ✅ Socket listeners
    const onAccepted = (data) => {
      console.log("📩 requestAccepted:", data);
      if (!mounted.current) return;
      setStatus("ACCEPTED");
      setMessage("Your request has been accepted by the supplier!");
      if (data.otp) setOtp(data.otp);
      if (data.supplier) setSupplier(data.supplier);
    };

    const onRejected = () => {
      if (!mounted.current) return;
      setStatus("REJECTED");
      setMessage("Your request was rejected by the supplier.");
    };

    const onOtpVerified = (data) => {
      console.log("📩 otpVerified:", data);
      if (!mounted.current) return;
      setStatus("VERIFIED");
      setMessage("✅ OTP verified successfully! Proceed to charging.");
    };

    const onChargingStarted = (data) => {
      console.log("⚡ chargingStarted:", data);
      if (!mounted.current) return;
      setStatus("CHARGING");
      setMessage("⚡ Charging process has started at the station.");
    };

    const onChargingCompleted = (data) => {
          console.log("🔋 chargingCompleted:", data);
          if (!mounted.current) return;
          setStatus("COMPLETED");
          setMessage("✅ Charging completed! Please proceed to payment.");
          if (data.supplier) setSupplier(data.supplier);
        };
        const onPaymentConfirmed = (data) => {
      console.log("💰 Payment confirmed by supplier:", data);
      if (!mounted.current) return;

      setMessage("✅ Payment successfully completed!");
      setStatus("PAID");

      // Redirect to customer dashboard after 3 seconds
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 3000);
    };




    // ✅ Register all listeners once
    socket.on("paymentConfirmedBySupplier", (data) => {
      console.log("💚 Payment Confirmed by Supplier:", data);

      setMessage("✅ Payment completed successfully!");
      
      // redirect customer
      setTimeout(() => {
        window.location.href = "/dashboard/customer";
      }, 2000);
    });

    socket.on("requestAccepted", onAccepted);
    socket.on("requestRejected", onRejected);
    socket.on("otpVerified", onOtpVerified);
    socket.on("chargingStarted", onChargingStarted);
    socket.on("chargingCompleted", onChargingCompleted);
    socket.on("paymentConfirmed", onPaymentConfirmed);
    

    // ✅ Cleanup on unmount
    return () => {
      mounted.current = false;
      socket.off("requestAccepted", onAccepted);
      socket.off("requestRejected", onRejected);
      socket.off("otpVerified", onOtpVerified);
      socket.off("chargingStarted", onChargingStarted);
      socket.off("chargingCompleted", onChargingCompleted);
      socket.off("paymentConfirmed", onPaymentConfirmed);
      socket.off("paymentConfirmedBySupplier");
    };
  }, [propRequestId]);

  // ✅ Trace supplier on Google Maps
  const handleTraceSupplier = () => {
    if (!supplier) return;
    if (supplier.coordinates?.lat && supplier.coordinates?.lng) {
      window.open(
        `https://www.google.com/maps?q=${supplier.coordinates.lat},${supplier.coordinates.lng}`,
        "_blank"
      );
    } else if (supplier.location) {
      const encoded = encodeURIComponent(supplier.location);
      window.open(`https://www.google.com/maps?q=${encoded}`, "_blank");
    } else {
      alert("Supplier location not available.");
    }
  };

  const handlePaymentChoice = (mode) => {
    setPaymentMode(mode);
    if (mode === "CASH") {
      alert("Please proceed with cash on delivery.");
      socket.emit("cashPaymentChosen", {
        supplierId: supplier?._id,
        message: "Customer chose cash payment.",
      });
    }
  };
const handlePaymentDone = async () => {
  try {
    if (!supplier) {
      alert("Supplier details not available.");
      return;
    }

    const totalAmount = chargedUnits * (supplier.pricePerUnit || 0);
    const requestId = localStorage.getItem("requestId");
    const customerId = localStorage.getItem("customerId") || localStorage.getItem("userId");

    // ✅ Step 1: Emit proper message to supplier via socket
    if (supplier.upiId) {
      // Customer chose UPI
      socket.emit("upiPaymentDone", {
        supplierId: supplier._id,
        customerId,
        requestId,
        message: "💳 Customer has completed UPI payment!",
      });
    } else {
      // Customer chose Cash on Delivery
      socket.emit("cashPaymentChosen", {
        supplierId: supplier._id,
        customerId,
        requestId,
        message: "💵 Customer selected Cash on Delivery. Please collect cash after service.",
      });
    }

    // ✅ Step 2: Update backend request status
    await axios.put(
      `${BACKEND}/api/request/${requestId}/markPaid`,
      {
        mode: supplier.upiId ? "UPI" : "CASH",
        amountPaid: totalAmount,
        transactionId: supplier.upiId
          ? "TXN-" + Date.now()
          : "CASH-" + Date.now(),
      },
      { headers: { "Content-Type": "application/json" } }
    );

    // ✅ Step 3: Show success & redirect
    alert("✅ Payment successfully recorded!");
    window.location.href = "/dashboard";
  } catch (err) {
    console.error("❌ Error marking payment:", err);
    alert("Payment confirmation failed. Please try again.");
  }
};




  // ✅ Loading view
  if (loading) {
    return (
      <div style={glassStyles.pageWrap}>
        <GlassBackground />
        <Container className="text-center" style={{ position: "relative", zIndex: 1, paddingTop: 120 }}>
          <Spinner animation="border" style={{ color: "#34e0a1" }} />
          <p className="booking-text mt-3">Waiting for supplier approval...</p>
        </Container>
      </div>
    );
  }

  // ✅ Render main view
  return (
    <div style={glassStyles.pageWrap}>
      <GlassBackground />
      <Container className="text-center" style={{ position: "relative", zIndex: 1, paddingTop: 60, paddingBottom: 60, maxWidth: 640 }}>
        <div className="booking-glass-card">
          <h3 className="booking-heading">⚡ Booking Request</h3>

          {message && (
            <Alert
              className={`mt-3 ${
                status === "REJECTED"
                  ? "booking-alert-danger"
                  : status === "COMPLETED"
                  ? "booking-alert-success"
                  : "booking-alert-info"
              }`}
            >
              {message}
            </Alert>
          )}

          {status === "PENDING" && (
            <>
              <Spinner animation="grow" style={{ color: "#34e0a1" }} />
              <p className="booking-text mt-2">⏳ Waiting for supplier approval...</p>
            </>
          )}

          {status === "ACCEPTED" && supplier && (
            <div className="mt-3">
              <h5 className="booking-heading">✅ Supplier Accepted!</h5>
              <p className="booking-text"><b>Supplier:</b> {supplier.name}</p>
              <p className="booking-text"><b>Phone:</b> {supplier.phone}</p>
              <p className="booking-text">
                <b>OTP:</b>{" "}
                <span className="booking-otp">{otp}</span>
              </p>
              <Button
                className="booking-btn-success mt-3"
                onClick={handleTraceSupplier}
              >
                📍 Trace Supplier Location
              </Button>
            </div>
          )}

          {status === "VERIFIED" && (
            <Alert className="mt-3 booking-alert-success">
              ✅ OTP Verified! Proceed to charging.
            </Alert>
          )}

          {status === "CHARGING" && (
            <Alert className="mt-3 booking-alert-warning">
              ⚡ Charging in progress...
            </Alert>
          )}

          {status === "COMPLETED" && !paymentMode && (
            <div className="mt-4">
              <h5 className="booking-heading">Charging Completed ✅</h5>
              <p className="booking-text">Please choose a payment method:</p>
              <div className="d-flex justify-content-center gap-3 mt-3">
                <Button className="booking-btn-success" onClick={() => handlePaymentChoice("UPI")}>
                  💳 Pay via UPI
                </Button>
                <Button className="booking-btn-amber" onClick={() => handlePaymentChoice("CASH")}>
                  💵 Cash on Delivery
                </Button>
              </div>
            </div>
          )}

           {/* ✅ UPI PAYMENT VIEW */}
          {status === "COMPLETED" && paymentMode === "UPI" && !paymentDone && (
            <div className="mt-4">
              <h5 className="booking-heading">💳 UPI Payment</h5>
              {supplier?.qrCodeUrl ? (
                <>
                  <p className="booking-text">Scan this QR code to pay the supplier.</p>
                  <div className="booking-qr-frame">
                    <Image
                      src={supplier.qrCodeUrl}
                      alt="Supplier UPI QR"
                      width={200}
                      height={200}
                      rounded
                    />
                  </div>
                </>
              ) : (
                <p className="booking-text">⚠️ Supplier does not have a QR code. Please pay manually.</p>
              )}
              <div>
                <Button className="booking-btn-primary mt-3" onClick={handlePaymentDone}>
                  ✅ Payment Done
                </Button>
              </div>
            </div>
          )}

          {/* ✅ CASH PAYMENT VIEW */}
          {status === "COMPLETED" && paymentMode === "CASH" && (
            <div className="mt-4">
              <h5 className="booking-heading">💵 Cash on Delivery Selected</h5>
              <p className="booking-text">Inform the supplier to collect the payment after service.</p>
              <Alert className="booking-alert-info">
                Supplier will confirm payment completion.
              </Alert>
            </div>
          )}

          {paymentDone && (
            <Alert className="mt-4 booking-alert-success">
              ✅ Payment successful! Redirecting...
            </Alert>
          )}

          {status === "REJECTED" && (
            <p className="mt-3" style={{ color: "#fca5a5" }}>🚫 Supplier rejected your request.</p>
          )}
        </div>
      </Container>
    </div>
  );
}

export default BookingPage;
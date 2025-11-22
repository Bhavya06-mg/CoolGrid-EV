// src/pages/BookingPage.jsx
import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import axios from "axios";
import { Spinner, Container, Button, Alert,Image } from "react-bootstrap";

const BACKEND = "http://localhost:5000";

// ✅ Create a single socket connection
const socket = io(BACKEND, { autoConnect: true });

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
      <Container className="text-center mt-5">
        <Spinner animation="border" />
        <p>Waiting for supplier approval...</p>
      </Container>
    );
  }

  // ✅ Render main view
  return (
    <Container className="mt-5 text-center">
      <h3>⚡ Booking Request</h3>

      {message && (
        <Alert
          variant={
            status === "REJECTED"
              ? "danger"
              : status === "COMPLETED"
              ? "success"
              : "info"
          }
          className="mt-3"
        >
          {message}
        </Alert>
      )}

      {status === "PENDING" && (
        <>
          <Spinner animation="grow" variant="info" />
          <p>⏳ Waiting for supplier approval...</p>
        </>
      )}

      {status === "ACCEPTED" && supplier && (
        <div className="mt-3">
          <h5>✅ Supplier Accepted!</h5>
          <p><b>Supplier:</b> {supplier.name}</p>
          <p><b>Phone:</b> {supplier.phone}</p>
          <p>
            <b>OTP:</b>{" "}
            <span style={{ color: "green", fontSize: "1.4rem" }}>{otp}</span>
          </p>
          <Button
            variant="success"
            className="mt-3"
            onClick={handleTraceSupplier}
          >
            📍 Trace Supplier Location
          </Button>
        </div>
      )}

      {status === "VERIFIED" && (
        <Alert className="mt-3" variant="success">
          ✅ OTP Verified! Proceed to charging.
        </Alert>
      )}

      {status === "CHARGING" && (
        <Alert className="mt-3" variant="warning">
          ⚡ Charging in progress...
        </Alert>
      )}

      {status === "COMPLETED" && !paymentMode && (
        <div className="mt-4">
          <h5>Charging Completed ✅</h5>
          <p>Please choose a payment method:</p>
          <div className="d-flex justify-content-center gap-3 mt-3">
            <Button variant="success" onClick={() => handlePaymentChoice("UPI")}>
              💳 Pay via UPI
            </Button>
            <Button variant="warning" onClick={() => handlePaymentChoice("CASH")}>
              💵 Cash on Delivery
            </Button>
          </div>
        </div>
      )}

       {/* ✅ UPI PAYMENT VIEW */}
      {status === "COMPLETED" && paymentMode === "UPI" && !paymentDone && (
        <div className="mt-4">
          <h5>💳 UPI Payment</h5>
          {supplier?.qrCodeUrl ? (
            <>
              <p>Scan this QR code to pay the supplier.</p>
              <Image
                src={supplier.qrCodeUrl}
                alt="Supplier UPI QR"
                width={200}
                height={200}
                rounded
              />
            </>
          ) : (
            <p>⚠️ Supplier does not have a QR code. Please pay manually.</p>
          )}
          <Button variant="primary" className="mt-3" onClick={handlePaymentDone}>
            ✅ Payment Done
          </Button>
        </div>
      )}

      {/* ✅ CASH PAYMENT VIEW */}
      {status === "COMPLETED" && paymentMode === "CASH" && (
        <div className="mt-4">
          <h5>💵 Cash on Delivery Selected</h5>
          <p>Inform the supplier to collect the payment after service.</p>
          <Alert variant="info">
            Supplier will confirm payment completion.
          </Alert>
        </div>
      )}

      {paymentDone && (
        <Alert variant="success" className="mt-4">
          ✅ Payment successful! Redirecting...
        </Alert>
      )}

      {status === "REJECTED" && (
        <p className="text-danger mt-3">🚫 Supplier rejected your request.</p>
      )}
    </Container>
  );
}

export default BookingPage;

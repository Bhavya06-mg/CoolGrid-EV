import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button, Alert, Modal } from "react-bootstrap";
import axios from "axios";
import io from "socket.io-client";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import "bootstrap/dist/css/bootstrap.min.css";

const socket = io("https://coolgrid-ev-1.onrender.com");

function DashboardSupplier() {
  const [supplierId, setSupplierId] = useState("");
  const [requests, setRequests] = useState([]);
  const [showStats, setShowStats] = useState(false);
  const [stats, setStats] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    // Load dark mode
    const dm = localStorage.getItem("darkMode") === "true";
    setDarkMode(dm);

    if (dm) document.body.classList.add("dark-mode");
    else document.body.classList.remove("dark-mode");
  }, []);

  useEffect(() => {
    const id = localStorage.getItem("supplierId");
    console.log("Supplier ID from localStorage:", localStorage.getItem("supplierId"));
    if (!id) return;

    setSupplierId(id);
    socket.emit("joinSupplierRoom", id);

    socket.on("newChargingRequest", (data) => {
      setRequests((prev) => [...prev, data]);
    });

    return () => socket.off("newChargingRequest");
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`/api/suppliers/stats/${supplierId}`);
      setStats(response.data);
      setShowStats(true);
    } catch (err) {
      console.error("Error loading stats:", err);
    }
  };

  const handleAccept = async (requestId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `https://coolgrid-ev-1.onrender.com/api/request/accept/${requestId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      navigate(`/supplier/request-details/${res.data.request._id}`);
    } catch (err) {
      alert("Error accepting request");
    }
  };

  const handleReject = async (requestId) => {
    try {
      await axios.post(
        `https://coolgrid-ev-1.onrender.com/api/request/reject/${requestId}`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setRequests((prev) => prev.filter((r) => r._id !== requestId));
    } catch (err) {
      alert("Error rejecting");
    }
  };

  return (
    <div style={styles.pageWrap}>
      <style>{`
        html, body, #root { height: 100%; margin: 0; }
        @keyframes float1 { 0%,100%{transform:translate(0,0) scale(1);} 50%{transform:translate(30px,-40px) scale(1.08);} }
        @keyframes float2 { 0%,100%{transform:translate(0,0) scale(1);} 50%{transform:translate(-40px,30px) scale(1.1);} }
        @keyframes float3 { 0%,100%{transform:translate(0,0) scale(1);} 50%{transform:translate(20px,40px) scale(0.95);} }

        .glass-heading { color: #f3f6fb; font-weight: 600; }
        .glass-subtext { color: rgba(230,235,244,0.65); }

        .glass-stats-btn {
          border: 1px solid rgba(255,255,255,0.35) !important;
          background: linear-gradient(180deg, rgba(245,158,11,0.85), rgba(217,119,6,0.8)) !important;
          color: #2b1503 !important;
          font-weight: 600 !important;
          border-radius: 999px !important;
          padding: 10px 22px !important;
          box-shadow: 0 6px 18px rgba(201,121,61,0.3), inset 0 1px 0 rgba(255,255,255,0.4);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .glass-stats-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 24px rgba(201,121,61,0.4), inset 0 1px 0 rgba(255,255,255,0.5);
        }

        .glass-hr {
          border-color: rgba(255,255,255,0.12) !important;
          margin: 24px 0;
        }

        .glass-request-card {
          background: rgba(16,25,46,0.72) !important;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(251,191,143,0.3) !important;
          border-radius: 16px !important;
          color: #f3f6fb !important;
          box-shadow: 0 10px 30px rgba(0,0,0,0.45), 0 0 24px 2px rgba(201,121,61,0.2);
        }
        .glass-request-card strong { color: #fbbf8f; }
        .glass-accept-btn {
          border: none !important;
          background: linear-gradient(180deg, rgba(74,222,128,0.9), rgba(34,197,94,0.8)) !important;
          color: #06210f !important;
          font-weight: 600 !important;
          border-radius: 999px !important;
        }
        .glass-reject-btn {
          border: none !important;
          background: linear-gradient(180deg, rgba(248,113,113,0.9), rgba(220,38,38,0.8)) !important;
          color: #2b0505 !important;
          font-weight: 600 !important;
          border-radius: 999px !important;
        }

        .glass-modal .modal-content {
          background: rgba(16,25,46,0.85) !important;
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.16) !important;
          border-radius: 20px !important;
          color: #f3f6fb !important;
        }
        .glass-modal .modal-header {
          border-bottom: 1px solid rgba(255,255,255,0.1) !important;
        }
        .glass-modal .modal-title { color: #fbbf8f; font-weight: 600; }
        .glass-modal .btn-close {
          filter: invert(1) grayscale(100%) brightness(200%);
        }
      `}</style>

      <div style={styles.bgLayer}>
        <div style={{ ...styles.blob, ...styles.blobA }} />
        <div style={{ ...styles.blob, ...styles.blobB }} />
        <div style={{ ...styles.blob, ...styles.blobC }} />
      </div>

      <Container style={{ position: "relative", zIndex: 1, paddingTop: 48, paddingBottom: 60 }}>
        <Row>
          <Col>
            <h2 className="glass-heading">⚡ Supplier Dashboard</h2>
            <p className="glass-subtext">
              Monitor customer requests and manage your charging station.
            </p>
          </Col>
          <Col className="text-end">
            <Button className="glass-stats-btn" onClick={() => navigate("/supplier/statistics")}>
              📊 View Statistics
            </Button>
          </Col>
        </Row>

        <hr className="glass-hr" />

        {/* Notifications */}
        <div
          style={{
            position: "fixed",
            top: "90px",
            right: "30px",
            zIndex: 2000,
            width: "340px",
          }}
        >
          <AnimatePresence>
            {requests.map((req) => (
              <motion.div
                key={req._id}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 100 }}
                style={{ marginBottom: 12 }}
              >
                <Alert variant="info" className="glass-request-card">
                  <strong>🔋 New Request</strong>
                  <p style={{ margin: "6px 0" }}>From: <b>{req.customerName}</b></p>
                  <p style={{ margin: "0 0 10px" }}>Units Needed: {req.unitsNeeded}</p>

                  <div className="d-flex justify-content-end gap-2">
                    <Button size="sm" className="glass-accept-btn" onClick={() => handleAccept(req._id)}>Accept</Button>
                    <Button size="sm" className="glass-reject-btn" onClick={() => handleReject(req._id)}>Reject</Button>
                  </div>
                </Alert>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Stats Modal */}
        <Modal show={showStats} onHide={() => setShowStats(false)} className="glass-modal">
          <Modal.Header closeButton>
            <Modal.Title>📈 Charging Station Statistics</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {stats ? (
              <>
                <p><b>Total Requests:</b> {stats.totalRequests}</p>
                <p><b>Total Units Supplied:</b> {stats.totalUnitsSupplied}</p>
                <p><b>Total Revenue:</b> ₹{stats.totalRevenue}</p>
              </>
            ) : (
              <p>Loading...</p>
            )}
          </Modal.Body>
        </Modal>
      </Container>
    </div>
  );
}

const styles = {
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

export default DashboardSupplier;

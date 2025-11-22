import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button, Alert, Modal } from "react-bootstrap";
import axios from "axios";
import io from "socket.io-client";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import "bootstrap/dist/css/bootstrap.min.css";

const socket = io("http://localhost:5000");

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
        `http://localhost:5000/api/request/accept/${requestId}`,
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
        `http://localhost:5000/api/request/reject/${requestId}`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setRequests((prev) => prev.filter((r) => r._id !== requestId));
    } catch (err) {
      alert("Error rejecting");
    }
  };

  return (
    <Container className="mt-5">
      <Row>
        <Col>
          <h2 className={darkMode ? "text-light" : "text-dark"}>
            ⚡ Supplier Dashboard
          </h2>
          <p className={darkMode ? "text-light" : "text-dark"}>
            Monitor customer requests and manage your charging station.
          </p>
        </Col>
        <Col className="text-end">
          <Button variant="info" onClick={() => navigate("/supplier/statistics")}>
            📊 View Statistics
          </Button>
        </Col>
      </Row>

      <hr className={darkMode ? "border-secondary" : ""} />

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
            >
              <Alert
                variant="info"
                className={darkMode ? "bg-dark text-light border-secondary" : ""}
              >
                <strong>🔋 New Request</strong>
                <p>From: <b>{req.customerName}</b></p>
                <p>Units Needed: {req.unitsNeeded}</p>

                <div className="d-flex justify-content-end">
                  <Button size="sm" variant="success" onClick={() => handleAccept(req._id)}>Accept</Button>
                  <Button size="sm" variant="danger" className="ms-2" onClick={() => handleReject(req._id)}>Reject</Button>
                </div>
              </Alert>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Stats Modal */}
      <Modal show={showStats} onHide={() => setShowStats(false)}>
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
  );
}

export default DashboardSupplier;

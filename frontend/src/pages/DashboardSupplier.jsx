import React, { useEffect, useState } from "react";
import { Alert, Modal } from "react-bootstrap";
import axios from "axios";
import io from "socket.io-client";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

const socket = io("https://coolgrid-ev-1.onrender.com");

function DashboardSupplier() {
  const [supplierId, setSupplierId] = useState("");
  const [requests, setRequests] = useState([]);
  const [showStats, setShowStats] = useState(false);
  const [stats, setStats] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const id = localStorage.getItem("supplierId");
    if (!id) return;

    setSupplierId(id);
    socket.emit("joinSupplierRoom", id);

    socket.on("newChargingRequest", (data) => {
      setRequests((prev) => [...prev, data]);
    });

    return () => socket.off("newChargingRequest");
  }, []);

  // (kept from the original; opens the quick-stats modal)
  // eslint-disable-next-line no-unused-vars
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
    <div className="sd-page">
      <style>{`
        .sd-page { padding: 8px 0 48px; }
        .sd-shell { max-width: 1280px; margin: 0 auto; background: var(--cg-bg); border-radius: 18px; padding: 22px; box-shadow: 0 30px 80px rgba(0,0,0,.45), 0 0 0 1px #1d1f20; }
        .sd-head { display:flex; justify-content:space-between; align-items:center; gap:12px; flex-wrap:wrap; margin-bottom:18px; }
        .sd-crumb { font-size:10px; color: var(--cg-muted); }
        .sd-title { font-size:22px; margin:2px 0 0; }
        .sd-grid { display:grid; grid-template-columns: minmax(0,1fr) 300px; gap:16px; }
        .sd-hero { background: var(--cg-panel); border-radius:16px; padding:28px; min-height:300px; position:relative; overflow:hidden; display:flex; flex-direction:column; justify-content:center; }
        .sd-hero::before { content:""; position:absolute; right:-90px; top:-90px; width:300px; height:300px; border-radius:50%; background: radial-gradient(circle, rgba(52,224,161,.18), transparent 70%); }
        .sd-hero h2 { font-size:22px; margin-bottom:8px; position:relative; }
        .sd-hero p { color: var(--cg-muted); max-width:520px; position:relative; margin-bottom:22px; }
        .sd-live { display:inline-flex; align-items:center; gap:8px; font-size:12px; color: var(--cg-green); background: var(--cg-green-soft); border-radius:999px; padding:6px 14px; align-self:flex-start; margin-bottom:16px; position:relative; }
        .sd-live::before { content:""; width:7px; height:7px; border-radius:50%; background: var(--cg-green); box-shadow:0 0 8px 2px rgba(52,224,161,.6); }
        .sd-actions { display:flex; gap:10px; flex-wrap:wrap; position:relative; }
        .sd-side { display:flex; flex-direction:column; gap:12px; }
        .sd-box { background: var(--cg-card); border-radius:14px; padding:16px; font-size:11px; color: var(--cg-muted); }
        .sd-box b { display:block; color: var(--cg-text); font-size:22px; font-weight:500; margin-top:6px; }
        .sd-box b.g { color: var(--cg-green); }

        /* incoming request toasts */
        .sd-toasts { position: fixed; top: 90px; right: 30px; z-index: 2000; width: 340px; }
        .sd-request { background: var(--cg-panel) !important; border: 1px solid var(--cg-green) !important; border-radius: 14px !important; color: var(--cg-text) !important; box-shadow: 0 14px 40px rgba(0,0,0,.6), 0 0 0 1px rgba(52,224,161,.2); }
        .sd-request strong { color: var(--cg-green); }
        .sd-accept { background: var(--cg-green); color:#04251a; border:0; border-radius:8px; font-weight:700; font-size:13px; padding:7px 16px; cursor:pointer; }
        .sd-accept:hover { background:#5df0b8; }
        .sd-reject { background: transparent; color: var(--cg-red); border:1px solid rgba(248,113,113,.5); border-radius:8px; font-weight:700; font-size:13px; padding:7px 16px; cursor:pointer; }
        .sd-reject:hover { background: rgba(248,113,113,.12); }

        @media (max-width: 980px) {
          .sd-grid { grid-template-columns: 1fr; }
          .sd-toasts { right: 12px; left: 12px; width: auto; }
        }
      `}</style>

      <div className="sd-shell">
        <div className="sd-head">
          <div>
            <div className="sd-crumb">Pages / Dashboard</div>
            <h1 className="sd-title">Supplier Dashboard</h1>
          </div>
          <button className="cg-btn" onClick={() => navigate("/supplier/statistics")}>
            View statistics
          </button>
        </div>

        <div className="sd-grid">
          <section className="sd-hero">
            <div className="sd-live">Listening for requests</div>
            <h2>Monitor customer requests and manage your charging station.</h2>
            <p>
              New charging requests appear here in real time. Accept to start a session
              or reject to free the customer to pick another station.
            </p>
            <div className="sd-actions">
              <button className="cg-btn" onClick={() => navigate("/supplier/statistics")}>
                Open statistics
              </button>
              <button className="cg-btn-ghost" onClick={() => navigate("/profile/supplier")}>
                Edit station profile
              </button>
            </div>
          </section>

          <aside className="sd-side">
            <div className="sd-box">
              Pending requests<b className="g">{requests.length}</b>
            </div>
          </aside>
        </div>

        {/* Notifications */}
        <div className="sd-toasts">
          <AnimatePresence>
            {requests.map((req) => (
              <motion.div
                key={req._id}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 100 }}
                style={{ marginBottom: 12 }}
              >
                <Alert variant="info" className="sd-request">
                  <strong>⚡ New Request</strong>
                  <p style={{ margin: "6px 0" }}>From: <b>{req.customerName}</b></p>
                  <p style={{ margin: "0 0 10px" }}>Units Needed: {req.unitsNeeded}</p>
                  <div className="d-flex justify-content-end gap-2">
                    <button className="sd-accept" onClick={() => handleAccept(req._id)}>Accept</button>
                    <button className="sd-reject" onClick={() => handleReject(req._id)}>Reject</button>
                  </div>
                </Alert>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Stats Modal */}
        <Modal show={showStats} onHide={() => setShowStats(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Charging Station Statistics</Modal.Title>
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
      </div>
    </div>
  );
}

export default DashboardSupplier;

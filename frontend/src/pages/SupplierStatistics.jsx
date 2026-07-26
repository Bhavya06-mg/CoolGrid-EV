// src/pages/SupplierStatistics.jsx
import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Spinner, Alert } from "react-bootstrap";
import { Line } from "react-chartjs-2";
import "chart.js/auto"; // simpler registration
import axios from "axios";
import { useNavigate } from "react-router-dom";

const BACKEND = "https://coolgrid-ev-1.onrender.com"; // change if your backend is at a different host/port

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

      .glass-heading { color: #f3f6fb; font-weight: 600; }
      .glass-subtext { color: rgba(230,235,244,0.65); }

      .glass-stat-card {
        background: rgba(255,255,255,0.06) !important;
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border: 1px solid rgba(255,255,255,0.14) !important;
        border-radius: 18px !important;
        box-shadow: 0 8px 26px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.08);
        color: #f3f6fb;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }
      .glass-stat-card:hover {
        transform: translateY(-3px);
        box-shadow: 0 14px 32px rgba(0,0,0,0.45), 0 0 24px 2px rgba(201,121,61,0.2);
      }
      .glass-stat-card h6 {
        color: rgba(251,191,143,0.85);
        font-size: 12px;
        letter-spacing: 1px;
        text-transform: uppercase;
        font-weight: 600;
        margin-bottom: 8px;
      }
      .glass-stat-card h3 {
        color: #f3f6fb;
        font-weight: 700;
        margin: 0;
      }

      .glass-chart-card {
        background: rgba(255,255,255,0.05) !important;
        backdrop-filter: blur(22px);
        -webkit-backdrop-filter: blur(22px);
        border: 1px solid rgba(255,255,255,0.14) !important;
        border-radius: 20px !important;
        box-shadow: 0 10px 30px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08);
        padding: 28px !important;
      }
      .glass-chart-card h6 {
        color: #f3f6fb;
        font-weight: 600;
        margin-bottom: 16px;
      }

      .glass-back-btn {
        border: 1px solid rgba(255,255,255,0.3) !important;
        background: rgba(255,255,255,0.07) !important;
        color: #f3f6fb !important;
        font-weight: 600 !important;
        border-radius: 999px !important;
        padding: 9px 20px !important;
        transition: transform 0.2s ease, background 0.2s ease;
      }
      .glass-back-btn:hover {
        transform: translateY(-2px);
        background: rgba(255,255,255,0.13) !important;
      }

      .glass-alert-error {
        background: rgba(127,29,29,0.55) !important;
        border: 1px solid rgba(248,113,113,0.4) !important;
        color: #fecaca !important;
        border-radius: 14px !important;
        backdrop-filter: blur(10px);
      }
    `}</style>
    <div style={glassStyles.bgLayer}>
      <div style={{ ...glassStyles.blob, ...glassStyles.blobA }} />
      <div style={{ ...glassStyles.blob, ...glassStyles.blobB }} />
      <div style={{ ...glassStyles.blob, ...glassStyles.blobC }} />
    </div>
  </>
);

function SupplierStatistics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const supplierId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    console.log("🧾 supplierId from storage:", supplierId);

    if (!supplierId || !token) {
      // not logged in -> go to login
      setErrorMsg("You must be logged in as a supplier to view statistics.");
      setLoading(false);
      // small delay so user sees message, then redirect
      setTimeout(() => navigate("/login"), 800);
      return;
    }
    

    const fetchStats = async () => {
      try {
        setLoading(true);
        setErrorMsg("");
        // Use absolute URL to avoid proxy issues; change BACKEND if needed
        const res = await axios.get(`${BACKEND}/api/suppliers/stats/${supplierId}`, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000,
        });
        setStats(res.data);
      } catch (err) {
        console.error("Error fetching stats:", err);
        if (err.response) {
          // server returned an error
          setErrorMsg(err.response.data?.message || `Server error: ${err.response.status}`);
        } else {
          setErrorMsg("Network error: could not reach server.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [navigate]);

  if (loading) {
    return (
      <div style={glassStyles.pageWrap}>
        <GlassBackground />
        <Container className="text-center" style={{ position: "relative", zIndex: 1, paddingTop: 120 }}>
          <Spinner animation="border" style={{ color: "#fbbf8f" }} />
          <div className="mt-3 glass-subtext">Loading statistics...</div>
        </Container>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div style={glassStyles.pageWrap}>
        <GlassBackground />
        <Container style={{ position: "relative", zIndex: 1, paddingTop: 80 }}>
          <Alert className="glass-alert-error">{errorMsg}</Alert>
          <div className="text-center">
            <Button className="glass-back-btn" onClick={() => navigate(-1)}>
              ← Back
            </Button>
          </div>
        </Container>
      </div>
    );
  }

  if (!stats) {
    return (
      <div style={glassStyles.pageWrap}>
        <GlassBackground />
        <Container className="text-center" style={{ position: "relative", zIndex: 1, paddingTop: 80 }}>
          <p className="glass-subtext">No statistics available yet.</p>
          <Button className="glass-back-btn" onClick={() => navigate(-1)}>
            ← Back
          </Button>
        </Container>
      </div>
    );
  }

  const labels = Array.isArray(stats.months) && stats.months.length ? stats.months : ["Jan", "Feb", "Mar", "Apr","May","June","July","august","September","October","November","December"];
  const monthlyRevenue = Array.isArray(stats.monthlyRevenue) && stats.monthlyRevenue.length
    ? stats.monthlyRevenue
    : [0, 0, 0, 0];

  const chartData = {
    labels,
    datasets: [
      {
        label: "Revenue (₹)",
        data: monthlyRevenue,
        fill: true,
        borderColor: "#fbbf8f",
        backgroundColor: "rgba(251,191,143,0.15)",
        pointBackgroundColor: "#f59e0b",
        pointBorderColor: "#fff",
        tension: 0.35,
      },
    ],
  };

  const chartOptions = {
    plugins: {
      legend: {
        labels: { color: "rgba(230,235,244,0.85)" },
      },
    },
    scales: {
      x: {
        ticks: { color: "rgba(230,235,244,0.6)" },
        grid: { color: "rgba(255,255,255,0.06)" },
      },
      y: {
        ticks: { color: "rgba(230,235,244,0.6)" },
        grid: { color: "rgba(255,255,255,0.06)" },
      },
    },
  };

  return (
    <div style={glassStyles.pageWrap}>
      <GlassBackground />
      <Container style={{ position: "relative", zIndex: 1, paddingTop: 48, paddingBottom: 60 }}>
        <Row className="mb-4 align-items-center">
          <Col>
            <h2 className="glass-heading">📈 Charging Station Statistics</h2>
            <p className="glass-subtext">Monitor revenue, units supplied and request counts.</p>
          </Col>
          <Col className="text-end">
            <Button className="glass-back-btn" onClick={() => navigate(-1)}>
              ← Back to Dashboard
            </Button>
          </Col>
        </Row>

        <Row>
          <Col md={4} className="mb-3">
            <Card className="glass-stat-card p-3 text-center">
              <h6>Total Requests</h6>
              <h3>{stats.totalRequests ?? 0}</h3>
            </Card>
          </Col>
          <Col md={4} className="mb-3">
            <Card className="glass-stat-card p-3 text-center">
              <h6>Total Units Supplied</h6>
              <h3>{stats.totalUnitsSupplied ?? 0}</h3>
            </Card>
          </Col>
          <Col md={4} className="mb-3">
            <Card className="glass-stat-card p-3 text-center">
              <h6>Total Revenue</h6>
              <h3>₹{stats.totalRevenue ?? 0}</h3>
            </Card>
          </Col>
        </Row>

        <Card className="glass-chart-card mt-3">
          <h6>Revenue Trend (Monthly)</h6>
          <Line data={chartData} options={chartOptions} />
        </Card>
      </Container>
    </div>
  );
}

export default SupplierStatistics;
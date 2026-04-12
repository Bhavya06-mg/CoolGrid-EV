// src/pages/SupplierStatistics.jsx
import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Spinner, Alert } from "react-bootstrap";
import { Line } from "react-chartjs-2";
import "chart.js/auto"; // simpler registration
import axios from "axios";
import { useNavigate } from "react-router-dom";

const BACKEND = "https://coolgrid-ev-1.onrender.com"; // change if your backend is at a different host/port

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
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <div className="mt-2">Loading statistics...</div>
      </Container>
    );
  }

  if (errorMsg) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">{errorMsg}</Alert>
        <div className="text-center">
          <Button variant="secondary" onClick={() => navigate(-1)}>
            ← Back
          </Button>
        </div>
      </Container>
    );
  }

  if (!stats) {
    return (
      <Container className="text-center mt-5">
        <p>No statistics available yet.</p>
        <Button variant="secondary" onClick={() => navigate(-1)}>
          ← Back
        </Button>
      </Container>
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
        fill: false,
        borderColor: "#007bff",
        backgroundColor: "#007bff",
        tension: 0.3,
      },
    ],
  };

  return (
    <Container className="mt-5">
      <Row className="mb-4 align-items-center">
        <Col>
          <h2>📈 Charging Station Statistics</h2>
          <p className="text-muted">Monitor revenue, units supplied and request counts.</p>
        </Col>
        <Col className="text-end">
          <Button variant="secondary" onClick={() => navigate(-1)}>
            ← Back to Dashboard
          </Button>
        </Col>
      </Row>

      <Row>
        <Col md={4} className="mb-3">
          <Card className="p-3 text-center">
            <h6>Total Requests</h6>
            <h3>{stats.totalRequests ?? 0}</h3>
          </Card>
        </Col>
        <Col md={4} className="mb-3">
          <Card className="p-3 text-center">
            <h6>Total Units Supplied</h6>
            <h3>{stats.totalUnitsSupplied ?? 0}</h3>
          </Card>
        </Col>
        <Col md={4} className="mb-3">
          <Card className="p-3 text-center">
            <h6>Total Revenue</h6>
            <h3>₹{stats.totalRevenue ?? 0}</h3>
          </Card>
        </Col>
      </Row>

      <Card className="p-4 shadow-sm mt-3">
        <h6>Revenue Trend (Monthly)</h6>
        <Line data={chartData} />
      </Card>
    </Container>
  );
}

export default SupplierStatistics;

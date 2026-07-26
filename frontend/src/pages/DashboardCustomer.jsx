// Updated DashboardCustomer.jsx with distance field added to supplier cards
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Spinner,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export default function DashboardCustomer() {
  const [suppliers, setSuppliers] = useState([]);
  const [message, setMessage] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [customerLocation, setCustomerLocation] = useState(undefined);
  const [loadingSuppliers, setLoadingSuppliers] = useState(true);

  const navigate = useNavigate();

  const haversineKm = useCallback((lat1, lon1, lat2, lon2) => {
    lat1 = Number(lat1);
    lon1 = Number(lon1);
    lat2 = Number(lat2);
    lon2 = Number(lon2);

    const toRad = (deg) => (deg * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }, []);

  useEffect(() => {
    let timer = null;

    if (!("geolocation" in navigator)) {
      setCustomerLocation(null);
      return;
    }

    const success = (pos) => {
      clearTimeout(timer);
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      setCustomerLocation({ lat, lng });
    };

    const fail = () => {
      clearTimeout(timer);
      setCustomerLocation(null);
    };

    navigator.geolocation.getCurrentPosition(success, fail, {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 8000,
    });

    timer = setTimeout(() => {
      if (customerLocation === undefined) setCustomerLocation(null);
    }, 6000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const dm = localStorage.getItem("darkMode") === "true";
    setDarkMode(dm);
    document.body.classList.toggle("dark-mode", dm);
  }, []);

  useEffect(() => {
    if (customerLocation === undefined) return;

    const fetchSuppliers = async () => {
      setLoadingSuppliers(true);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("https://coolgrid-ev-1.onrender.com/api/customer/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });

        let list = (res.data.suppliers || []).filter((s) => !!s.isOnline);

        if (customerLocation) {
          list = list.map((s) => {
            let slat = s?.coordinates?.lat ?? s?.lat ?? null;
            let slng = s?.coordinates?.lng ?? s?.lng ?? null;

            let distance = Infinity;
            if (slat && slng) {
              distance = haversineKm(
                customerLocation.lat,
                customerLocation.lng,
                slat,
                slng
              );
            }

            return { ...s, distance };
          });

          list.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
        }

        setSuppliers(list);
      } catch (err) {
        setMessage("Failed to load suppliers.");
      } finally {
        setLoadingSuppliers(false);
      }
    };

    fetchSuppliers();
  }, [customerLocation, haversineKm]);

  const filteredSuppliers = suppliers.filter(
    (s) =>
      (s.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.location || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBooking = async (supplierId) => {
    const customerId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "CUSTOMER") return alert("Login first!");

    const unitsRequested = prompt("Enter units:");
    if (!unitsRequested) return;

    try {
      if (customerLocation) {
        await axios.post(
          "https://coolgrid-ev-1.onrender.com/api/request/customer/update-location",
          { customerId, lat: customerLocation.lat, lng: customerLocation.lng },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      const res = await axios.post(
        "https://coolgrid-ev-1.onrender.com/api/request/create",
        { customerId, supplierId, unitsRequested },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Request sent!");
      localStorage.setItem("requestId", res.data.request._id);
      navigate(`/customer/booking/${res.data.request._id}`);
    } catch (err) {
      alert("Failed.");
    }
  };

  return (
    <div style={styles.pageWrap}>
      <style>{`
        html, body, #root { height: 100%; margin: 0; }
        @keyframes float1 { 0%,100%{transform:translate(0,0) scale(1);} 50%{transform:translate(30px,-40px) scale(1.08);} }
        @keyframes float2 { 0%,100%{transform:translate(0,0) scale(1);} 50%{transform:translate(-40px,30px) scale(1.1);} }
        @keyframes float3 { 0%,100%{transform:translate(0,0) scale(1);} 50%{transform:translate(20px,40px) scale(0.95);} }

        .glass-search {
          background: rgba(255,255,255,0.05) !important;
          border: 1px solid rgba(255,255,255,0.15) !important;
          color: #f3f6fb !important;
          border-radius: 12px !important;
          padding: 12px 16px !important;
          font-size: 15px !important;
          backdrop-filter: blur(4px);
        }
        .glass-search::placeholder { color: rgba(230,235,244,0.4); }
        .glass-search:focus {
          background: rgba(255,255,255,0.07) !important;
          border-color: rgba(52,211,153,0.55) !important;
          box-shadow: 0 0 0 3px rgba(52,211,153,0.15) !important;
          color: #fff !important;
        }

        .glass-card {
          background: rgba(255,255,255,0.06) !important;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.14) !important;
          border-radius: 20px !important;
          box-shadow: 0 8px 28px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.08);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          color: #f3f6fb;
        }
        .glass-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 14px 34px rgba(0,0,0,0.45), 0 0 0 1px rgba(52,211,153,0.35), 0 0 30px 2px rgba(52,211,153,0.25);
        }
        .glass-card .card-title {
          color: #f3f6fb;
          font-weight: 700;
          font-size: 19px;
        }
        .glass-card-label {
          color: rgba(110,231,183,0.85);
          font-size: 11px;
          letter-spacing: 1px;
          text-transform: uppercase;
          font-weight: 600;
        }
        .glass-card-value {
          color: rgba(230,235,244,0.85);
          font-size: 14px;
          margin-bottom: 8px;
        }
        .glass-book-btn {
          border: 1px solid rgba(255,255,255,0.35) !important;
          background: linear-gradient(180deg, rgba(74,222,128,0.85), rgba(34,197,94,0.75)) !important;
          color: #06210f !important;
          font-weight: 600 !important;
          border-radius: 999px !important;
          padding: 9px 26px !important;
          box-shadow: 0 6px 18px rgba(52,211,153,0.3), inset 0 1px 0 rgba(255,255,255,0.4);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .glass-book-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 24px rgba(52,211,153,0.4), inset 0 1px 0 rgba(255,255,255,0.5);
        }
        .glass-heading { color: #f3f6fb; font-weight: 600; }
        .glass-empty { color: rgba(230,235,244,0.55); text-align:center; margin-top: 24px; }
      `}</style>

      <div style={styles.bgLayer}>
        <div style={{ ...styles.blob, ...styles.blobA }} />
        <div style={{ ...styles.blob, ...styles.blobB }} />
        <div style={{ ...styles.blob, ...styles.blobC }} />
      </div>

      <Container style={{ position: "relative", zIndex: 1, paddingTop: 48, paddingBottom: 60 }}>
        <h2 className="glass-heading">Customer Dashboard</h2>
        {message && (
          <p style={{ color: "rgba(248,113,113,0.9)", marginTop: 8 }}>{message}</p>
        )}

        <Form.Control
          placeholder="Search by name or location"
          className="glass-search my-4"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {loadingSuppliers ? (
          <div className="text-center my-5">
            <Spinner animation="border" style={{ color: "#4ade80" }} />
          </div>
        ) : (
          <Row>
            {filteredSuppliers.length === 0 ? (
              <p className="glass-empty">No suppliers found.</p>
            ) : (
              filteredSuppliers.map((s) => (
                <Col md={4} className="mb-4" key={s._id}>
                  <Card className="glass-card">
                    <Card.Body>
                      <Card.Title>{s.name}</Card.Title>
                      <div className="glass-card-label">Location</div>
                      <div className="glass-card-value">{s.area}</div>
                      <div className="glass-card-label">Price</div>
                      <div className="glass-card-value">₹{s.pricePerUnit}</div>
                      <div className="glass-card-label">Units</div>
                      <div className="glass-card-value">{s.availableUnits}</div>
                      <div className="glass-card-label">Distance</div>
                      <div className="glass-card-value">{s.distance.toFixed(2)} km</div>

                      <Button
                        className="glass-book-btn mt-2"
                        onClick={() => handleBooking(s._id)}
                      >
                        Book
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              ))
            )}
          </Row>
        )}
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
  blobA: { width: 380, height: 380, top: "-8%", left: "-6%", background: "radial-gradient(circle, #34d399, transparent 70%)", animation: "float1 15s ease-in-out infinite" },
  blobB: { width: 340, height: 340, bottom: "-8%", right: "-8%", background: "radial-gradient(circle, #38bdf8, transparent 70%)", animation: "float2 17s ease-in-out infinite" },
  blobC: { width: 260, height: 260, top: "40%", right: "20%", background: "radial-gradient(circle, #a78bfa, transparent 70%)", animation: "float3 13s ease-in-out infinite" },
};
// Updated DashboardCustomer.jsx with distance field added to supplier cards
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Alert,
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
    <Container className="mt-5">
      <h2 className={darkMode ? "text-light" : "text-dark"}>Customer Dashboard</h2>

      <Form.Control
        placeholder="Search by name or location"
        className="my-3"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {loadingSuppliers ? (
        <div className="text-center my-4">
          <Spinner animation="border" />
        </div>
      ) : (
        <Row>
          {filteredSuppliers.length === 0 ? (
            <p className="text-muted text-center mt-3">No suppliers found.</p>
          ) : (
            filteredSuppliers.map((s) => (
              <Col md={4} className="mb-4" key={s._id}>
                <Card className={darkMode ? "bg-dark text-light border-secondary" : ""}>
                  <Card.Body>
                    <Card.Title>{s.name}</Card.Title>
                    <Card.Text>
                      <strong>Location:</strong> {s.area} <br />
                      <strong>Price:</strong> ₹{s.pricePerUnit} <br />
                      <strong>Units:</strong> {s.availableUnits} <br />
                      <p><b>Distance:</b> {s.distance.toFixed(2)} km</p>

                      
                    </Card.Text>

                    <Button onClick={() => handleBooking(s._id)}>Book</Button>
                  </Card.Body>
                </Card>
              </Col>
            ))
          )}
        </Row>
      )}
    </Container>
  );
}

// src/pages/DashboardCustomer.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Row, Col, Card, Button, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

function DashboardCustomer() {
  const [suppliers, setSuppliers] = useState([]);
  const [message, setMessage] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    // Load Dark Mode
    const dm = localStorage.getItem("darkMode") === "true";
    setDarkMode(dm);

    if (dm) document.body.classList.add("dark-mode");
    else document.body.classList.remove("dark-mode");
  }, []);

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/customer/dashboard", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        const activeSuppliers = (res.data.suppliers || []).filter(s => s.isOnline);
        setSuppliers(activeSuppliers);
      } catch (err) {
        console.error("Error fetching suppliers:", err);
      }
    };
    fetchSuppliers();
  }, []);

  const handleBooking = async (supplierId) => {
    const customerId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "CUSTOMER") {
      alert("Please log in as a customer first.");
      return;
    }

    const unitsRequested = prompt("Enter number of units to request:");
    if (!unitsRequested) return;

    try {
      const res = await axios.post(
        "http://localhost:5000/api/request/create",
        { customerId, supplierId, unitsRequested },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("✅ Request sent! Waiting for supplier approval...");
      localStorage.setItem("requestId", res.data.request._id);
      navigate(`/customer/booking/${res.data.request._id}`);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send request.");
    }
  };

  return (
    <Container className="mt-5">
      <h2 className={darkMode ? "text-light" : "text-dark"}>Customer Dashboard</h2>

      {message && <Alert variant="info">{message}</Alert>}
      <Row>
        {suppliers.length === 0 && (
          <p className="text-muted text-center mt-3">
            No active suppliers available right now.
          </p>
        )}
        {suppliers.map((supplier) => (
          <Col key={supplier._id} md={4} className="mb-4">
            <Card className={darkMode ? "bg-dark text-light border-secondary" : ""}>
              <Card.Body>
                <Card.Title>{supplier.name}</Card.Title>
                <Card.Text>
                  <strong>Location:</strong> {supplier.location}<br />
                  <strong>Price Per Unit:</strong> ₹{supplier.pricePerUnit}<br />
                  <strong>Available Units:</strong> {supplier.availableUnits}
                </Card.Text>
                <Button onClick={() => handleBooking(supplier._id)}>Book</Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default DashboardCustomer;

// src/pages/RegisterSupplier.jsx
import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import LiquidGlassLayout from "../components/LiquidGlassLayout";

const AREAS = {
  "JP Nagar": { lat: 12.9063, lng: 77.5850 },
  "KR Market": { lat: 12.9592, lng: 77.5737 },
  "BTM Layout": { lat: 12.9166, lng: 77.6101 },
  "MG Road":   { lat: 12.9758, lng: 77.6051 },
  "Rajajinagar": { lat: 12.9950, lng: 77.5535 },
  "Hebbal": { lat: 13.0358, lng: 77.5970 },
  "Whitefield": { lat: 12.9698, lng: 77.7499 }
};

const SUPPLIER_HIGHLIGHTS = [
  { title: "Set your own pricing", desc: "Control your price per unit and available capacity anytime." },
  { title: "Reach nearby demand", desc: "Get matched with customers searching your service area." },
  { title: "Renewable-friendly", desc: "Highlight your renewable energy status to attract more customers." },
];

function RegisterSupplier() {
  const [form, setForm] = useState({
    username: "",
    password: "",
    name: "",
    phone: "",
    pricePerUnit: "",
    availableUnits: "",
    renewable: false,
    areaName: "JP Nagar"
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const coords = AREAS[form.areaName];

    try {
      await axios.post("https://coolgrid-ev-1.onrender.com/api/auth/register/supplier", {
        username: form.username,
        password: form.password,
        name: form.name,
        phone: form.phone,
        renewable: form.renewable,
        pricePerUnit: Number(form.pricePerUnit),
        availableUnits: Number(form.availableUnits),

        area: form.areaName,   // TEXT
        // IMPORTANT 🔥🔥 SEND COORDINATES
      });

      alert("Supplier registered!");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <LiquidGlassLayout
      title="Register supplier"
      accent="amber"
      panelMaxWidth={960}
      highlights={SUPPLIER_HIGHLIGHTS}
      scene="customer"
      carOrigin="station"
      stationCaption="Charging completed"
    >
      <p className="glass-subtitle">Join the network and start supplying energy credits</p>

      <Form onSubmit={handleSubmit}>
        {["username", "password", "name", "phone", "pricePerUnit", "availableUnits"].map((field, idx) => (
          <Form.Group key={idx} className="mb-3">
            <div className="glass-field-label">{field}</div>
            <Form.Control
              className="glass-input"
              required
              type={field === "password" ? "password" : "text"}
              name={field}
              value={form[field]}
              onChange={handleChange}
            />
          </Form.Group>
        ))}

        <Form.Group className="mb-3">
          <div className="glass-field-label">Select area</div>
          <Form.Select
            className="glass-input"
            name="areaName"
            value={form.areaName}
            onChange={handleChange}
          >
            {Object.keys(AREAS).map((area) => (
              <option key={area} value={area} style={{ color: "#000" }}>{area}</option>
            ))}
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-4 d-flex align-items-center">
          <Form.Check
            className="glass-check"
            type="checkbox"
            name="renewable"
            checked={form.renewable}
            onChange={handleChange}
            label="I use renewable energy"
            style={{ color: "rgba(230,235,244,0.8)" }}
          />
        </Form.Group>

        <Button type="submit" className="glass-btn">
          Register
        </Button>
      </Form>
    </LiquidGlassLayout>
  );
}

export default RegisterSupplier;
// src/pages/RegisterSupplier.jsx
import React, { useState } from "react";
import { Container, Form, Button } from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AREAS = {
  "JP Nagar": { lat: 12.9063, lng: 77.5850 },
  "KR Market": { lat: 12.9592, lng: 77.5737 },
  "BTM Layout": { lat: 12.9166, lng: 77.6101 },
  "MG Road":   { lat: 12.9758, lng: 77.6051 },
  "Rajajinagar": { lat: 12.9950, lng: 77.5535 },
  "Hebbal": { lat: 13.0358, lng: 77.5970 },
  "Whitefield": { lat: 12.9698, lng: 77.7499 }
};

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
      await axios.post("http://localhost:5000/api/auth/register/supplier", {
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
    <Container className="mt-5" style={{ maxWidth: "600px" }}>
      <h2 className="text-center mb-4">Register Supplier</h2>

      <Form onSubmit={handleSubmit}>
        {["username", "password", "name", "phone", "pricePerUnit", "availableUnits"].map((field, idx) => (
          <Form.Group key={idx} className="mb-3">
            <Form.Label>{field}</Form.Label>
            <Form.Control
              required
              type={field === "password" ? "password" : "text"}
              name={field}
              value={form[field]}
              onChange={handleChange}
            />
          </Form.Group>
        ))}

        <Form.Group className="mb-3">
          <Form.Label>Select Area</Form.Label>

          <Form.Select name="areaName" value={form.areaName} onChange={handleChange}>
            {Object.keys(AREAS).map((area) => (
              <option key={area} value={area}>{area}</option>
            ))}
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Check
            type="checkbox"
            name="renewable"
            checked={form.renewable}
            onChange={handleChange}
            label="I use renewable energy"
          />
        </Form.Group>

        <Button type="submit" className="w-100">Register</Button>
      </Form>
    </Container>
  );
}

export default RegisterSupplier;

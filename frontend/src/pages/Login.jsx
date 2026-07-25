import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import LiquidGlassLayout from "../components/LiquidGlassLayout";

function Login() {
  const [form, setForm] = useState({
    username: "",
    password: "",
    role: "CUSTOMER",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("https://coolgrid-ev-1.onrender.com/api/auth/login", form);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("userId", res.data.userId);

      if (res.data.role === "SUPPLIER") {
        localStorage.setItem("supplierId", res.data.userId);
      } else {
        localStorage.setItem("customerId", res.data.userId);
      }

      localStorage.setItem(
        "user",
        JSON.stringify({
          name: res.data.name,
          phone: res.data.phone,
          email: res.data.email,
          location: res.data.location,
          pricePerUnit: res.data.pricePerUnit,
          availableUnits: res.data.availableUnits,
        })
      );

      if (res.data.role === "SUPPLIER") navigate("/dashboard/supplier");
      else navigate("/dashboard/customer");
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <LiquidGlassLayout title="Welcome back" accent="blue" panelMaxWidth={900}>
      <p className="glass-subtitle">Log in to manage your charging account</p>

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <div className="glass-field-label">Username</div>
          <Form.Control
            className="glass-input"
            type="text"
            name="username"
            placeholder="Enter username"
            value={form.username}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <div className="glass-field-label">Password</div>
          <Form.Control
            className="glass-input"
            type="password"
            name="password"
            placeholder="Enter password"
            value={form.password}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-4">
          <div className="glass-field-label">Role</div>
          <Form.Select
            className="glass-input"
            name="role"
            value={form.role}
            onChange={handleChange}
          >
            <option value="CUSTOMER" style={{ color: "#000" }}>Customer</option>
            <option value="SUPPLIER" style={{ color: "#000" }}>Supplier</option>
          </Form.Select>
        </Form.Group>

        <Button type="submit" className="glass-btn">
          Login
        </Button>
      </Form>
    </LiquidGlassLayout>
  );
}

export default Login;
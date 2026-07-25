import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import LiquidGlassLayout from "../components/LiquidGlassLayout";

const CUSTOMER_HIGHLIGHTS = [
  { title: "Locate stations instantly", desc: "See nearby charging points and live availability on the map." },
  { title: "One account, one wallet", desc: "Track your energy credits and payments in a single place." },
  { title: "Reliable suppliers", desc: "Connect only with verified suppliers in your area." },
];

function RegisterCustomer() {
  const [form, setForm] = useState({
    username: "", password: "", name: "", phone: "", vehicleId: ""
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("https://coolgrid-ev-1.onrender.com/api/auth/register/customer", form);
      alert("Customer registered successfully!");
      navigate("/login");
    } catch (err) {
      console.error(err);
      alert("Registration failed.");
    }
  };

  return (
    <LiquidGlassLayout
      title="Register as customer"
      accent="green"
      panelMaxWidth={960}
      highlights={CUSTOMER_HIGHLIGHTS}
      scene="supplier"
    >
      <p className="glass-subtitle">Create an account to find and book charging stations</p>

      <Form onSubmit={handleSubmit}>
        {["username", "password", "name", "phone", "vehicleId"].map((field, idx) => (
          <Form.Group className="mb-3" key={idx}>
            <div className="glass-field-label">
              {field.charAt(0).toUpperCase() + field.slice(1)}
            </div>
            <Form.Control
              className="glass-input"
              type={field === "password" ? "password" : "text"}
              name={field}
              placeholder={`Enter ${field}`}
              value={form[field]}
              onChange={handleChange}
            />
          </Form.Group>
        ))}
        <Button type="submit" className="glass-btn mt-2">
          Register
        </Button>
      </Form>
    </LiquidGlassLayout>
  );
}

export default RegisterCustomer;
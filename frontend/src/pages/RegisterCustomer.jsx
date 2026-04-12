import React, { useState } from "react";
import { Container, Form, Button } from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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
    <Container className="mt-5" style={{ maxWidth: "600px" }}>
      <h2 className="text-center mb-4">Register as Customer</h2>
      <Form onSubmit={handleSubmit}>
        {["username", "password", "name", "phone", "vehicleId"].map((field, idx) => (
          <Form.Group className="mb-3" key={idx}>
            <Form.Label>{field.charAt(0).toUpperCase() + field.slice(1)}</Form.Label>
            <Form.Control
              type={field === "password" ? "password" : "text"}
              name={field}
              placeholder={`Enter ${field}`}
              value={form[field]}
              onChange={handleChange}
            />
          </Form.Group>
        ))}
        <Button variant="success" type="submit" className="w-100">
          Register
        </Button>
      </Form>
    </Container>
  );
}

export default RegisterCustomer;

import React, { useState } from "react";
import { Container, Form, Button } from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function RegisterSupplier() {
  const [form, setForm] = useState({
    username: "", password: "", name: "", phone: "", location: "",
    pricePerUnit: "", availableUnits: "", renewable: false
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Convert pricePerUnit and availableUnits to numbers
    const payload = {
      ...form,
      pricePerUnit: Number(form.pricePerUnit),
      availableUnits: Number(form.availableUnits)
    };

    try {
      await axios.post("http://localhost:5000/api/auth/register/supplier", payload);
      alert("Supplier registered successfully!");
      navigate("/login");
    } catch (err) {
      console.error(err.response?.data || err);
      alert("Registration failed: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <Container className="mt-5" style={{ maxWidth: "600px" }}>
      <h2 className="text-center mb-4">Register as Supplier</h2>
      <Form onSubmit={handleSubmit}>
        {[
          { field: "username", type: "text" },
          { field: "password", type: "password" },
          { field: "name", type: "text" },
          { field: "phone", type: "text" },
          { field: "location", type: "text", label: "Address" },
          { field: "pricePerUnit", type: "number", label: "Rate per Unit" },
          { field: "availableUnits", type: "number", label: "Units Available" },
        ].map(({ field, type, label }, idx) => (
          <Form.Group className="mb-3" key={idx}>
            <Form.Label>{label || field.charAt(0).toUpperCase() + field.slice(1)}</Form.Label>
            <Form.Control
              type={type}
              name={field}
              placeholder={`Enter ${label || field}`}
              value={form[field]}
              onChange={handleChange}
            />
          </Form.Group>
        ))}

        <Form.Group className="mb-3">
          <Form.Check
            type="checkbox"
            name="renewable"
            checked={form.renewable}
            onChange={handleChange}
            label="I use renewable energy (required)"
          />
        </Form.Group>

        <Button variant="success" type="submit" className="w-100">
          Register
        </Button>
      </Form>
    </Container>
  );
}

export default RegisterSupplier;

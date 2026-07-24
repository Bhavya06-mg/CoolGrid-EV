import React, { useState } from "react";
import { Container, Form, Button } from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function RegisterCustomer() {
  const [form, setForm] = useState({
    username: "",
    password: "",
    name: "",
    phone: "",
    vehicleId: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("📤 Sending registration data:", form);

    try {
      const response = await axios.post(
        "https://coolgrid-ev-1.onrender.com/api/auth/register/customer",
        form
      );

      console.log("✅ Registration Success:", response.data);

      alert("Customer registered successfully!");
      navigate("/login");
    } catch (err) {
      console.error("❌ Registration Error:", err);

      if (err.response) {
        console.error("Status:", err.response.status);
        console.error("Response Data:", err.response.data);

        alert(
          err.response.data.message ||
            "Registration failed. Please try again."
        );
      } else if (err.request) {
        console.error("No response received:", err.request);
        alert("Server is not responding.");
      } else {
        console.error("Request Error:", err.message);
        alert(err.message);
      }
    }
  };

  return (
    <Container className="mt-5" style={{ maxWidth: "600px" }}>
      <h2 className="text-center mb-4">Register as Customer</h2>

      <Form onSubmit={handleSubmit}>
        {["username", "password", "name", "phone", "vehicleId"].map(
          (field) => (
            <Form.Group className="mb-3" key={field}>
              <Form.Label>
                {field.charAt(0).toUpperCase() + field.slice(1)}
              </Form.Label>

              <Form.Control
                type={field === "password" ? "password" : "text"}
                name={field}
                value={form[field]}
                placeholder={`Enter ${field}`}
                onChange={handleChange}
                required
              />
            </Form.Group>
          )
        )}

        <Button variant="success" type="submit" className="w-100">
          Register
        </Button>
      </Form>
    </Container>
  );
}

export default RegisterCustomer;
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Form, Button, Card, Alert } from "react-bootstrap";

const BACKEND = "https://coolgrid-ev-1.onrender.com";

export default function ProfileCustomer() {
  const [user, setUser] = useState(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    axios
      .get(`${BACKEND}/api/profile/profile`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((res) => setUser(res.data.profile))   // backend returns { profile: {...} }
      .catch(() => setMsg("Error loading profile"));
  }, []);

  const handleUpdate = async () => {
    try {
      await axios.put(
        `${BACKEND}/api/profile/customer/update`,
        user,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setMsg("Profile updated successfully!");
    } catch (err) {
      setMsg("Error updating profile");
    }
  };

  if (!user) return <p>Loading...</p>;

  return (
    <Container className="mt-5">
      <Card className="p-4 shadow">
        <h3>👤 Customer Profile</h3>

        {msg && <Alert variant="info" className="mt-3">{msg}</Alert>}

        <Form>
          <Form.Group className="mt-3">
            <Form.Label>Name</Form.Label>
            <Form.Control
              value={user.name}
              onChange={(e) => setUser({ ...user, name: e.target.value })}
            />
          </Form.Group>

          <Form.Group className="mt-3">
            <Form.Label>Phone</Form.Label>
            <Form.Control
              value={user.phone}
              onChange={(e) => setUser({ ...user, phone: e.target.value })}
            />
          </Form.Group>

          <Form.Group className="mt-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              value={user.email}
              onChange={(e) => setUser({ ...user, email: e.target.value })}
            />
          </Form.Group>

          <Button className="mt-4" onClick={handleUpdate}>
            Save Changes
          </Button>
        </Form>
      </Card>
    </Container>
  );
}

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Form, Button, Card, Alert } from "react-bootstrap";

const BACKEND = "https://coolgrid-ev-1.onrender.com";

export default function ProfileSupplier() {
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
        `${BACKEND}/api/profile/supplier/update`,
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
        <h3>🔧 Supplier Profile</h3>
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
            <Form.Label>Location</Form.Label>
            <Form.Control
              value={user.location}
              onChange={(e) => setUser({ ...user, location: e.target.value })}
            />
          </Form.Group>

          <Form.Group className="mt-3">
            <Form.Label>Price Per Unit</Form.Label>
            <Form.Control
              type="number"
              value={user.pricePerUnit}
              onChange={(e) =>
                setUser({ ...user, pricePerUnit: e.target.value })
              }
            />
          </Form.Group>

          <Form.Group className="mt-3">
            <Form.Label>Available Units</Form.Label>
            <Form.Control
              type="number"
              value={user.availableUnits}
              onChange={(e) =>
                setUser({ ...user, availableUnits: e.target.value })
              }
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

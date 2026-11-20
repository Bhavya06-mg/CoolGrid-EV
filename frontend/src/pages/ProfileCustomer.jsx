import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Form, Card, Alert } from "react-bootstrap";
import { saveVehicle } from "../utils/vehicle";

const BACKEND = "https://coolgrid-ev-1.onrender.com";
const auth = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });

export default function ProfileCustomer() {
  const [user, setUser] = useState(null);
  const [snapshot, setSnapshot] = useState(null); // last saved values, used by Cancel
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: "info", text: "" });

  useEffect(() => {
    axios
      .get(`${BACKEND}/api/profile/profile`, auth())
      .then((res) => {
        setUser(res.data.profile); // backend returns { profile: {...} }
        setSnapshot(res.data.profile);
      })
      .catch(() => setMsg({ type: "danger", text: "Error loading profile" }));
  }, []);

  const field = (key) => ({
    value: user?.[key] ?? "",
    disabled: !editing,
    onChange: (e) => setUser({ ...user, [key]: e.target.value }),
  });

  const handleCancel = () => {
    setUser(snapshot);
    setEditing(false);
    setMsg({ type: "info", text: "" });
  };

  const handleUpdate = async () => {
    setSaving(true);
    try {
      // send only the editable fields (not the password hash / history)
      const body = { name: user.name, phone: user.phone, email: user.email, vehicleId: user.vehicleId };
      await axios.put(`${BACKEND}/api/profile/customer/update`, body, auth());

      setSnapshot(user);
      setEditing(false);
      setMsg({ type: "success", text: "Profile updated successfully!" });

      // keep the sidebar (name + car ID) in sync right away
      try {
        const stored = JSON.parse(localStorage.getItem("user")) || {};
        localStorage.setItem("user", JSON.stringify({ ...stored, name: user.name, phone: user.phone }));
      } catch (e) {
        /* ignore */
      }
      if (user.vehicleId) saveVehicle({ vehicleId: user.vehicleId });
      window.dispatchEvent(new Event("authChange"));
    } catch (err) {
      setMsg({ type: "danger", text: "Error updating profile" });
    } finally {
      setSaving(false);
    }
  };

  if (!user)
    return (
      <div className="text-center mt-5" style={{ color: "var(--cg-muted)" }}>
        {msg.text || "Loading..."}
      </div>
    );

  return (
    <Container className="mt-5" style={{ maxWidth: 640 }}>
      <Card className="p-4">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <div className="cg-label">Account</div>
            <h3 style={{ marginBottom: 4 }}>Customer Profile</h3>
          </div>
          {!editing && (
            <button className="cg-btn-ghost" onClick={() => { setEditing(true); setMsg({ type: "info", text: "" }); }}>
              ✎ Edit
            </button>
          )}
        </div>

        {msg.text && <Alert variant={msg.type} className="mt-3 mb-0">{msg.text}</Alert>}

        <Form onSubmit={(e) => e.preventDefault()}>
          <Form.Group className="mt-3">
            <Form.Label>Name</Form.Label>
            <Form.Control {...field("name")} />
          </Form.Group>

          <Form.Group className="mt-3">
            <Form.Label>Phone</Form.Label>
            <Form.Control {...field("phone")} />
          </Form.Group>

          <Form.Group className="mt-3">
            <Form.Label>Email</Form.Label>
            <Form.Control type="email" {...field("email")} />
          </Form.Group>

          <Form.Group className="mt-3">
            <Form.Label>Vehicle ID</Form.Label>
            <Form.Control placeholder="e.g. KA01AB1234" {...field("vehicleId")} />
          </Form.Group>

          {editing && (
            <div className="d-flex gap-2 mt-4">
              <button type="button" className="cg-btn" onClick={handleUpdate} disabled={saving}>
                {saving ? "Saving…" : "Save changes"}
              </button>
              <button type="button" className="cg-btn-ghost" onClick={handleCancel} disabled={saving}>
                Cancel
              </button>
            </div>
          )}
        </Form>
      </Card>
    </Container>
  );
}

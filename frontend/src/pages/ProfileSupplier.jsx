import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Form, Card, Alert } from "react-bootstrap";

const BACKEND = "https://coolgrid-ev-1.onrender.com";
const auth = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });

export default function ProfileSupplier() {
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
      // only the editable fields; the exact address / map pin are set at registration
      const body = {
        name: user.name,
        phone: user.phone,
        area: user.area,
        pricePerUnit: Number(user.pricePerUnit),
        availableUnits: Number(user.availableUnits),
      };
      await axios.put(`${BACKEND}/api/profile/supplier/update`, body, auth());

      setSnapshot(user);
      setEditing(false);
      setMsg({ type: "success", text: "Profile updated successfully!" });

      try {
        const stored = JSON.parse(localStorage.getItem("user")) || {};
        localStorage.setItem("user", JSON.stringify({ ...stored, name: user.name, phone: user.phone }));
      } catch (e) {
        /* ignore */
      }
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
            <h3 style={{ marginBottom: 4 }}>Supplier Profile</h3>
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
            <Form.Label>Station name</Form.Label>
            <Form.Control {...field("name")} />
          </Form.Group>

          <Form.Group className="mt-3">
            <Form.Label>Phone</Form.Label>
            <Form.Control {...field("phone")} />
          </Form.Group>

          <Form.Group className="mt-3">
            <Form.Label>Area</Form.Label>
            <Form.Control {...field("area")} />
          </Form.Group>

          {user.address?.formatted && (
            <Form.Group className="mt-3">
              <Form.Label>Station address</Form.Label>
              <Form.Control as="textarea" rows={2} value={user.address.formatted} disabled />
            </Form.Group>
          )}

          <div className="row">
            <Form.Group className="mt-3 col-6">
              <Form.Label>Price per unit (₹)</Form.Label>
              <Form.Control type="number" min="0" step="any" {...field("pricePerUnit")} />
            </Form.Group>
            <Form.Group className="mt-3 col-6">
              <Form.Label>Available units</Form.Label>
              <Form.Control type="number" min="0" {...field("availableUnits")} />
            </Form.Group>
          </div>

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

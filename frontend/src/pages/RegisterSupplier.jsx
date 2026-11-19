// src/pages/RegisterSupplier.jsx
import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import LiquidGlassLayout from "../components/LiquidGlassLayout";

const SUPPLIER_HIGHLIGHTS = [
  { title: "Set your own pricing", desc: "Control your price per unit and available capacity anytime." },
  { title: "Reach nearby demand", desc: "Customers find you by your exact station address and distance." },
  { title: "Renewable-friendly", desc: "Highlight your renewable energy status to attract more customers." },
];

const BASIC_FIELDS = [
  { name: "username", label: "Username", type: "text" },
  { name: "password", label: "Password", type: "password" },
  { name: "name", label: "Station name", type: "text" },
  { name: "phone", label: "Phone", type: "tel" },
  { name: "pricePerUnit", label: "Price per unit (₹)", type: "number" },
  { name: "availableUnits", label: "Available units", type: "number" },
];

// Looks the address up on OpenStreetMap (free, no API key).
// Tries the full address first, then looser queries. Only the first is "exact".
async function geocodeAddress({ line1, area, city, state, pincode }) {
  const queries = [
    { q: `${line1}, ${area}, ${city}, ${state} ${pincode}, India`, exact: true },
    { q: `${area}, ${city}, ${state} ${pincode}, India`, exact: false },
    { q: `${pincode}, ${city}, India`, exact: false },
  ];
  for (const { q, exact } of queries) {
    try {
      const url =
        "https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=in&q=" +
        encodeURIComponent(q);
      const res = await fetch(url, { headers: { Accept: "application/json" } });
      const data = await res.json();
      if (data && data[0]) {
        return { lat: Number(data[0].lat), lng: Number(data[0].lon), approx: !exact };
      }
    } catch (e) {
      /* try the next, looser query */
    }
  }
  return null;
}

function RegisterSupplier() {
  const [form, setForm] = useState({
    username: "",
    password: "",
    name: "",
    phone: "",
    pricePerUnit: "",
    availableUnits: "",
    renewable: false,
  });

  const [address, setAddress] = useState({
    line1: "",
    landmark: "",
    area: "",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "",
  });

  // { lat, lng, source: "gps" | "lookup", approx?: boolean }
  const [coords, setCoords] = useState(null);
  const [locating, setLocating] = useState(false);
  const [locMsg, setLocMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddress({ ...address, [name]: value });
    // a looked-up pin goes stale when the address changes; a GPS pin stays
    if (coords?.source === "lookup") {
      setCoords(null);
      setLocMsg("");
    }
  };

  const addressComplete =
    address.line1.trim() && address.area.trim() && address.city.trim() &&
    address.state.trim() && /^\d{6}$/.test(address.pincode.trim());

  // ---- exact location from the device (best when the supplier is at the station) ----
  const useMyLocation = () => {
    if (!("geolocation" in navigator)) {
      setLocMsg("Location is not supported in this browser.");
      return;
    }
    setLocating(true);
    setLocMsg("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude, source: "gps" });
        setLocating(false);
        setLocMsg("");
      },
      () => {
        setLocating(false);
        setLocMsg("Couldn't read your location. Allow location access, or use “Find from address”.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // ---- location from the typed address ----
  const findFromAddress = async () => {
    if (!addressComplete) {
      setLocMsg("Fill in building/street, area, city, state and a 6-digit pincode first.");
      return null;
    }
    setLocating(true);
    setLocMsg("");
    const found = await geocodeAddress(address);
    setLocating(false);
    if (!found) {
      setLocMsg("Couldn't find that address on the map. Check it, or use “Use my current location”.");
      return null;
    }
    const next = { ...found, source: "lookup" };
    setCoords(next);
    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!addressComplete) {
      alert("Please enter the full station address (with a 6-digit pincode).");
      return;
    }

    setSubmitting(true);
    try {
      let pin = coords;
      if (!pin) pin = await findFromAddress();
      if (!pin) {
        setSubmitting(false);
        return;
      }

      await axios.post("https://coolgrid-ev-1.onrender.com/api/auth/register/supplier", {
        username: form.username,
        password: form.password,
        name: form.name,
        phone: form.phone,
        renewable: form.renewable,
        pricePerUnit: Number(form.pricePerUnit),
        availableUnits: Number(form.availableUnits),

        area: address.area.trim(), // short locality, still used on station cards
        address: {
          line1: address.line1.trim(),
          landmark: address.landmark.trim(),
          area: address.area.trim(),
          city: address.city.trim(),
          state: address.state.trim(),
          pincode: address.pincode.trim(),
        },
        coordinates: { lat: pin.lat, lng: pin.lng },
      });

      alert("Supplier registered!");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <LiquidGlassLayout
      title="Register supplier"
      accent="amber"
      panelMaxWidth={960}
      highlights={SUPPLIER_HIGHLIGHTS}
    >
      <style>{`
        .reg-section { font-size:10px; letter-spacing:1px; text-transform:uppercase; color:var(--cg-green); font-weight:700; margin:26px 0 14px; display:flex; align-items:center; gap:10px; }
        .reg-section::after { content:""; flex:1; height:1px; background:var(--cg-line); }
        .reg-row { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
        @media (max-width:520px){ .reg-row{ grid-template-columns:1fr; } }
        .loc-box { background:var(--cg-bg); border:1px solid var(--cg-line); border-radius:12px; padding:14px; margin-bottom:6px; }
        .loc-box.ok { border-color: rgba(52,224,161,.5); }
        .loc-actions { display:flex; gap:10px; flex-wrap:wrap; }
        .loc-btn { background:var(--cg-card); color:var(--cg-text); border:1px solid var(--cg-line); border-radius:9px; padding:9px 14px; font-size:13px; font-weight:600; cursor:pointer; transition:border-color .15s, color .15s; }
        .loc-btn:hover:not(:disabled) { border-color:var(--cg-green); color:var(--cg-green); }
        .loc-btn:disabled { opacity:.55; cursor:wait; }
        .loc-status { font-size:12.5px; margin-top:10px; color:var(--cg-muted); line-height:1.5; }
        .loc-status b { color:var(--cg-green); font-weight:600; }
        .loc-status.warn { color:#fbbf24; }
        .loc-status.err { color:var(--cg-red); }
      `}</style>

      <p className="glass-subtitle">Join the network and start supplying energy credits</p>

      <Form onSubmit={handleSubmit}>
        <div className="reg-section">Account &amp; pricing</div>

        {BASIC_FIELDS.map((f) => (
          <Form.Group key={f.name} className="mb-3">
            <div className="glass-field-label">{f.label}</div>
            <Form.Control
              className="glass-input"
              required
              type={f.type}
              min={f.type === "number" ? 0 : undefined}
              step={f.name === "pricePerUnit" ? "any" : undefined}
              name={f.name}
              value={form[f.name]}
              onChange={handleChange}
            />
          </Form.Group>
        ))}

        <div className="reg-section">Station address</div>

        <Form.Group className="mb-3">
          <div className="glass-field-label">Building / street</div>
          <Form.Control
            className="glass-input"
            required
            name="line1"
            placeholder="e.g. 12, 4th Cross, 2nd Phase"
            value={address.line1}
            onChange={handleAddressChange}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <div className="glass-field-label">Landmark (optional)</div>
          <Form.Control
            className="glass-input"
            name="landmark"
            placeholder="e.g. Opposite City Mall"
            value={address.landmark}
            onChange={handleAddressChange}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <div className="glass-field-label">Area / locality</div>
          <Form.Control
            className="glass-input"
            required
            name="area"
            placeholder="e.g. JP Nagar"
            value={address.area}
            onChange={handleAddressChange}
          />
        </Form.Group>

        <div className="reg-row mb-3">
          <Form.Group>
            <div className="glass-field-label">City</div>
            <Form.Control className="glass-input" required name="city" value={address.city} onChange={handleAddressChange} />
          </Form.Group>
          <Form.Group>
            <div className="glass-field-label">State</div>
            <Form.Control className="glass-input" required name="state" value={address.state} onChange={handleAddressChange} />
          </Form.Group>
        </div>

        <Form.Group className="mb-3">
          <div className="glass-field-label">Pincode</div>
          <Form.Control
            className="glass-input"
            required
            name="pincode"
            inputMode="numeric"
            maxLength={6}
            placeholder="560078"
            value={address.pincode}
            onChange={(e) =>
              handleAddressChange({ target: { name: "pincode", value: e.target.value.replace(/\D/g, "") } })
            }
          />
        </Form.Group>

        <div className="glass-field-label">Map location</div>
        <div className={`loc-box ${coords ? "ok" : ""}`}>
          <div className="loc-actions">
            <button type="button" className="loc-btn" onClick={useMyLocation} disabled={locating}>
              📍 Use my current location
            </button>
            <button type="button" className="loc-btn" onClick={findFromAddress} disabled={locating}>
              🔎 Find from address
            </button>
          </div>

          {locating && <div className="loc-status">Locating…</div>}

          {!locating && coords && (
            <div className={`loc-status ${coords.approx ? "warn" : ""}`}>
              <b>{coords.source === "gps" ? "Using your current location" : "Found on map"}</b> —{" "}
              {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
              {coords.approx &&
                " (approximate — only the area matched. Stand at the station and use “Use my current location” for an exact pin.)"}
            </div>
          )}

          {!locating && !coords && !locMsg && (
            <div className="loc-status">
              Customers see the distance to this point. Use your current location if you're at the
              station, otherwise we'll look the address up when you register.
            </div>
          )}

          {locMsg && <div className="loc-status err">{locMsg}</div>}
        </div>

        <Form.Group className="mt-3 mb-4 d-flex align-items-center">
          <Form.Check
            className="glass-check"
            type="checkbox"
            name="renewable"
            checked={form.renewable}
            onChange={handleChange}
            label="I use renewable energy"
          />
        </Form.Group>

        <Button type="submit" className="glass-btn" disabled={submitting || locating}>
          {submitting ? "Registering…" : "Register"}
        </Button>
      </Form>
    </LiquidGlassLayout>
  );
}

export default RegisterSupplier;

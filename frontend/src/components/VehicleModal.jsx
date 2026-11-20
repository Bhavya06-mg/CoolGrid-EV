import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import CarIllustration from "./CarIllustration";
import {
  useVehicle,
  batteryStatus,
  hasBattery,
  unitsToFull,
  timeAgo,
  vehicleTitle,
  CONNECTORS,
} from "../utils/vehicle";

// "My Car" dialog: shows the car + current battery details, with an Edit button.
export default function VehicleModal({ show, onClose }) {
  const { vehicle, update } = useVehicle();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({});
  const [error, setError] = useState("");

  const isEmpty = !vehicle.model && !vehicle.brand && !hasBattery(vehicle);

  // every time the dialog opens: details view, or the form if nothing is saved yet
  useEffect(() => {
    if (!show) return;
    setError("");
    setEditing(isEmpty);
    setDraft({
      brand: vehicle.brand || "",
      model: vehicle.model || "",
      battery: vehicle.battery ?? "",
      range: vehicle.range ?? "",
      capacity: vehicle.capacity ?? "",
      connector: vehicle.connector || CONNECTORS[0],
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  const set = (k) => (e) => setDraft({ ...draft, [k]: e.target.value });

  const save = () => {
    const pct = draft.battery === "" ? "" : Number(draft.battery);
    const range = draft.range === "" ? "" : Number(draft.range);
    const cap = draft.capacity === "" ? "" : Number(draft.capacity);

    if (pct !== "" && (Number.isNaN(pct) || pct < 0 || pct > 100)) return setError("Battery must be between 0 and 100%.");
    if (range !== "" && (Number.isNaN(range) || range < 0)) return setError("Range can't be negative.");
    if (cap !== "" && (Number.isNaN(cap) || cap <= 0)) return setError("Battery capacity must be more than 0 kWh.");

    update({
      brand: draft.brand.trim(),
      model: draft.model.trim(),
      battery: pct,
      range,
      capacity: cap,
      connector: draft.connector,
      updatedAt: Date.now(),
    });
    setError("");
    setEditing(false);
  };

  const status = batteryStatus(vehicle.battery);
  const pct = hasBattery(vehicle) ? Math.max(0, Math.min(100, Number(vehicle.battery))) : null;
  const toFull = unitsToFull(vehicle);
  const title = vehicleTitle(vehicle) || "Your EV";

  return (
    <Modal show={show} onHide={onClose} centered dialogClassName="vm-dialog">
      <style>{css}</style>
      <Modal.Header closeButton>
        <Modal.Title>{editing ? (isEmpty ? "Add your EV" : "Edit car details") : "My Car"}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <CarIllustration className="vm-car" />

        {!editing ? (
          <>
            <div className="vm-name">{title}</div>
            <div className="vm-id">{vehicle.vehicleId ? `Vehicle ID · ${vehicle.vehicleId}` : "No vehicle ID on this account"}</div>

            <div className="vm-batt">
              <div className="vm-batt-top">
                <span>Current battery</span>
                <b className={status ? `t-${status.tone}` : ""}>{pct !== null ? `${pct}%${status ? ` · ${status.label}` : ""}` : "Not set"}</b>
              </div>
              <div className="vm-bar"><div className={`vm-fill ${status ? `t-${status.tone}` : ""}`} style={{ width: `${pct ?? 0}%` }} /></div>
            </div>

            <div className="vm-grid">
              <div><span>Estimated range</span><b>{vehicle.range ? `${vehicle.range} km` : "—"}</b></div>
              <div><span>Battery capacity</span><b>{vehicle.capacity ? `${vehicle.capacity} kWh` : "—"}</b></div>
              <div><span>Connector</span><b>{vehicle.connector || "—"}</b></div>
              <div><span>To reach 100%</span><b>{toFull !== null ? `≈ ${toFull.toFixed(1)} units` : "—"}</b></div>
            </div>

            {toFull !== null && toFull > 0 && (
              <div className="vm-tip">⚡ To fill up from {pct}%, request about <b>{Math.ceil(toFull)} units</b> when you book.</div>
            )}
            {toFull === null && (
              <div className="vm-tip mute">Add your battery capacity and current charge to see how many units you need to book.</div>
            )}
            {vehicle.updatedAt && <div className="vm-updated">Updated {timeAgo(vehicle.updatedAt)} · saved on this device</div>}
          </>
        ) : (
          <div className="vm-form">
            <div className="vm-row">
              <label>Brand<input placeholder="e.g. Tata" value={draft.brand} onChange={set("brand")} /></label>
              <label>Model<input placeholder="e.g. Nexon EV" value={draft.model} onChange={set("model")} /></label>
            </div>

            <label>Vehicle ID <small>(from your account)</small>
              <input value={vehicle.vehicleId || ""} disabled placeholder="—" />
            </label>

            <label>Current battery: <b className="vm-pct">{draft.battery === "" ? "—" : `${draft.battery}%`}</b>
              <input
                type="range" min="0" max="100" className="vm-slider"
                value={draft.battery === "" ? 0 : draft.battery}
                onChange={set("battery")}
              />
            </label>

            <div className="vm-row">
              <label>Battery capacity (kWh)<input type="number" min="0" step="any" placeholder="30.2" value={draft.capacity} onChange={set("capacity")} /></label>
              <label>Range at full (km)<input type="number" min="0" placeholder="312" value={draft.range} onChange={set("range")} /></label>
            </div>

            <label>Charging connector
              <select value={draft.connector} onChange={set("connector")}>
                {CONNECTORS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>

            {error && <div className="vm-err">{error}</div>}
          </div>
        )}
      </Modal.Body>

      <Modal.Footer>
        {!editing ? (
          <>
            <button className="cg-btn-ghost" onClick={onClose}>Close</button>
            <button className="cg-btn" onClick={() => setEditing(true)}>Edit details</button>
          </>
        ) : (
          <>
            <button className="cg-btn-ghost" onClick={() => (isEmpty ? onClose() : (setEditing(false), setError("")))}>Cancel</button>
            <button className="cg-btn" onClick={save}>Save</button>
          </>
        )}
      </Modal.Footer>
    </Modal>
  );
}

const css = `
  .vm-dialog { max-width: 460px; }
  .vm-car { width: 78%; display:block; margin: 0 auto 6px; }
  .vm-name { text-align:center; font-size:20px; font-weight:600; color:var(--cg-text); }
  .vm-id { text-align:center; font-size:11px; color:var(--cg-muted); margin:2px 0 18px; }
  .vm-batt { background:var(--cg-card); border-radius:12px; padding:14px; margin-bottom:12px; }
  .vm-batt-top { display:flex; justify-content:space-between; font-size:12px; color:var(--cg-muted); margin-bottom:10px; }
  .vm-batt-top b { color:var(--cg-text); font-size:14px; }
  .vm-bar { height:8px; background:#232526; border-radius:6px; overflow:hidden; }
  .vm-fill { height:100%; border-radius:6px; background:var(--cg-muted); transition:width .3s; }
  .vm-fill.t-good { background:var(--cg-green); } .vm-fill.t-mid { background:var(--cg-amber); } .vm-fill.t-low { background:var(--cg-red); }
  .vm-batt-top b.t-good { color:var(--cg-green); } .vm-batt-top b.t-mid { color:var(--cg-amber); } .vm-batt-top b.t-low { color:var(--cg-red); }
  .vm-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
  .vm-grid > div { background:var(--cg-card); border-radius:12px; padding:12px 14px; }
  .vm-grid span { display:block; font-size:10px; color:var(--cg-muted); margin-bottom:4px; }
  .vm-grid b { font-size:15px; font-weight:500; color:var(--cg-text); }
  .vm-tip { margin-top:12px; font-size:12.5px; line-height:1.5; color:var(--cg-green); background:var(--cg-green-soft); border-radius:10px; padding:10px 12px; }
  .vm-tip.mute { color:var(--cg-muted); background:var(--cg-card); }
  .vm-tip b { font-weight:700; }
  .vm-updated { text-align:center; font-size:10.5px; color:var(--cg-muted); margin-top:12px; }

  .vm-form { display:flex; flex-direction:column; gap:12px; }
  .vm-form label { font-size:10.5px; color:var(--cg-muted); display:block; font-weight:600; letter-spacing:.3px; }
  .vm-form label small { font-weight:400; }
  .vm-form input, .vm-form select { width:100%; margin-top:5px; background:var(--cg-bg); border:1px solid var(--cg-line); border-radius:9px; color:var(--cg-text); font-size:13px; padding:10px 12px; outline:none; }
  .vm-form input:focus, .vm-form select:focus { border-color:var(--cg-green); box-shadow:0 0 0 3px var(--cg-green-soft); }
  .vm-form input:disabled { background:var(--cg-card); color:var(--cg-muted); }
  .vm-form input[type=range] { padding:0; height:6px; accent-color:var(--cg-green); border:0; margin-top:12px; }
  .vm-pct { color:var(--cg-green); font-size:13px; }
  .vm-row { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
  .vm-err { color:var(--cg-red); font-size:12px; }
  .t-good{ color:var(--cg-green); } .t-mid{ color:var(--cg-amber); } .t-low{ color:var(--cg-red); }
`;

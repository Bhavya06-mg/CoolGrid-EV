// DashboardCustomer.jsx — EV Hub style redesign
// Same data flow as before (geolocation -> /api/customer/dashboard -> book),
// new layout: map panel + station cards on the left, stats panel on the right.
import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import CarIllustration from "../components/CarIllustration";
import { useVehicle, batteryStatus } from "../utils/vehicle";

const API = "https://coolgrid-ev-1.onrender.com/api";

export default function DashboardCustomer() {
  const [suppliers, setSuppliers] = useState([]);
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [customerLocation, setCustomerLocation] = useState(undefined);
  const [loadingSuppliers, setLoadingSuppliers] = useState(true);
  const [selectedId, setSelectedId] = useState(null);

  const navigate = useNavigate();
  const { vehicle, update: updateVehicle } = useVehicle();
  const [editingVehicle, setEditingVehicle] = useState(false);
  const [draft, setDraft] = useState({ model: "", battery: "", range: "" });
  const bStatus = batteryStatus(vehicle.battery);

  const startEdit = () => {
    setDraft({ model: vehicle.model || "", battery: vehicle.battery ?? "", range: vehicle.range ?? "" });
    setEditingVehicle(true);
  };
  const saveEdit = () => {
    const clamp = (v, max) => (v === "" ? "" : Math.max(0, Math.min(max, Number(v))));
    updateVehicle({ model: draft.model.trim(), battery: clamp(draft.battery, 100), range: clamp(draft.range, 2000) });
    setEditingVehicle(false);
  };

  const haversineKm = useCallback((lat1, lon1, lat2, lon2) => {
    lat1 = Number(lat1);
    lon1 = Number(lon1);
    lat2 = Number(lat2);
    lon2 = Number(lon2);
    const toRad = (deg) => (deg * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }, []);

  // ---- geolocation ----
  useEffect(() => {
    let timer = null;
    if (!("geolocation" in navigator)) {
      setCustomerLocation(null);
      return;
    }
    const success = (pos) => {
      clearTimeout(timer);
      setCustomerLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    };
    const fail = () => {
      clearTimeout(timer);
      setCustomerLocation(null);
    };
    navigator.geolocation.getCurrentPosition(success, fail, {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 8000,
    });
    timer = setTimeout(() => setCustomerLocation((prev) => (prev === undefined ? null : prev)), 6000);
    return () => clearTimeout(timer);
  }, []);

  // ---- fetch suppliers ----
  useEffect(() => {
    if (customerLocation === undefined) return;

    const fetchSuppliers = async () => {
      setLoadingSuppliers(true);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API}/customer/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        let list = (res.data.suppliers || []).filter((s) => !!s.isOnline);

        list = list.map((s) => {
          const slat = s?.coordinates?.lat ?? s?.lat ?? null;
          const slng = s?.coordinates?.lng ?? s?.lng ?? null;
          let distance = null;
          if (customerLocation && slat != null && slng != null) {
            distance = haversineKm(customerLocation.lat, customerLocation.lng, slat, slng);
          }
          return { ...s, _lat: slat, _lng: slng, distance };
        });

        if (customerLocation) {
          list.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
        }

        setSuppliers(list);
        setSelectedId((cur) => cur ?? list[0]?._id ?? null);
      } catch (err) {
        setMessage("Failed to load suppliers.");
      } finally {
        setLoadingSuppliers(false);
      }
    };

    fetchSuppliers();
  }, [customerLocation, haversineKm]);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return suppliers.filter(
      (s) =>
        (s.name || "").toLowerCase().includes(q) ||
        (s.area || s.location || "").toLowerCase().includes(q)
    );
  }, [suppliers, searchQuery]);

  const selected = useMemo(
    () => filtered.find((s) => s._id === selectedId) || filtered[0] || null,
    [filtered, selectedId]
  );

  // ---- booking (unchanged behaviour) ----
  const handleBooking = async (supplierId) => {
    const customerId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "CUSTOMER") return alert("Login first!");

    const unitsRequested = prompt("Enter units:");
    if (!unitsRequested) return;

    try {
      if (customerLocation) {
        await axios.post(
          `${API}/request/customer/update-location`,
          { customerId, lat: customerLocation.lat, lng: customerLocation.lng },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      const res = await axios.post(
        `${API}/request/create`,
        { customerId, supplierId, unitsRequested },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Request sent!");
      localStorage.setItem("requestId", res.data.request._id);
      navigate(`/customer/booking/${res.data.request._id}`);
    } catch (err) {
      alert("Failed.");
    }
  };

  // ---- map projection (real coordinates -> SVG) ----
  const W = 700;
  const H = 300;
  const mapPoints = useMemo(() => {
    const pts = filtered
      .filter((s) => s._lat != null && s._lng != null)
      .map((s) => ({ id: s._id, name: s.name, lat: Number(s._lat), lng: Number(s._lng) }));
    const all = [...pts];
    if (customerLocation) all.push({ id: "me", lat: customerLocation.lat, lng: customerLocation.lng });
    if (all.length === 0) return { pins: [], me: null };

    let minLat = Math.min(...all.map((p) => p.lat));
    let maxLat = Math.max(...all.map((p) => p.lat));
    let minLng = Math.min(...all.map((p) => p.lng));
    let maxLng = Math.max(...all.map((p) => p.lng));
    // avoid zero span when there is a single point
    if (maxLat - minLat < 0.002) { minLat -= 0.01; maxLat += 0.01; }
    if (maxLng - minLng < 0.002) { minLng -= 0.01; maxLng += 0.01; }

    const padX = 80, padTop = 90, padBottom = 75;
    const project = (p) => ({
      ...p,
      x: padX + ((p.lng - minLng) / (maxLng - minLng)) * (W - padX * 2),
      y: H - padBottom - ((p.lat - minLat) / (maxLat - minLat)) * (H - padTop - padBottom),
    });
    return {
      pins: pts.map(project),
      me: customerLocation ? project({ id: "me", lat: customerLocation.lat, lng: customerLocation.lng }) : null,
    };
  }, [filtered, customerLocation]);

  const selectedPin = mapPoints.pins.find((p) => p.id === selected?._id);
  const routePath =
    mapPoints.me && selectedPin
      ? `M${mapPoints.me.x} ${mapPoints.me.y} L${selectedPin.x} ${mapPoints.me.y} L${selectedPin.x} ${selectedPin.y}`
      : null;

  // ---- derived stats from real data ----
  const stats = useMemo(() => {
    const n = filtered.length;
    const totalUnits = filtered.reduce((a, s) => a + (Number(s.availableUnits) || 0), 0);
    const avgPrice = n ? filtered.reduce((a, s) => a + (Number(s.pricePerUnit) || 0), 0) / n : 0;
    const cheapest = n ? Math.min(...filtered.map((s) => Number(s.pricePerUnit) || Infinity)) : 0;
    return { n, totalUnits, avgPrice, cheapest };
  }, [filtered]);

  const fmtDist = (d) => (d == null || !isFinite(d) ? "—" : d.toFixed(2));

  return (
    <div className="ev-page">
      <style>{css}</style>

      <div className="ev-shell">
        {/* header */}
        <div className="ev-head">
          <div>
            <div className="ev-crumb">Pages / Stations</div>
            <h1 className="ev-title">Stations</h1>
          </div>
          <div className="ev-live">
            <span className="ev-dot" />
            {stats.n} online
          </div>
        </div>

        {message && <div className="ev-error">{message}</div>}

        <div className="ev-grid">
          {/* LEFT: map + cards */}
          <section className="ev-panel ev-left">
            <div className="ev-left-top">
              <div className="ev-loc">
                {customerLocation ? "Near you" : "All stations"}
              </div>
              <input
                className="ev-search"
                placeholder="Search by name or location"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="ev-map">
              <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice">
                <rect width={W} height={H} fill="#1a1b1c" />
                <g stroke="#2a2c2d" strokeWidth="10" fill="none">
                  <path d="M0 60H700M0 150H700M0 240H700M90 0V300M250 0V300M430 0V300M600 0V300" />
                </g>
                <g stroke="#242627" strokeWidth="3" fill="none">
                  <path d="M0 105H700M0 195H700M170 0V300M340 0V300M520 0V300" />
                </g>
                {routePath && (
                  <path
                    d={routePath}
                    stroke="#34e0a1"
                    strokeWidth="4"
                    fill="none"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                )}
                {routePath && selected?.distance != null && (
                  <g transform={`translate(${(mapPoints.me.x + selectedPin.x) / 2},${mapPoints.me.y})`}>
                    <rect x="-34" y="-12" width="68" height="24" rx="12" fill="#0b0b0c" stroke="#34e0a1" />
                    <text y="4" textAnchor="middle" fontSize="12" fill="#34e0a1">{selected.distance.toFixed(1)} km</text>
                  </g>
                )}
                {mapPoints.me && (
                  <g transform={`translate(${mapPoints.me.x},${mapPoints.me.y})`}>
                    <circle r="14" fill="rgba(52,224,161,0.18)" />
                    <circle r="6" fill="#34e0a1" stroke="#0b0b0c" strokeWidth="2" />
                    <text y="26" textAnchor="middle" fontSize="11" fill="#9aa3a0">You</text>
                  </g>
                )}
                {mapPoints.pins.map((p) => {
                  const active = p.id === selected?._id;
                  return (
                    <g
                      key={p.id}
                      transform={`translate(${p.x},${p.y})`}
                      style={{ cursor: "pointer" }}
                      onClick={() => setSelectedId(p.id)}
                    >
                      <path
                        d="M0 0c-13-16-16-22-16-29a16 16 0 1 1 32 0c0 7-3 13-16 29z"
                        fill={active ? "#34e0a1" : "#1fa874"}
                        stroke="#0b0b0c"
                        strokeWidth="1.5"
                      />
                      <path d="M2-36l-7 12h5l-2 9 7-12h-5z" fill="#04251a" />
                      <text y="18" textAnchor="middle" fontSize="11" fill={active ? "#f2f4f3" : "#9aa3a0"}>{p.name}</text>
                    </g>
                  );
                })}
              </svg>
              {!loadingSuppliers && mapPoints.pins.length === 0 && (
                <div className="ev-map-empty">No station coordinates available yet.</div>
              )}
            </div>

            {loadingSuppliers ? (
              <div className="ev-loading">Loading stations…</div>
            ) : filtered.length === 0 ? (
              <div className="ev-loading">No suppliers found.</div>
            ) : (
              <div className="ev-cards">
                {filtered.map((s) => (
                  <div
                    key={s._id}
                    className={`ev-card ${selected?._id === s._id ? "sel" : ""}`}
                    onClick={() => setSelectedId(s._id)}
                  >
                    <div className="ev-card-top">
                      <svg viewBox="0 0 24 24" className="ev-ico" fill="none" strokeWidth="1.6">
                        <rect x="4" y="3" width="12" height="18" rx="2" />
                        <path d="M10 7 7.5 12h3L9 17M16 8h2a2 2 0 0 1 2 2v6" />
                      </svg>
                      <span className="ev-muted">•••</span>
                    </div>
                    <div className="ev-dist">
                      <span>
                        {fmtDist(s.distance)} <small>km</small>
                      </span>
                      <span className="ev-go">↗</span>
                    </div>
                    <h3 className="ev-card-name">{s.name}</h3>
                    <div className="ev-meta">
                      <span>
                        Location<b>{s.area || "—"}</b>
                      </span>
                      <span>
                        Price<b>₹{s.pricePerUnit}</b>
                      </span>
                      <span>
                        Units<b>{s.availableUnits}</b>
                      </span>
                    </div>
                    <button
                      className="ev-book"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBooking(s._id);
                      }}
                    >
                      Book
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* RIGHT: vehicle + stats */}
          <aside className="ev-right">
            <div className="ev-panel ev-veh">
              <div className="ev-sel-head">
                <span style={{ color: "#f2f4f3", fontSize: 12 }}>Vehicle Stats</span>
                {editingVehicle ? (
                  <span>
                    <button className="ev-link" onClick={() => setEditingVehicle(false)}>Cancel</button>
                    <button className="ev-link g" onClick={saveEdit}>Save</button>
                  </span>
                ) : (
                  <button className="ev-link g" onClick={startEdit}>Edit</button>
                )}
              </div>

              <CarIllustration className="ev-veh-img" />

              {editingVehicle ? (
                <div className="ev-veh-form">
                  <label>Model
                    <input placeholder="e.g. Tata Nexon EV" value={draft.model} onChange={(e) => setDraft({ ...draft, model: e.target.value })} />
                  </label>
                  <div className="ev-veh-two">
                    <label>Battery %
                      <input type="number" min="0" max="100" placeholder="80" value={draft.battery} onChange={(e) => setDraft({ ...draft, battery: e.target.value })} />
                    </label>
                    <label>Range (km)
                      <input type="number" min="0" placeholder="340" value={draft.range} onChange={(e) => setDraft({ ...draft, range: e.target.value })} />
                    </label>
                  </div>
                  <div className="ev-muted" style={{ fontSize: 10 }}>Saved on this device.</div>
                </div>
              ) : (
                <div className="ev-stats">
                  <span>EV<b>{vehicle.model || "Add model"}</b></span>
                  <span>Battery<b className={bStatus ? `t-${bStatus.tone}` : ""}>{vehicle.battery !== undefined && vehicle.battery !== "" ? `${vehicle.battery}%` : "—"}</b></span>
                  <span>Range<b>{vehicle.range ? `${vehicle.range} km` : "—"}</b></span>
                  <span>Vehicle ID<b>{vehicle.vehicleId || "—"}</b></span>
                </div>
              )}
            </div>

            <div className="ev-two">
              <div className="ev-box">
                Battery Status
                <b className={bStatus ? `t-${bStatus.tone}` : ""}>{bStatus ? `⚡ ${bStatus.label}` : "Not set"}</b>
                Stations online<b>{stats.n}</b>
                Units available<b>{stats.totalUnits}</b>
              </div>
              <div className="ev-box">
                Nearby Station
                <b>{filtered[0]?.name || "—"}</b>
                <b style={{ fontSize: 16 }}>{filtered[0] ? `${fmtDist(filtered[0].distance)} km` : "—"}</b>
                <svg viewBox="0 0 120 70" className="ev-mini">
                  <rect width="120" height="70" rx="8" fill="#1d1f20" />
                  <path d="M0 22H120M0 48H120M30 0V70M80 0V70" stroke="#2a2c2d" strokeWidth="4" />
                  <path d="M14 56 L50 40 L62 18 L104 14" stroke="#34e0a1" strokeWidth="2.5" fill="none" strokeLinejoin="round" strokeLinecap="round" />
                  <circle cx="104" cy="14" r="5" fill="#34e0a1" />
                </svg>
              </div>
            </div>

            <div className="ev-box ev-energy">
              Avg price
              <b>₹{stats.avgPrice ? stats.avgPrice.toFixed(0) : "—"} / unit</b>
              <svg viewBox="0 0 260 40" style={{ width: "100%", height: 40 }}>
                <path d="M0 28C40 22 60 32 100 26S180 20 260 22" stroke="#34e0a1" strokeWidth="2.5" fill="none" />
              </svg>
              <span>Cheapest: ₹{isFinite(stats.cheapest) && stats.cheapest ? stats.cheapest : "—"}</span>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

const css = `
  .ev-veh-img{ width:100%; height:auto; display:block; margin:10px 0 6px; }
  .ev-stats{ display:grid; grid-template-columns:1fr 1fr; gap:12px 10px; font-size:10px; color:#7d8582; }
  .ev-stats b{ display:block; color:#f2f4f3; font-size:13px; font-weight:500; margin-top:3px; word-break:break-word; }
  .t-good{ color:#34e0a1 !important; } .t-mid{ color:#fbbf24 !important; } .t-low{ color:#f87171 !important; }
  .ev-link{ background:none; border:0; color:#7d8582; font-size:11px; cursor:pointer; padding:0 0 0 12px; }
  .ev-link.g{ color:#34e0a1; font-weight:600; }
  .ev-veh-form{ display:flex; flex-direction:column; gap:10px; }
  .ev-veh-form label{ font-size:10px; color:#7d8582; display:block; }
  .ev-veh-form input{ width:100%; margin-top:4px; background:#0b0b0c; border:1px solid #232526; border-radius:8px; color:#f2f4f3; font-size:12px; padding:8px 10px; outline:none; }
  .ev-veh-form input:focus{ border-color:#34e0a1; }
  .ev-veh-two{ display:grid; grid-template-columns:1fr 1fr; gap:10px; }
  .ev-mini{ width:100%; height:auto; display:block; margin-top:2px; }
  .ev-page{ font-family:"DM Sans","Inter",system-ui,sans-serif; color:#f2f4f3; padding:8px 0 48px; }
  .ev-shell{ max-width:1280px; margin:0 auto; }
  .ev-head{ display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; }
  .ev-crumb{ font-size:10px; color:#7d8582; }
  .ev-title{ font-size:22px; font-weight:600; margin:2px 0 0; color:#f2f4f3; }
  .ev-live{ display:flex; align-items:center; gap:8px; background:#161718; border-radius:20px; padding:8px 14px; font-size:12px; color:#9aa3a0; }
  .ev-dot{ width:8px; height:8px; border-radius:50%; background:#34e0a1; box-shadow:0 0 8px 2px rgba(52,224,161,.55); }
  .ev-error{ color:#f87171; font-size:13px; margin-bottom:10px; }
  .ev-grid{ display:grid; grid-template-columns:minmax(0,1fr) 300px; gap:16px; }
  .ev-panel{ background:#111213; border-radius:16px; padding:16px; }
  .ev-left{ display:flex; flex-direction:column; gap:14px; min-width:0; }
  .ev-left-top{ display:flex; justify-content:space-between; align-items:center; gap:12px; flex-wrap:wrap; }
  .ev-loc{ font-size:16px; font-weight:600; display:flex; align-items:center; gap:8px; }
  .ev-loc::before{ content:""; width:8px; height:8px; border-radius:50%; background:#34e0a1; }
  .ev-search{ background:#0b0b0c; border:1px solid #232526; border-radius:8px; padding:9px 12px; color:#f2f4f3; font-size:12px; width:240px; max-width:100%; outline:none; }
  .ev-search::placeholder{ color:#6b7370; }
  .ev-search:focus{ border-color:#34e0a1; }
  .ev-map{ position:relative; height:280px; border-radius:12px; overflow:hidden; background:#1a1b1c; }
  .ev-map svg{ width:100%; height:100%; display:block; }
  .ev-map-empty{ position:absolute; inset:0; display:grid; place-items:center; color:#7d8582; font-size:12px; background:rgba(11,11,12,.55); }
  .ev-loading{ color:#7d8582; font-size:13px; text-align:center; padding:22px; }
  .ev-cards{ display:grid; grid-auto-flow:column; grid-auto-columns:minmax(200px,calc((100% - 24px)/3)); gap:12px; overflow-x:auto; padding-bottom:6px; scrollbar-width:thin; scrollbar-color:#2a2c2d transparent; }
  .ev-card{ background:#161718; border:1px solid transparent; border-radius:14px; padding:14px; cursor:pointer; transition:border-color .2s, transform .2s; }
  .ev-card:hover{ border-color:#2f3a35; transform:translateY(-2px); }
  .ev-card.sel{ border-color:#34e0a1; box-shadow:0 0 0 1px rgba(52,224,161,.25); }
  .ev-card-top{ display:flex; justify-content:space-between; align-items:center; }
  .ev-ico{ width:26px; height:26px; stroke:#34e0a1; }
  .ev-muted{ color:#7d8582; }
  .ev-dist{ display:flex; justify-content:space-between; align-items:center; margin:12px 0 6px; font-size:22px; }
  .ev-dist small{ font-size:14px; color:#7d8582; }
  .ev-go{ width:22px; height:22px; border-radius:6px; background:rgba(52,224,161,.15); color:#34e0a1; display:grid; place-items:center; font-size:12px; }
  .ev-card-name{ font-size:14px; font-weight:500; margin:0 0 12px; color:#f2f4f3; }
  .ev-meta{ display:flex; justify-content:space-between; gap:6px; font-size:9px; color:#7d8582; }
  .ev-meta b{ display:block; color:#f2f4f3; font-size:13px; font-weight:500; margin-top:4px; }
  .ev-book{ margin-top:12px; width:100%; background:#34e0a1; color:#04251a; border:0; border-radius:8px; padding:8px; font-weight:700; font-size:12px; cursor:pointer; transition:background .15s; }
  .ev-book:hover{ background:#5df0b8; }
  .ev-book.big{ padding:11px; font-size:13px; margin-top:14px; }
  .ev-right{ display:flex; flex-direction:column; gap:12px; }
  .ev-sel-head{ display:flex; justify-content:space-between; font-size:12px; color:#7d8582; }
  .ev-sel-name{ font-size:20px; font-weight:600; margin-top:12px; }
  .ev-sel-area{ font-size:12px; margin-bottom:14px; }
  .ev-sel-stats{ display:flex; justify-content:space-between; font-size:10px; color:#7d8582; }
  .ev-sel-stats b{ display:block; color:#f2f4f3; font-size:14px; font-weight:500; margin-top:4px; }
  .ev-sel-stats b.g, .ev-box b.g{ color:#34e0a1; }
  .ev-tag{ display:inline-block; margin-top:12px; font-size:11px; padding:5px 10px; border-radius:999px; background:#1b1d1e; color:#9aa3a0; }
  .ev-tag.on{ background:rgba(52,224,161,.12); color:#34e0a1; }
  .ev-two{ display:grid; grid-template-columns:1fr 1fr; gap:12px; }
  .ev-box{ background:#161718; border-radius:14px; padding:14px; font-size:10px; color:#7d8582; }
  .ev-box b{ display:block; color:#f2f4f3; font-size:14px; font-weight:500; margin:4px 0 12px; word-break:break-word; }
  .ev-energy b{ margin-bottom:6px; }
  @media (max-width:980px){
    .ev-grid{ grid-template-columns:1fr; }
    .ev-cards{ grid-auto-columns:minmax(220px,80%); }
  }
`;

import React, { useEffect, useState } from "react";
import axios from "axios";
import { NavLink, useNavigate } from "react-router-dom";
import CarIllustration from "./CarIllustration";
import VehicleModal from "./VehicleModal";
import { useVehicle, batteryStatus, hasBattery, vehicleTitle, OPEN_EVENT } from "../utils/vehicle";

const ICONS = {
  stations: <path d="M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11Zm0-8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />,
  dashboard: <path d="M4 13h7V4H4v9Zm9 7h7v-9h-7v9ZM4 20h7v-5H4v5Zm9-11h7V4h-7v5Z" />,
  stats: <path d="M5 20V10m7 10V4m7 16v-7" />,
  profile: <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8c0-3.3 3.1-6 7-6s7 2.7 7 6" />,
  logout: <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 16l-4-4 4-4M6 12h10" />,
};

const Icon = ({ name }) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {ICONS[name]}
  </svg>
);

const NAV = {
  CUSTOMER: [
    { to: "/dashboard/customer", label: "Stations", icon: "stations" },
    { to: "/profile/customer", label: "My Profile", icon: "profile" },
  ],
  SUPPLIER: [
    { to: "/dashboard/supplier", label: "Dashboard", icon: "dashboard" },
    { to: "/supplier/statistics", label: "Statistics", icon: "stats" },
    { to: "/profile/supplier", label: "My Profile", icon: "profile" },
  ],
};

function readUser() {
  try {
    return JSON.parse(localStorage.getItem("user")) || {};
  } catch {
    return {};
  }
}

export default function Sidebar() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role") === "SUPPLIER" ? "SUPPLIER" : "CUSTOMER";
  const [user, setUser] = useState(readUser());
  const [showCar, setShowCar] = useState(false);

  // the dashboard's "Edit" link asks the sidebar to open the dialog
  useEffect(() => {
    const open = () => setShowCar(true);
    window.addEventListener(OPEN_EVENT, open);
    return () => window.removeEventListener(OPEN_EVENT, open);
  }, []);

  // login doesn't always store the name — fetch it once so the sidebar isn't "Your account"
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (user.name || !token) return;
    axios
      .get("https://coolgrid-ev-1.onrender.com/api/profile/profile", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        const n = res.data?.profile?.name;
        if (!n) return;
        const next = { ...readUser(), name: n };
        localStorage.setItem("user", JSON.stringify(next));
        setUser(next);
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const name = user.name || "Your account";
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const { vehicle } = useVehicle();
  const status = batteryStatus(vehicle.battery);

  const handleLogout = () => {
    localStorage.clear();
    window.dispatchEvent(new Event("authChange"));
    navigate("/login");
  };

  return (
    <aside className="cg-side">
      <style>{css}</style>

      <div className="cg-side-logo">
        <svg viewBox="0 0 30 34" width="26" height="30"><path d="M17 1 3 19h9l-3 14L27 14h-9z" fill="#34e0a1" /></svg>
        <span>Cool<b>grid</b></span>
      </div>

      <nav className="cg-side-nav">
        {NAV[role].map((item) => (
          <NavLink key={item.to} to={item.to} className={({ isActive }) => `cg-side-link ${isActive ? "active" : ""}`}>
            <Icon name={item.icon} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {role === "CUSTOMER" && (
        <div className="cg-side-cars">
          <div className="cg-side-title">My Car</div>
          <button type="button" className="cg-mycar" onClick={() => setShowCar(true)} aria-label="Open my car details">
            <CarIllustration className="cg-mycar-img" />
            <div className="cg-mycar-name">{vehicleTitle(vehicle) || "Add your EV"}</div>
            <div className="cg-mycar-id">{vehicle.vehicleId ? `ID · ${vehicle.vehicleId}` : "No vehicle ID"}</div>
            <div className="cg-mycar-row">
              <span>
                Battery
                <b className={status ? `t-${status.tone}` : ""}>{hasBattery(vehicle) ? `${vehicle.battery}%` : "—"}</b>
              </span>
              <span>
                Range
                <b>{vehicle.range ? `${vehicle.range} km` : "—"}</b>
              </span>
            </div>
            <div className="cg-mycar-cta">{vehicleTitle(vehicle) || hasBattery(vehicle) ? "View / edit details" : "Add car details"} ›</div>
          </button>
          <VehicleModal show={showCar} onClose={() => setShowCar(false)} />
        </div>
      )}

      <div className="cg-side-user">
        <div className="cg-avatar">{initials || "U"}</div>
        <div className="cg-user-meta">
          <div className="cg-user-name">{name}</div>
          <div className="cg-user-role">{role === "SUPPLIER" ? "Supplier" : "Customer"}</div>
        </div>
        <button className="cg-logout" onClick={handleLogout} title="Logout" aria-label="Logout">
          <Icon name="logout" />
        </button>
      </div>
    </aside>
  );
}

const css = `
  .cg-side{ width:230px; flex-shrink:0; background:var(--cg-side); border-right:1px solid var(--cg-line);
    padding:22px 16px; display:flex; flex-direction:column; gap:22px; position:sticky; top:0; height:100vh; overflow-y:auto; }
  .cg-side-logo{ display:flex; align-items:center; gap:10px; font-size:22px; font-weight:700; color:var(--cg-text); padding:0 6px; }
  .cg-side-logo b{ color:var(--cg-green); font-weight:700; }
  .cg-side-nav{ display:flex; flex-direction:column; gap:2px; }
  .cg-side-link{ position:relative; display:flex; align-items:center; gap:12px; padding:11px 10px; border-radius:10px;
    color:var(--cg-muted); font-size:13px; text-decoration:none; transition:color .15s, background .15s; }
  .cg-side-link:hover{ color:var(--cg-text); background:var(--cg-card); }
  .cg-side-link.active{ color:var(--cg-green); background:var(--cg-green-soft); }
  .cg-side-link.active::after{ content:""; position:absolute; right:-16px; top:8px; bottom:8px; width:2px; background:var(--cg-green); border-radius:2px; }
  .cg-side-title{ font-size:12px; color:var(--cg-muted); margin-bottom:8px; padding:0 6px; }
  .cg-mycar{ display:block; width:100%; text-align:left; font:inherit; color:inherit; cursor:pointer; background:var(--cg-card); border:1px solid transparent; border-radius:14px; padding:12px; transition:border-color .15s, transform .15s; }
  .cg-mycar:hover{ border-color:var(--cg-green); transform:translateY(-1px); }
  .cg-mycar:focus-visible{ outline:2px solid var(--cg-green); outline-offset:2px; }
  .cg-mycar-cta{ margin-top:12px; padding-top:10px; border-top:1px solid var(--cg-line); font-size:11px; font-weight:600; color:var(--cg-green); }
  .cg-mycar-img{ width:100%; height:auto; display:block; margin-bottom:6px; }
  .cg-mycar-name{ font-size:13px; font-weight:600; color:var(--cg-text); }
  .cg-mycar-id{ font-size:10px; color:var(--cg-muted); margin:2px 0 10px; word-break:break-all; }
  .cg-mycar-row{ display:flex; gap:22px; font-size:10px; color:var(--cg-muted); }
  .cg-mycar-row b{ display:block; color:var(--cg-text); font-size:12px; font-weight:500; margin-top:3px; }
  .t-good{ color:var(--cg-green) !important; } .t-mid{ color:var(--cg-amber) !important; } .t-low{ color:var(--cg-red) !important; }
  .cg-side-user{ margin-top:auto; display:flex; align-items:center; gap:10px; background:var(--cg-card); border-radius:14px; padding:10px; }
  .cg-avatar{ width:34px; height:34px; border-radius:50%; background:linear-gradient(135deg,#34e0a1,#1fa874); color:#04251a; font-weight:700; font-size:13px; display:grid; place-items:center; flex-shrink:0; }
  .cg-user-meta{ min-width:0; flex:1; }
  .cg-user-name{ font-size:12.5px; font-weight:600; color:var(--cg-text); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .cg-user-role{ font-size:10px; color:var(--cg-muted); }
  .cg-logout{ background:transparent; border:1px solid var(--cg-line); color:var(--cg-muted); width:30px; height:30px; border-radius:8px; display:grid; place-items:center; cursor:pointer; transition:color .15s, border-color .15s; }
  .cg-logout:hover{ color:var(--cg-red); border-color:rgba(248,113,113,.5); }

  @media (max-width: 900px){
    .cg-side{ position:static; width:100%; height:auto; flex-direction:row; flex-wrap:wrap; align-items:center; gap:12px; padding:12px 16px; border-right:0; border-bottom:1px solid var(--cg-line); }
    .cg-side-nav{ flex-direction:row; flex:1; }
    .cg-side-link.active::after{ display:none; }
    .cg-side-cars{ display:none; }
    .cg-side-user{ margin-top:0; }
  }
`;

// Vehicle details for the logged-in customer.
//  - vehicleId comes from the account (backend: Customer.vehicleId)
//  - model / battery / range are entered by the user and saved in this browser
//    (the Customer schema doesn't store them yet).
import { useEffect, useState, useCallback } from "react";
import axios from "axios";

const BACKEND = "https://coolgrid-ev-1.onrender.com";
const EVENT = "vehicleChange";

const key = () => `cg_vehicle_${localStorage.getItem("userId") || "guest"}`;

export function readVehicle() {
  try {
    return JSON.parse(localStorage.getItem(key())) || {};
  } catch {
    return {};
  }
}

export function saveVehicle(patch) {
  const next = { ...readVehicle(), ...patch };
  localStorage.setItem(key(), JSON.stringify(next));
  window.dispatchEvent(new Event(EVENT));
  return next;
}

export function batteryStatus(pct) {
  const n = Number(pct);
  if (pct === "" || pct == null || Number.isNaN(n)) return null;
  if (n >= 60) return { label: "Good", tone: "good" };
  if (n >= 25) return { label: "Medium", tone: "mid" };
  return { label: "Low", tone: "low" };
}

// Hook: returns { vehicle, update }
export function useVehicle() {
  const [vehicle, setVehicle] = useState(readVehicle());

  useEffect(() => {
    const sync = () => setVehicle(readVehicle());
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);

    // pull vehicleId from the account once
    const token = localStorage.getItem("token");
    if (token && localStorage.getItem("role") === "CUSTOMER") {
      axios
        .get(`${BACKEND}/api/profile/profile`, { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => {
          const vid = res.data?.profile?.vehicleId;
          if (vid && vid !== readVehicle().vehicleId) saveVehicle({ vehicleId: vid });
        })
        .catch(() => {});
    }

    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const update = useCallback((patch) => setVehicle(saveVehicle(patch)), []);
  return { vehicle, update };
}

// ---- helpers used by the "My Car" dialog / dashboard ----
export const OPEN_EVENT = "openVehicleModal";
export const openVehicleModal = () => window.dispatchEvent(new Event(OPEN_EVENT));

export const CONNECTORS = ["CCS2", "Type 2 (AC)", "CHAdeMO", "GB/T", "Bharat AC-001", "Other"];

export const vehicleTitle = (v) =>
  [v.brand, v.model].filter(Boolean).join(" ").trim();

export const hasBattery = (v) => v.battery !== undefined && v.battery !== "" && v.battery !== null;

// In India 1 electricity "unit" = 1 kWh, so energy-to-full is also the units to book.
export function unitsToFull(v) {
  const cap = Number(v.capacity);
  const pct = Number(v.battery);
  if (!cap || !hasBattery(v) || Number.isNaN(pct)) return null;
  return Math.max(0, (cap * (100 - pct)) / 100);
}

export function timeAgo(ts) {
  if (!ts) return "";
  const mins = Math.round((Date.now() - ts) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} h ago`;
  return `${Math.round(hrs / 24)} d ago`;
}

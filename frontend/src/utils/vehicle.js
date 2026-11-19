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

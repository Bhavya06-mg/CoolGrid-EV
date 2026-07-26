import React, { useEffect, useState } from "react";

function MapComponent() {
  const [map, setMap] = useState(null);
  const [suppliers, setSuppliers] = useState([]);

  useEffect(() => {
    // ✅ Load Google Map
    const loader = new window.google.maps.Map(document.getElementById("map"), {
      center: { lat: 12.9716, lng: 77.5946 }, // Default to Bangalore
      zoom: 12,
    });
    setMap(loader);
  }, []);

  useEffect(() => {
    // ✅ Fetch suppliers from backend
    fetch("https://coolgrid-ev-1.onrender.com/api/supplier") // make sure backend is running
      .then((res) => res.json())
      .then((data) => setSuppliers(data))
      .catch((err) => console.error("Error fetching suppliers:", err));
  }, []);

  useEffect(() => {
    if (map && suppliers.length > 0) {
      suppliers.forEach((supplier) => {
        // ✅ Add marker for each supplier
        new window.google.maps.Marker({
          position: {
            lat: supplier.location.lat,
            lng: supplier.location.lng,
          },
          map,
          title: supplier.name,
        });
      });
    }
  }, [map, suppliers]);

  return (
    <div style={styles.pageWrap}>
      <style>{`
        html, body, #root { height: 100%; margin: 0; }
        @keyframes float1 { 0%,100%{transform:translate(0,0) scale(1);} 50%{transform:translate(30px,-40px) scale(1.08);} }
        @keyframes float2 { 0%,100%{transform:translate(0,0) scale(1);} 50%{transform:translate(-40px,30px) scale(1.1);} }
        @keyframes float3 { 0%,100%{transform:translate(0,0) scale(1);} 50%{transform:translate(20px,40px) scale(0.95);} }

        .map-heading { color: #f3f6fb; font-weight: 600; }

        .map-glass-frame {
          background: rgba(255,255,255,0.06);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.16);
          border-radius: 22px;
          box-shadow: 0 12px 36px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08);
          padding: 14px;
          overflow: hidden;
        }
        .map-inner {
          border-radius: 14px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.1);
        }
      `}</style>

      <div style={styles.bgLayer}>
        <div style={{ ...styles.blob, ...styles.blobA }} />
        <div style={{ ...styles.blob, ...styles.blobB }} />
        <div style={{ ...styles.blob, ...styles.blobC }} />
      </div>

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1000, margin: "0 auto", padding: "48px 20px" }}>
        <h2 className="text-center map-heading mb-4">Supplier Map</h2>
        <div className="map-glass-frame">
          <div className="map-inner">
            <div
              id="map"
              style={{ width: "100%", height: "500px" }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  pageWrap: { position: "relative", minHeight: "100vh" },
  bgLayer: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    overflow: "hidden",
    zIndex: -1,
    background: "linear-gradient(160deg, #0b1220 0%, #10192e 45%, #0a1420 100%)",
  },
  blob: { position: "absolute", borderRadius: "50%", filter: "blur(70px)", opacity: 0.5, pointerEvents: "none" },
  blobA: { width: 380, height: 380, top: "-8%", left: "-6%", background: "radial-gradient(circle, #38bdf8, transparent 70%)", animation: "float1 15s ease-in-out infinite" },
  blobB: { width: 340, height: 340, bottom: "-8%", right: "-8%", background: "radial-gradient(circle, #34d399, transparent 70%)", animation: "float2 17s ease-in-out infinite" },
  blobC: { width: 260, height: 260, top: "40%", right: "20%", background: "radial-gradient(circle, #a78bfa, transparent 70%)", animation: "float3 13s ease-in-out infinite" },
};

export default MapComponent;
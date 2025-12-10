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
    <div>
      <h2 className="text-center mt-3">Supplier Map</h2>
      <div
        id="map"
        style={{ width: "100%", height: "500px", marginTop: "10px" }}
      ></div>
    </div>
  );
}

export default MapComponent;

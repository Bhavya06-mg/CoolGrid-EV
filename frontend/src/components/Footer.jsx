import React from "react";

function Footer() {
  return (
    <>
      <style>{`
        .glass-footer {
          background: rgba(16, 25, 46, 0.55);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border-top: 1px solid rgba(255, 255, 255, 0.12);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.06);
        }
      `}</style>

      <footer className="glass-footer text-center py-3 mt-5">
        <p style={{ color: "rgba(230, 235, 244, 0.65)", margin: 0, fontSize: "0.9rem" }}>
          © 2025 Coolgrid EV Charging and Credit Exchange
        </p>
      </footer>
    </>
  );
}

export default Footer;
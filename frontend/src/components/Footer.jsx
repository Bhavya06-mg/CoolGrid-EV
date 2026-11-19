import React from "react";

function Footer() {
  return (
    <>
      <style>{`
        .cg-footer {
          background: var(--cg-side);
          border-top: 1px solid var(--cg-line);
          text-align: center;
          padding: 16px 0;
          margin-top: 48px;
        }
        .cg-footer p { color: var(--cg-muted); margin: 0; font-size: 0.85rem; }
      `}</style>

      <footer className="cg-footer">
        <p>© 2025 Coolgrid EV Charging and Credit Exchange</p>
      </footer>
    </>
  );
}

export default Footer;

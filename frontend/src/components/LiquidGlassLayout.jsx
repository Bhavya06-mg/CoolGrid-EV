import React from "react";
import { Container } from "react-bootstrap";

// Shared shell for Login / Register pages — EV Hub style.
// (Component name and props are unchanged so existing pages keep working.
//  `accent`, `scene`, `carOrigin` and `stationCaption` are accepted for
//  backwards compatibility; the new design uses one green accent.)
const DEFAULT_HIGHLIGHTS = [
  { title: "Find stations fast", desc: "Locate nearby charging points in seconds, wherever you are." },
  { title: "Trade energy credits", desc: "Buy, sell, and exchange credits directly with verified suppliers." },
  { title: "Real-time updates", desc: "Live availability and pricing, powered by our supplier network." },
];

function LiquidGlassLayout({
  title,
  children,
  highlights = DEFAULT_HIGHLIGHTS,
  panelMaxWidth = 980,
}) {
  return (
    <>
      <style>{`
        html,body,#root{ min-height:100%; margin:0; }

        .auth-wrap{
          min-height: calc(100vh - 160px);
          display:flex; align-items:center; justify-content:center;
          padding: 24px 0 40px;
        }
        .auth-shell{
          display:grid;
          grid-template-columns: 1.1fr 0.9fr;
          background: var(--cg-panel);
          border: 1px solid var(--cg-line);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 30px 80px rgba(0,0,0,.55);
          animation: authIn .5s cubic-bezier(.22,1,.36,1) both;
        }
        @keyframes authIn{ from{opacity:0; transform:translateY(14px);} to{opacity:1; transform:none;} }

        .auth-form-col{ padding: 44px 44px 40px; }
        .glass-eyebrow-chip{
          display:inline-flex; align-items:center; gap:8px;
          padding:6px 14px; margin-bottom:18px;
          border-radius:999px; font-size:11px; font-weight:700;
          letter-spacing:1.5px; text-transform:uppercase;
          color: var(--cg-green); background: var(--cg-green-soft);
        }
        .glass-eyebrow-chip::before{
          content:""; width:7px; height:7px; border-radius:50%;
          background: var(--cg-green); box-shadow:0 0 8px 2px rgba(52,224,161,.6);
        }
        .glass-title{ color:var(--cg-text); font-weight:600; font-size:28px; margin-bottom:6px; }
        .glass-subtitle{ color:var(--cg-muted); font-size:14px; margin-bottom:26px; }

        .glass-field-label{
          font-size:10px; letter-spacing:.9px; text-transform:uppercase;
          color:var(--cg-muted); font-weight:600; margin-bottom:7px;
        }
        .glass-input{
          background: var(--cg-bg) !important;
          border:1px solid var(--cg-line) !important;
          color: var(--cg-text) !important;
          border-radius:10px !important;
          padding:12px 14px !important;
          font-size:14px !important;
          transition: border-color .15s ease, box-shadow .15s ease;
        }
        .glass-input::placeholder{ color:#5f6764 !important; }
        .glass-input:focus{
          border-color: var(--cg-green) !important;
          box-shadow: 0 0 0 3px var(--cg-green-soft) !important;
        }
        .glass-input option{ background: var(--cg-card) !important; color: var(--cg-text) !important; }
        .glass-check{ background: var(--cg-bg) !important; border:1px solid var(--cg-line) !important; }
        .glass-check:checked{ background-color: var(--cg-green) !important; border-color: var(--cg-green) !important; }

        .glass-btn{
          width:100%; border:0 !important; border-radius:10px !important;
          padding:13px 24px !important; font-weight:700 !important; font-size:14px !important;
          color:#04251a !important; background: var(--cg-green) !important;
          transition: background .15s ease, transform .15s ease;
        }
        .glass-btn:hover{ background:#5df0b8 !important; transform:translateY(-1px); }
        .glass-btn:active{ transform:scale(.99); }

        /* right-hand info panel */
        .auth-side{
          position:relative; padding:44px 38px;
          background: var(--cg-side);
          border-left:1px solid var(--cg-line);
          display:flex; flex-direction:column; justify-content:center;
          overflow:hidden;
        }
        .auth-side::before{
          content:""; position:absolute; right:-80px; top:-80px; width:260px; height:260px;
          border-radius:50%; background: radial-gradient(circle, rgba(52,224,161,.22), transparent 70%);
          pointer-events:none;
        }
        .auth-logo{ display:flex; align-items:center; gap:10px; font-size:22px; font-weight:700; color:var(--cg-text); margin-bottom:28px; }
        .auth-logo svg{ width:26px; height:30px; }
        .auth-logo b{ color:var(--cg-green); }
        .auth-side-heading{ font-size:20px; font-weight:600; line-height:1.4; color:var(--cg-text); margin-bottom:24px; }
        .auth-hl{ display:flex; gap:14px; align-items:flex-start; background:var(--cg-card); border-radius:14px; padding:14px; margin-bottom:12px; }
        .auth-hl-ico{
          flex-shrink:0; width:30px; height:30px; border-radius:9px;
          background: var(--cg-green-soft); color: var(--cg-green);
          display:grid; place-items:center; font-size:14px; font-weight:700;
        }
        .auth-hl-title{ font-size:14px; font-weight:600; color:var(--cg-text); margin-bottom:3px; }
        .auth-hl-desc{ font-size:12.5px; line-height:1.55; color:var(--cg-muted); }

        @media (max-width: 860px){
          .auth-shell{ grid-template-columns: 1fr; }
          .auth-side{ display:none; }
          .auth-form-col{ padding:32px 24px; }
        }
      `}</style>

      <div className="auth-wrap">
        <Container style={{ maxWidth: panelMaxWidth }}>
          <div className="auth-shell">
            <div className="auth-form-col">
              <div className="glass-eyebrow-chip">Coolgrid EV</div>
              <h2 className="glass-title">{title}</h2>
              <div>{children}</div>
            </div>

            <div className="auth-side">
              <div className="auth-logo">
                <svg viewBox="0 0 30 34"><path d="M17 1 3 19h9l-3 14L27 14h-9z" fill="#34e0a1" /></svg>
                <span>Cool<b>grid</b></span>
              </div>
              <div className="auth-side-heading">
                Charging &amp; credit exchange, built for a connected grid.
              </div>
              {highlights.map((h, i) => (
                <div className="auth-hl" key={i}>
                  <div className="auth-hl-ico">{i + 1}</div>
                  <div>
                    <div className="auth-hl-title">{h.title}</div>
                    <div className="auth-hl-desc">{h.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </div>
    </>
  );
}

export default LiquidGlassLayout;

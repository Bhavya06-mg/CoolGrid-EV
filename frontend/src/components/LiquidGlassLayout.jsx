import React from "react";
import { Container } from "react-bootstrap";

const DEFAULT_HIGHLIGHTS = [
  { title: "Find stations fast", desc: "Locate nearby charging points in seconds, wherever you are." },
  { title: "Trade energy credits", desc: "Buy, sell, and exchange credits directly with verified suppliers." },
  { title: "Real-time updates", desc: "Live availability and pricing, powered by our supplier network." },
];

function LiquidGlassLayout({
  title,
  children,
  accent = "blue",       // "blue" | "green" | "amber"
  highlights = DEFAULT_HIGHLIGHTS,
  panelMaxWidth = 980,
  scene = null,           // null | "customer" | "supplier"
  carOrigin = "offscreen", // "offscreen" | "station" (only affects "customer" scene)
  stationCaption = null,   // optional text shown above the station icon
}) {
  const accentMap = {
    blue: { c1: "#38bdf8", c2: "#3b82f6", text: "#7dd3fc", chipBg: "rgba(56,189,248,.12)", chipBorder: "rgba(125,211,252,.3)", ring: "rgba(56,189,248,.18)" },
    green: { c1: "#4ade80", c2: "#22c55e", text: "#6ee7b7", chipBg: "rgba(52,211,153,.12)", chipBorder: "rgba(110,231,183,.3)", ring: "rgba(52,211,153,.18)" },
    amber: { c1: "#f59e0b", c2: "#d97706", text: "#fbbf8f", chipBg: "rgba(201,121,61,.15)", chipBorder: "rgba(251,191,143,.3)", ring: "rgba(201,121,61,.18)" },
  };
  const a = accentMap[accent] || accentMap.blue;

  return (
    <>
      <style>{`
        html,body,#root{ height:100%; margin:0; }

        @keyframes float1{ 0%,100%{transform:translate(0,0) scale(1);} 50%{transform:translate(35px,-45px) scale(1.08);} }
        @keyframes float2{ 0%,100%{transform:translate(0,0) scale(1);} 50%{transform:translate(-40px,30px) scale(1.12);} }
        @keyframes float3{ 0%,100%{transform:translate(0,0) scale(1);} 50%{transform:translate(25px,40px) scale(.95);} }

        @keyframes slideFadeIn{
          from{ opacity:0; transform: translateX(24px); }
          to{ opacity:1; transform: translateX(0); }
        }
        .glass-anim{
          opacity:0;
          animation: slideFadeIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        @keyframes fadeInUp{
          from{ opacity:0; transform: translateY(14px); }
          to{ opacity:1; transform: translateY(0); }
        }
        .glass-form-anim{
          opacity:0;
          animation: fadeInUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        .glass-grow{
          transition: transform 0.25s ease;
        }
        .glass-grow:hover{
          transform: scale(1.03);
        }

        .glass-panel{
          position:relative;
          overflow:hidden;
          background:rgba(255,255,255,.06);
          backdrop-filter:blur(24px);
          -webkit-backdrop-filter:blur(24px);
          border:1px solid rgba(255,255,255,.18);
          border-radius:30px;
          box-shadow:0 10px 45px rgba(0,0,0,.45), inset 0 1px rgba(255,255,255,.15);
          display:grid;
          grid-template-columns: 1.15fr 0.85fr;
          min-height: 560px;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .glass-panel:hover{
          transform: scale(1.01);
          box-shadow:
            0 10px 45px rgba(0,0,0,.45),
            inset 0 1px rgba(255,255,255,.15),
            0 0 0 1px ${a.c1}55,
            0 0 40px 4px ${a.c1}40;
        }
        @media (max-width: 860px){
          .glass-panel{ grid-template-columns: 1fr; }
          .glass-side{ display:none; }
        }

        .glass-form-col{
          position:relative;
          z-index:1;
          padding:50px 48px;
        }

        .glass-side{
          position:relative;
          z-index:1;
          padding:50px 40px;
          background:linear-gradient(160deg, rgba(255,255,255,0.05), rgba(255,255,255,0.015));
          border-left:1px solid rgba(255,255,255,0.1);
          display:flex;
          flex-direction:column;
          justify-content:center;
        }
        .glass-side::before{
          content:"";
          position:absolute;
          top:-60px; right:-60px;
          width:220px; height:220px;
          border-radius:50%;
          background:radial-gradient(circle, ${a.c1}55, transparent 70%);
          filter:blur(10px);
          pointer-events:none;
        }
        .glass-side-eyebrow{
          font-size:13px; letterSpacing:2px; text-transform:uppercase;
          color:${a.text}; font-weight:700; margin-bottom:14px;
          letter-spacing:2px;
        }
        .glass-side-heading{
          font-size:24px; font-weight:600; color:#f3f6fb;
          margin-bottom:26px; line-height:1.4;
        }
        .glass-highlight{
          display:flex; gap:12px; margin-bottom:22px;
        }
        .glass-highlight-dot{
          flex-shrink:0;
          width:8px; height:8px; margin-top:7px;
          border-radius:50%;
          background:linear-gradient(180deg, ${a.c1}, ${a.c2});
          box-shadow:0 0 8px 1px ${a.c1}88;
        }
        .glass-highlight-title{
          font-size:16px; font-weight:600; color:#f3f6fb; margin-bottom:4px;
        }
        .glass-highlight-desc{
          font-size:14px; line-height:1.6; color:rgba(230,235,244,0.72);
        }

        .glass-eyebrow-chip{
          display:inline-block; padding:5px 14px; margin-bottom:18px;
          border-radius:999px; color:${a.text};
          border:1px solid ${a.chipBorder}; background:${a.chipBg};
          letter-spacing:2px; font-size:13px; text-transform:uppercase; font-weight:600;
        }
        .glass-title{
          color:#f3f6fb; margin-bottom:8px; font-weight:600; font-size:28px;
        }
        .glass-subtitle{
          color:rgba(230,235,244,0.7); font-size:15px; margin-bottom:26px;
        }

        .glass-input{
          background:rgba(255,255,255,.05) !important;
          border:1px solid rgba(255,255,255,.15) !important;
          color:#f3f6fb !important;
          border-radius:10px !important;
          padding:12px 14px !important;
          font-size:15px !important;
          backdrop-filter:blur(4px);
          transition: transform 0.25s ease;
        }
        .glass-input:hover{
          transform: scale(1.02);
        }
        .glass-input::placeholder{ color:rgba(230,235,244,.45); }
        .glass-input:focus{
          background:rgba(255,255,255,.07) !important;
          border-color:${a.c1}88 !important;
          box-shadow:0 0 0 3px ${a.ring} !important;
          color:#fff !important;
        }
        .glass-field-label{
          font-size:13px; letter-spacing:1px; text-transform:uppercase;
          color:${a.text}; font-weight:600; margin-bottom:7px;
        }
        .glass-check{
          background:rgba(255,255,255,.05) !important;
          border:1px solid rgba(255,255,255,.25) !important;
        }
        .glass-check:checked{
          background-color:${a.c1} !important;
          border-color:${a.c1} !important;
        }

        .glass-btn{
          border:none; width:100%;
          padding:13px 36px;
          border-radius:999px;
          font-weight:600;
          color:#fff;
          background:linear-gradient(180deg, ${a.c1}eb, ${a.c2}cc);
          box-shadow:0 8px 25px ${a.c1}55, inset 0 1px rgba(255,255,255,.5);
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .glass-btn:hover{
          transform: scale(1.03);
          box-shadow:0 12px 35px ${a.c1}70, inset 0 1px rgba(255,255,255,.6);
        }
        .glass-btn:active{ transform:scale(.98); }

        /* ---------- Road scene ---------- */
        .scene-layer{
          position:absolute;
          inset:0;
          z-index:0;
          pointer-events:none;
          overflow:visible;
        }
        .scene-road{
          position:absolute;
          top:50%;
          left:0%;
          right:0%;
          height:2px;
          transform:translateY(-50%);
          background:repeating-linear-gradient(
            90deg,
            rgba(255,255,255,0.35) 0px,
            rgba(255,255,255,0.35) 14px,
            transparent 14px,
            transparent 28px
          );
          opacity:0.5;
        }
        .scene-icon{
          position:absolute;
          top:50%;
          width:66px; height:66px;
          border-radius:18px;
          display:flex;
          align-items:center;
          justify-content:center;
          font-size:32px;
          background:linear-gradient(160deg, rgba(255,255,255,0.12), rgba(255,255,255,0.03));
          border:1px solid rgba(255,255,255,0.25);
          backdrop-filter:blur(6px);
          box-shadow:0 6px 18px rgba(0,0,0,0.35);
        }
        .scene-icon-static{
          transform:translate(-50%,-50%);
        }
        .scene-station{
          left:1%;
          box-shadow:0 6px 18px rgba(0,0,0,0.35), 0 0 22px 2px ${a.c1}55;
          border-color:${a.c1}77;
        }
        .scene-slot{
          right:1%;
          box-shadow:0 6px 18px rgba(0,0,0,0.35), 0 0 22px 2px ${a.c1}55;
          border-color:${a.c1}77;
        }

        .scene-badge{
          position:absolute;
          top:50%;
          transform:translate(-50%,-230%);
          white-space:nowrap;
          font-size:12px;
          font-weight:700;
          letter-spacing:0.5px;
          color:${a.text};
          background:rgba(10,14,20,0.75);
          border:1px solid ${a.chipBorder};
          padding:6px 12px;
          border-radius:999px;
          box-shadow:0 4px 14px rgba(0,0,0,0.35);
        }

        /* Customer journey: car travels, vanishes into panel, re-emerges with a booked badge */
        @keyframes carDriveCustomer{
          0%   { left:-10%; opacity:0; }
          6%   { left:-2%;  opacity:1; }
          40%  { left:46%;  opacity:1; }
          46%  { left:50%;  opacity:0; }
          58%  { left:56%;  opacity:0; }
          64%  { left:58%;  opacity:1; }
          92%  { left:98%;  opacity:1; }
          98%  { left:106%; opacity:0; }
          100% { left:-10%; opacity:0; }
        }
        @keyframes badgeCustomer{
          0%, 58%   { opacity:0; transform:translate(-50%,-210%) scale(0.85); }
          64%, 88%  { opacity:1; transform:translate(-50%,-230%) scale(1); }
          96%,100%  { opacity:0; transform:translate(-50%,-210%) scale(0.85); }
        }
        .scene-car-customer{
          animation: carDriveCustomer 9s linear infinite;
        }
        .scene-badge-customer{
          left:58%;
          animation: badgeCustomer 9s linear infinite;
        }

        /* Supplier journey: request car vanishes into panel, then re-emerges heading toward the (always-visible) EV site */
        @keyframes carDriveSupplier{
          0%   { left:-10%; opacity:0; }
          6%   { left:-2%;  opacity:1; }
          40%  { left:46%;  opacity:1; }
          46%  { left:50%;  opacity:0; }
          58%  { left:56%;  opacity:0; }
          64%  { left:60%;  opacity:1; }
          90%  { left:94%;  opacity:1; }
          96%  { left:97%;  opacity:0; }
          100% { left:-10%; opacity:0; }
        }
        .scene-car-supplier{
          animation: carDriveSupplier 9s linear infinite;
        }

        /* Caption above the EV site: swaps message depending on the car's phase */
        .scene-slot-caption{
          position:absolute;
          right:1%;
          top:50%;
          white-space:nowrap;
          font-size:12px;
          font-weight:700;
          letter-spacing:0.5px;
          color:${a.text};
          background:rgba(10,14,20,0.75);
          border:1px solid ${a.chipBorder};
          padding:6px 12px;
          border-radius:999px;
          box-shadow:0 4px 14px rgba(0,0,0,0.35);
        }
        @keyframes captionArrived{
          0%, 43%   { opacity:0; transform:translate(70%,-200%); }
         
          48%, 60%  { opacity:1; transform:translate(50%,-320%); }
          64%,100%  { opacity:0; transform:translate(50%,-300%); }
        }
        @keyframes captionAccepted{
          0%, 62%   { opacity:0; transform:translate(50%,-300%); }
          66%, 90%  { opacity:1; transform:translate(50%,-320%); }
          94%,100%  { opacity:0; transform:translate(50%,-300%); }
        }
        .scene-caption-arrived{
          animation: captionArrived 9s linear infinite;
        }
        .scene-caption-accepted{
          animation: captionAccepted 9s linear infinite;
        }

        /* Customer journey (variant): car originates from the station icon itself, not off-screen */
        @keyframes carDriveFromStation{
          0%   { left:1%;  opacity:0; }
          4%   { left:3%;  opacity:1; }
          40%  { left:46%; opacity:1; }
          46%  { left:50%; opacity:0; }
          58%  { left:56%; opacity:0; }
          64%  { left:58%; opacity:1; }
          92%  { left:98%; opacity:1; }
          98%  { left:106%; opacity:0; }
          100% { left:1%;  opacity:0; }
        }
        .scene-car-from-station{
          animation: carDriveFromStation 9s linear infinite;
        }

        .scene-station-caption{
          position:absolute;
          left:1%;
          top:50%;
          transform:translate(0,-320%);
          white-space:nowrap;
          font-size:12px;
          font-weight:700;
          letter-spacing:0.5px;
          color:${a.text};
          background:rgba(10,14,20,0.75);
          border:1px solid ${a.chipBorder};
          padding:6px 12px;
          border-radius:999px;
          box-shadow:0 4px 14px rgba(0,0,0,0.35);
        }
        @keyframes captionPulse{
          0%, 40%   { opacity:0; transform:translate(0,-300%); }
          46%, 92%  { opacity:1; transform:translate(0,-320%); }
          98%,100%  { opacity:0; transform:translate(0,-300%); }
        }
        .scene-station-caption-animated{
          animation: captionPulse 9s linear infinite;
        }

        @media (max-width: 860px){
          .scene-layer{ display:none; }
        }
      `}</style>

      {/* Background */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          overflow: "hidden",
          background: "linear-gradient(160deg,#0b1220 0%,#10192e 45%,#0a1420 100%)",
          zIndex: -1,
        }}
      >
        <div style={{ position: "absolute", width: 420, height: 420, borderRadius: "50%", top: "-8%", left: "-6%", background: "radial-gradient(circle,#38bdf8,transparent 70%)", filter: "blur(70px)", opacity: .55, animation: "float1 14s ease-in-out infinite" }} />
        <div style={{ position: "absolute", width: 380, height: 380, borderRadius: "50%", bottom: "-10%", right: "-8%", background: "radial-gradient(circle,#34d399,transparent 70%)", filter: "blur(70px)", opacity: .55, animation: "float2 16s ease-in-out infinite" }} />
        <div style={{ position: "absolute", width: 300, height: 300, borderRadius: "50%", top: "35%", right: "18%", background: "radial-gradient(circle,#a78bfa,transparent 70%)", filter: "blur(70px)", opacity: .55, animation: "float3 12s ease-in-out infinite" }} />
      </div>

      {/* Content */}
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "40px 20px",
          position: "relative",
        }}
      >
        {scene === "customer" && (
          <div className="scene-layer">
            <div className="scene-road" />
            <div className="scene-icon scene-icon-static scene-station" title="EV slot booking site">
              🔌
            </div>
            {stationCaption && (
              <div className="scene-station-caption scene-station-caption-animated">
                {stationCaption}
              </div>
            )}
            <div
              className={`scene-icon ${carOrigin === "station" ? "scene-car-from-station" : "scene-car-customer"}`}
              style={{ transform: "translateY(-50%) scaleX(-1)" }}
            >
              🚗
            </div>
            <div className="scene-badge scene-badge-customer">Slot Booked ✓</div>
          </div>
        )}

        {scene === "supplier" && (
          <div className="scene-layer">
            <div className="scene-road" />
            <div className="scene-icon scene-car-supplier" style={{ transform: "translateY(-50%) scaleX(-1)" }}>
              🚗
            </div>
            <div className="scene-icon scene-icon-static scene-slot" title="EV site">
              ⚡
            </div>
            <div className="scene-slot-caption scene-caption-arrived">Request arrived at the EV site</div>
            <div className="scene-slot-caption scene-caption-accepted">Request accepted ✓</div>
          </div>
        )}

        <Container style={{ maxWidth: panelMaxWidth, position: "relative", zIndex: 1 }}>
          <div className="glass-panel">
            <div className="glass-form-col">
              <div className="glass-eyebrow-chip glass-form-anim" style={{ animationDelay: "0s" }}>
                Coolgrid EV
              </div>
              <h2 className="glass-title glass-form-anim" style={{ animationDelay: "0.06s" }}>
                {title}
              </h2>
              <div className="glass-form-anim" style={{ animationDelay: "0.12s" }}>
                {children}
              </div>
            </div>

            <div className="glass-side">
              <div className="glass-side-eyebrow glass-anim" style={{ animationDelay: "0.05s" }}>
                Why Coolgrid EV
              </div>
              <div className="glass-side-heading glass-anim" style={{ animationDelay: "0.15s" }}>
                Charging &amp; credit exchange, built for a connected grid.
              </div>
              {highlights.map((h, i) => (
                <div
                  className="glass-highlight glass-anim glass-grow"
                  key={i}
                  style={{ animationDelay: `${0.25 + i * 0.12}s` }}
                >
                  <span className="glass-highlight-dot" />
                  <div>
                    <div className="glass-highlight-title">{h.title}</div>
                    <div className="glass-highlight-desc">{h.desc}</div>
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
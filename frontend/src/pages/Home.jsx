import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  // Logged-in users go straight to their dashboard (typed URL, bookmark, back button).
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (token) {
      navigate(role === "SUPPLIER" ? "/dashboard/supplier" : "/dashboard/customer", {
        replace: true,
      });
    }
  }, [navigate]);

  return (
    <>
      <style>{`
        .home-wrap { min-height: calc(100vh - 180px); display:flex; align-items:center; justify-content:center; padding: 24px 0 40px; }
        .home-shell {
          width: 100%; max-width: 1100px;
          background: var(--cg-panel); border: 1px solid var(--cg-line);
          border-radius: 22px; overflow: hidden;
          display: grid; grid-template-columns: 1.05fr 0.95fr;
          box-shadow: 0 30px 80px rgba(0,0,0,.55);
          animation: homeIn .55s cubic-bezier(.22,1,.36,1) both;
        }
        @keyframes homeIn { from{opacity:0; transform:translateY(16px);} to{opacity:1; transform:none;} }

        .home-copy { padding: 64px 52px; display:flex; flex-direction:column; justify-content:center; }
        .home-chip {
          align-self:flex-start; display:inline-flex; align-items:center; gap:8px;
          padding:6px 14px; border-radius:999px; margin-bottom:22px;
          font-size:11px; font-weight:700; letter-spacing:1.6px; text-transform:uppercase;
          color: var(--cg-green); background: var(--cg-green-soft);
        }
        .home-chip::before { content:""; width:7px; height:7px; border-radius:50%; background:var(--cg-green); box-shadow:0 0 8px 2px rgba(52,224,161,.6); }
        .home-h1 { font-size: clamp(30px, 4vw, 44px); line-height:1.18; letter-spacing:-0.6px; margin-bottom:18px; }
        .home-h1 span { color: var(--cg-green); }
        .home-sub { color: var(--cg-muted); font-size:16px; line-height:1.7; max-width:480px; margin-bottom:32px; }
        .home-cta { display:flex; gap:12px; flex-wrap:wrap; }
        .home-cta a { text-decoration:none; }
        .home-cta .cg-btn, .home-cta .cg-btn-ghost { padding: 13px 30px; font-size:15px; display:inline-block; }

        /* decorative dashboard preview */
        .home-art { background: var(--cg-side); border-left:1px solid var(--cg-line); padding:34px; display:flex; flex-direction:column; gap:14px; justify-content:center; position:relative; overflow:hidden; }
        .home-art::before { content:""; position:absolute; right:-90px; top:-90px; width:280px; height:280px; border-radius:50%; background: radial-gradient(circle, rgba(52,224,161,.2), transparent 70%); }
        .home-map { position:relative; height:190px; border-radius:14px; overflow:hidden; background:#1a1b1c; }
        .home-map svg { width:100%; height:100%; display:block; }
        .home-cards { display:grid; grid-template-columns:1fr 1fr; gap:12px; position:relative; }
        .home-mini { background: var(--cg-card); border:1px solid transparent; border-radius:14px; padding:14px; }
        .home-mini.sel { border-color: var(--cg-green); box-shadow: 0 0 0 1px rgba(52,224,161,.25); }
        .home-mini small { color: var(--cg-muted); font-size:10px; display:block; }
        .home-mini b { font-size:18px; font-weight:500; display:block; margin:4px 0 8px; }
        .home-mini span { font-size:12px; color: var(--cg-green); }

        @media (max-width: 900px) {
          .home-shell { grid-template-columns: 1fr; }
          .home-art { display:none; }
          .home-copy { padding: 40px 26px; }
        }
      `}</style>

      <div className="home-wrap">
        <div className="home-shell">
          <div className="home-copy">
            <div className="home-chip">Coolgrid EV</div>
            <h1 className="home-h1">
              Charging &amp; credit exchange,<br /><span>reimagined</span>
            </h1>
            <p className="home-sub">
              Find nearby charging stations, connect with suppliers, and exchange
              energy credits — all in one place.
            </p>
            <div className="home-cta">
              <Link to="/login"><button className="cg-btn">Get started</button></Link>
              <Link to="/register/customer"><button className="cg-btn-ghost">Create account</button></Link>
            </div>
          </div>

          <div className="home-art" aria-hidden="true">
            <div className="home-map">
              <svg viewBox="0 0 400 190" preserveAspectRatio="xMidYMid slice">
                <rect width="400" height="190" fill="#1a1b1c" />
                <g stroke="#2a2c2d" strokeWidth="8" fill="none">
                  <path d="M0 40H400M0 100H400M0 160H400M60 0V190M170 0V190M290 0V190" />
                </g>
                <path d="M30 30 L170 70 L190 150 L350 125" stroke="#34e0a1" strokeWidth="3.5" fill="none" strokeLinejoin="round" strokeLinecap="round" />
                <circle cx="30" cy="30" r="6" fill="#34e0a1" stroke="#0b0b0c" strokeWidth="2" />
                {[[170, 70], [350, 125]].map(([x, y]) => (
                  <g key={x} transform={`translate(${x},${y})`}>
                    <path d="M0 0c-11-14-14-19-14-25a14 14 0 1 1 28 0c0 6-3 11-14 25z" fill="#34e0a1" stroke="#0b0b0c" strokeWidth="1.5" />
                    <path d="M2-31l-6 10h4l-1 8 6-10h-4z" fill="#04251a" />
                  </g>
                ))}
              </svg>
            </div>
            <div className="home-cards">
              <div className="home-mini sel"><small>Nearest station</small><b>0.9 km</b><span>₹99 / unit</span></div>
              <div className="home-mini"><small>Units available</small><b>721</b><span>Online now</span></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;

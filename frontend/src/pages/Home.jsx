import React, { useRef } from "react";
import { Container, Button } from "react-bootstrap";
import { Link } from "react-router-dom";

function Home() {
  const panelRef = useRef(null);
  const bgRef = useRef(null);

  const handlePanelMouseMove = (e) => {
    const panel = panelRef.current;
    if (!panel) return;
    const rect = panel.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    panel.style.setProperty("--mx", `${x}%`);
    panel.style.setProperty("--my", `${y}%`);
  };

  const handlePanelMouseLeave = () => {
    const panel = panelRef.current;
    if (!panel) return;
    panel.style.setProperty("--mx", `50%`);
    panel.style.setProperty("--my", `50%`);
  };

  const handlePageMouseMove = (e) => {
    const bg = bgRef.current;
    if (!bg) return;
    const x = (e.clientX / window.innerWidth) * 100;
    const y = (e.clientY / window.innerHeight) * 100;
    bg.style.setProperty("--bgx", `${x}%`);
    bg.style.setProperty("--bgy", `${y}%`);
  };

  return (
    <>
      <style>{`
        html, body, #root {
          height: 100%;
          margin: 0;
        }
        @keyframes float1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, -40px) scale(1.08); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-40px, 30px) scale(1.1); }
        }
        @keyframes float3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, 40px) scale(0.95); }
        }
        .glass-cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(56, 189, 248, 0.45), inset 0 1px 0 rgba(255,255,255,0.6);
        }
        .glass-cta:active {
          transform: translateY(0px) scale(0.98);
        }
        .glass-panel-tracked {
          --mx: 50%;
          --my: 50%;
        }
        .glass-panel-tracked::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(
            380px circle at var(--mx) var(--my),
            rgba(255, 255, 255, 0.14),
            rgba(255, 255, 255, 0.05) 35%,
            transparent 65%
          );
          transition: opacity 0.25s ease;
          pointer-events: none;
        }
        .glass-panel-tracked::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          box-shadow: inset 0 0 0 1px transparent;
          background: radial-gradient(
            600px circle at var(--mx) var(--my),
            rgba(125, 211, 252, 0.10),
            transparent 60%
          );
          pointer-events: none;
        }
        .bg-tracked {
          --bgx: 50%;
          --bgy: 50%;
        }
        .bg-tracked::after {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(
            700px circle at var(--bgx) var(--bgy),
            rgba(125, 211, 252, 0.10),
            rgba(52, 211, 153, 0.05) 40%,
            transparent 70%
          );
          transition: opacity 0.3s ease;
          pointer-events: none;
        }
      `}</style>

      <div
        ref={bgRef}
        className="bg-tracked"
        style={styles.bgLayer}
        onMouseMove={handlePageMouseMove}
      >
        <div style={{ ...styles.blob, ...styles.blobA }} />
        <div style={{ ...styles.blob, ...styles.blobB }} />
        <div style={{ ...styles.blob, ...styles.blobC }} />
      </div>

      <div style={styles.contentLayer} onMouseMove={handlePageMouseMove}>
        <Container className="text-center" style={styles.container}>
          <div
            ref={panelRef}
            className="glass-panel-tracked"
            style={styles.glassPanel}
            onMouseMove={handlePanelMouseMove}
            onMouseLeave={handlePanelMouseLeave}
          >
            <div style={styles.specular} />

            <div style={styles.eyebrow}>Coolgrid EV</div>

            <h1 style={styles.heading}>
              Charging &amp; Credit Exchange,<br />reimagined
            </h1>

            <p style={styles.subtext}>
              Find nearby charging stations, connect with suppliers, and
              exchange energy credits — all in one place.
            </p>

            <Link to="/login" style={{ textDecoration: "none" }}>
              <Button className="glass-cta" style={styles.ctaButton}>
                Get started
              </Button>
            </Link>
          </div>
        </Container>
      </div>
    </>
  );
}

const styles = {
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
  contentLayer: {
    minHeight: "100vh",
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  blob: {
    position: "absolute",
    borderRadius: "50%",
    filter: "blur(70px)",
    opacity: 0.55,
    pointerEvents: "none",
  },
  blobA: {
    width: 420,
    height: 420,
    top: "-8%",
    left: "-6%",
    background: "radial-gradient(circle, #38bdf8, transparent 70%)",
    animation: "float1 14s ease-in-out infinite",
  },
  blobB: {
    width: 380,
    height: 380,
    bottom: "-10%",
    right: "-8%",
    background: "radial-gradient(circle, #34d399, transparent 70%)",
    animation: "float2 16s ease-in-out infinite",
  },
  blobC: {
    width: 300,
    height: 300,
    top: "35%",
    right: "18%",
    background: "radial-gradient(circle, #a78bfa, transparent 70%)",
    animation: "float3 12s ease-in-out infinite",
  },
  container: {
    position: "relative",
    zIndex: 2,
    maxWidth: 820,
  },
  glassPanel: {
    position: "relative",
    padding: "68px 64px",
    borderRadius: 32,
    background: "rgba(255, 255, 255, 0.06)",
    backdropFilter: "blur(24px)",
    WebkitBackdropFilter: "blur(24px)",
    border: "1px solid rgba(255, 255, 255, 0.16)",
    boxShadow:
      "0 8px 40px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
    overflow: "hidden",
  },
  specular: {
    position: "absolute",
    top: 0,
    left: "10%",
    right: "10%",
    height: 1,
    background:
      "linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)",
  },
  eyebrow: {
    display: "inline-block",
    fontSize: 12,
    letterSpacing: 3,
    textTransform: "uppercase",
    color: "#7dd3fc",
    fontWeight: 600,
    marginBottom: 18,
    padding: "5px 14px",
    borderRadius: 999,
    background: "rgba(56, 189, 248, 0.12)",
    border: "1px solid rgba(125, 211, 252, 0.3)",
  },
  heading: {
    fontSize: "clamp(32px, 4.5vw, 46px)",
    fontWeight: 600,
    color: "#f3f6fb",
    lineHeight: 1.25,
    marginBottom: 20,
    letterSpacing: "-0.5px",
  },
  subtext: {
    fontSize: 17,
    lineHeight: 1.7,
    color: "rgba(230, 235, 244, 0.7)",
    maxWidth: 540,
    margin: "0 auto 38px",
  },
  ctaButton: {
    border: "1px solid rgba(255,255,255,0.35)",
    background:
      "linear-gradient(180deg, rgba(56,189,248,0.85), rgba(59,130,246,0.75))",
    color: "#fff",
    fontWeight: 600,
    fontSize: 16,
    padding: "14px 40px",
    borderRadius: 999,
    boxShadow:
      "0 6px 20px rgba(56, 189, 248, 0.35), inset 0 1px 0 rgba(255,255,255,0.5)",
    transition: "transform 0.15s ease, box-shadow 0.15s ease",
  },
};

export default Home;
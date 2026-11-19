import React, { useEffect, useState } from "react";
import { Navbar, Nav, Container } from "react-bootstrap";
import { Link, useNavigate, useLocation } from "react-router-dom";
import ProfileSlidePanel from "./ProfileSlidePanel";

function NavigationBar() {
  const [showProfile, setShowProfile] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [role, setRole] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Re-check auth on mount AND on every route change.
  // Why: localStorage's own "storage" event only fires in OTHER browser tabs,
  // never in the tab that made the change. Since login/logout both navigate to
  // a new route right after touching localStorage, keying off `location`
  // guarantees the navbar re-reads the token the moment the URL changes,
  // without needing a manual page refresh.
  useEffect(() => {
    setLoggedIn(!!localStorage.getItem("token"));
    setRole(localStorage.getItem("role"));
  }, [location]);

  // Still listen for cross-tab changes and a same-tab custom event, in case
  // auth state changes without a route change (e.g. token expiry handling).
  useEffect(() => {
    const syncAuth = () => {
      setLoggedIn(!!localStorage.getItem("token"));
      setRole(localStorage.getItem("role"));
    };
    window.addEventListener("storage", syncAuth);
    window.addEventListener("authChange", syncAuth);
    return () => {
      window.removeEventListener("storage", syncAuth);
      window.removeEventListener("authChange", syncAuth);
    };
  }, []);

  // Logged-in users should land on their dashboard, not the public landing page.
  const homeHref = loggedIn
    ? role === "SUPPLIER"
      ? "/dashboard/supplier"
      : "/dashboard/customer"
    : "/";

  const handleLogout = () => {
    localStorage.clear();
    setLoggedIn(false);
    setRole(null);
    window.dispatchEvent(new Event("authChange"));
    navigate("/login");
  };

  return (
    <>
      <style>{`
        .glass-navbar {
          background: var(--cg-side) !important;
          border-bottom: 1px solid var(--cg-line);
          position: sticky;
          top: 0;
          z-index: 50;
        }
        .glass-nav-link {
          position: relative;
          color: var(--cg-muted) !important;
          font-size: 0.92rem;
          padding: 8px 14px !important;
          border-radius: 10px;
          transition: color 0.15s ease, background 0.15s ease;
          cursor: pointer;
        }
        .glass-nav-link:hover {
          color: var(--cg-text) !important;
          background: var(--cg-card);
        }
        .glass-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          color: var(--cg-text) !important;
          font-weight: 700;
          font-size: 1.35rem;
          letter-spacing: -0.2px;
        }
        .glass-brand svg { width: 22px; height: 26px; }
        .glass-brand b { color: var(--cg-green); font-weight: 700; }
        .glass-toggle {
          border-color: var(--cg-line) !important;
          background: var(--cg-card) !important;
        }
        .glass-toggle .navbar-toggler-icon { filter: invert(1); }
      `}</style>

      <Navbar expand="lg" className="glass-navbar py-3">
        <Container fluid className="px-4">
          <Navbar.Brand as={Link} to={homeHref} className="glass-brand">
            <svg viewBox="0 0 30 34" aria-hidden="true">
              <path d="M17 1 3 19h9l-3 14L27 14h-9z" fill="#34e0a1" />
            </svg>
            <span>Cool<b>grid</b></span>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="nav" className="glass-toggle" />
          <Navbar.Collapse id="nav">
            <Nav
              className="ms-auto align-items-center gap-2"
              style={{ fontSize: "1.02rem" }}
            >
              {!loggedIn ? (
                <>
                  <Nav.Link as={Link} to={homeHref} className="glass-nav-link">
                    Home
                  </Nav.Link>
                  <Nav.Link as={Link} to="/login" className="glass-nav-link">
                    Login
                  </Nav.Link>
                  <Nav.Link as={Link} to="/register/customer" className="glass-nav-link">
                    Register Customer
                  </Nav.Link>
                  <Nav.Link as={Link} to="/register/supplier" className="glass-nav-link">
                    Register Supplier
                  </Nav.Link>
                </>
              ) : (
                <>
                  <Nav.Link as={Link} to={homeHref} className="glass-nav-link">
                    Home
                  </Nav.Link>
                  <Nav.Link
                    onClick={() => setShowProfile(true)}
                    className="glass-nav-link"
                  >
                    My profile
                  </Nav.Link>
                  <Nav.Link onClick={handleLogout} className="glass-nav-link">
                    Logout
                  </Nav.Link>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <ProfileSlidePanel show={showProfile} onClose={() => setShowProfile(false)} />
    </>
  );
}

export default NavigationBar;
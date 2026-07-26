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
          background: rgba(16, 25, 46, 0.55) !important;
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.12);
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255,255,255,0.06);
          position: sticky;
          top: 0;
          z-index: 50;
        }
        .glass-nav-link {
          position: relative;
          color: rgba(230, 235, 244, 0.75) !important;
          padding: 8px 14px !important;
          border-radius: 999px;
          transition: color 0.15s ease, background 0.15s ease;
        }
        .glass-nav-link:hover {
          color: #f3f6fb !important;
          background: rgba(255, 255, 255, 0.08);
        }
        .glass-brand {
          color: #f3f6fb !important;
          font-weight: 600;
          font-size: 1.4rem;
          letter-spacing: -0.3px;
        }
        .glass-brand::before {
          content: '';
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #4fd6a0;
          box-shadow: 0 0 8px 2px rgba(79, 214, 160, 0.6);
          margin-right: 10px;
          vertical-align: middle;
        }
        .glass-toggle {
          border-color: rgba(255,255,255,0.25) !important;
          background: rgba(255,255,255,0.06) !important;
        }
      `}</style>

      <Navbar expand="lg" className="glass-navbar py-3">
        <Container fluid className="px-4">
          <Navbar.Brand as={Link} to={homeHref} className="glass-brand">
            Coolgrid EV
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
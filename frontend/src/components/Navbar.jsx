import React, { useEffect, useState } from "react";
import { Navbar, Nav, Container } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import ProfileSlidePanel from "./ProfileSlidePanel";

function NavigationBar() {
  const [showProfile, setShowProfile] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const navigate = useNavigate();

  // 🔥 Check authentication on mount AND whenever localStorage changes
  useEffect(() => {
    const token = localStorage.getItem("token");
    setLoggedIn(!!token);
  }, []);

  // 🔥 Listen for login/logout changes globally
  useEffect(() => {
    const handleStorageChange = () => {
      setLoggedIn(!!localStorage.getItem("token"));
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setLoggedIn(false);
    navigate("/login");
  };

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand as={Link} to="/">Coolgrid EV</Navbar.Brand>
          <Navbar.Toggle aria-controls="nav" />
          <Navbar.Collapse id="nav">
            <Nav className="ms-auto">

              {!loggedIn ? (
                <>
                  <Nav.Link as={Link} to="/">Home</Nav.Link>
                  <Nav.Link as={Link} to="/login">Login</Nav.Link>
                  <Nav.Link as={Link} to="/register/customer">Register Customer</Nav.Link>
                  <Nav.Link as={Link} to="/register/supplier">Register Supplier</Nav.Link>
                </>
              ) : (
                <>
                  <Nav.Link as={Link} to="/">Home</Nav.Link>

                  <Nav.Link onClick={() => setShowProfile(true)}>
                    👤 My Profile
                  </Nav.Link>

                  <Nav.Link onClick={handleLogout}>
                    🚪 Logout
                  </Nav.Link>
                </>
              )}

            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Profile Sliding Panel */}
      <ProfileSlidePanel
        show={showProfile}
        onClose={() => setShowProfile(false)}
      />
    </>
  );
}

export default NavigationBar;

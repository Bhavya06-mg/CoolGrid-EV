import React from "react";
import { Container, Button } from "react-bootstrap";
import { Link } from "react-router-dom";

function Home() {
  return (
    <Container className="text-center mt-5">
      <h1>Welcome to Coolgrid EV Charging & Credit Exchange</h1>
      <p className="mt-3">
        Find nearby charging stations, connect with suppliers, and exchange energy credits.
      </p>
      <Link to="/login">
        <Button variant="primary" className="mt-3">Get Started</Button>
      </Link>
    </Container>
  );
}

export default Home;

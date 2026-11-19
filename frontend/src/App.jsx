import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Sidebar from "./components/Sidebar";
import BookingPage from "./pages/BookingPage";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import RegisterCustomer from "./pages/RegisterCustomer";
import RegisterSupplier from "./pages/RegisterSupplier";
import DashboardCustomer from "./pages/DashboardCustomer";
import DashboardSupplier from "./pages/DashboardSupplier";
import SupplierStatistics from "./pages/SupplierStatistics";
import SupplierRequestDetails from "./pages/SupplierRequestDetails";
import ProfileCustomer from "./pages/ProfileCustomer";
import ProfileSupplier from "./pages/ProfileSupplier";

const PUBLIC_PATHS = ["/", "/login", "/register/customer", "/register/supplier"];

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register/customer" element={<RegisterCustomer />} />
    <Route path="/register/supplier" element={<RegisterSupplier />} />
    <Route path="/dashboard/customer" element={<DashboardCustomer />} />
    <Route path="/dashboard/supplier" element={<DashboardSupplier />} />
    <Route path="/supplier/statistics" element={<SupplierStatistics />} />
    <Route path="/customer/booking/:supplierId" element={<BookingPage />} />
    <Route path="/supplier/request-details/:requestId" element={<SupplierRequestDetails />} />
    <Route path="/profile/customer" element={<ProfileCustomer />} />
    <Route path="/profile/supplier" element={<ProfileSupplier />} />
  </Routes>
);

// Signed-in pages get the left sidebar (nav, car, profile, logout).
// Public pages (home / login / register) keep the top navbar.
function Shell() {
  const { pathname } = useLocation();
  // read on every render (Shell re-renders on route change) so login/logout switch layouts instantly
  const loggedIn = !!localStorage.getItem("token");

  const useSidebar = loggedIn && !PUBLIC_PATHS.includes(pathname);

  if (useSidebar) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", background: "var(--cg-bg)" }} className="cg-app">
        <style>{`
          .cg-main { flex: 1; min-width: 0; padding: 22px 26px 40px; }
          @media (max-width: 900px) {
            .cg-app { flex-direction: column; }
            .cg-main { padding: 16px; }
          }
        `}</style>
        <Sidebar />
        <main className="cg-main">
          <AppRoutes />
        </main>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mt-4">
        <AppRoutes />
      </div>
      <Footer />
    </>
  );
}

function App() {
  return (
    <Router>
      <Shell />
    </Router>
  );
}

export default App;

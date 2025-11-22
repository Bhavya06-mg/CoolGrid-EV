import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
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


function App() {
  return (
    <Router>
      <Navbar />
      <div className="container mt-4">
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
      </div>
      <Footer />
    </Router>
  );
}

export default App;

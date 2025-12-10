// src/components/ProfileSlidePanel.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button, Form } from "react-bootstrap";
import axios from "axios";

export default function ProfileSlidePanel({ show, onClose }) {
  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  const [profile, setProfile] = useState({
    name: "",
    phone: "",
    location: "",
    availableUnits: "",
    profileImage: "",
  });

  const [newPassword, setNewPassword] = useState("");
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );

  // Apply dark mode on mount
  useEffect(() => {
    if (localStorage.getItem("darkMode") === "true") {
      document.body.classList.add("dark-mode");
    }
  }, []);

  // Load profile data
useEffect(() => {
  const fetchProfile = async () => {
    try {
      const res = await axios.get(
        "https://coolgrid-ev-1.onrender.com/api/profile/profile",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setProfile(res.data.profile);
    } catch (err) {
      console.error("Error loading profile:", err);
    }
  };

  if (show) fetchProfile();
}, [show, token]);


  // Save profile update
  const handleSave = async () => {
    try {
      const url =
        role === "SUPPLIER"
          ? `https://coolgrid-ev-1.onrender.com/api/profile/supplier/update`
          : `https://coolgrid-ev-1.onrender.com/api/profile/customer/update`;

      await axios.put(url, profile, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Profile updated successfully!");
      onClose();
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Failed to update profile");
    }
  };

  // Change password
  const handlePasswordChange = async () => {
    if (!newPassword) return alert("Enter new password");

    try {
      await axios.put(
        `https://coolgrid-ev-1.onrender.com/api/auth/change-password/${userId}`,
        { newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Password updated!");
      setNewPassword("");
    } catch (err) {
      console.error(err);
      alert("Failed to update password");
    }
  };

  // Dark mode toggle
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);

    localStorage.setItem("darkMode", newMode);

    if (newMode) document.body.classList.add("dark-mode");
    else document.body.classList.remove("dark-mode");
  };

  // Profile image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setProfile({ ...profile, profileImage: reader.result });
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      {show && (
        <div
          onClick={onClose}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.4)",
            zIndex: 999,
          }}
        />
      )}

      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: show ? 0 : "100%" }}
        transition={{ type: "tween", duration: 0.4 }}
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          width: "380px",
          height: "100vh",
          background: darkMode ? "#1e1e1e" : "#fff",
          color: darkMode ? "#fff" : "#000",
          boxShadow: "-4px 0 10px rgba(0,0,0,0.2)",
          zIndex: 1000,
          padding: "20px",
          overflowY: "auto",
        }}
      >
        <h3 className="mb-3">My Profile</h3>

        {/* Profile Image */}
        <div className="text-center mb-3">
          <img
            src={
              profile.profileImage ||
              "https://cdn-icons-png.flaticon.com/512/149/149071.png"
            }
            alt="profile"
            style={{
              width: "90px",
              height: "90px",
              borderRadius: "50%",
              objectFit: "cover",
              border: "2px solid #ccc",
            }}
          />
          <Form.Control
            type="file"
            accept="image/*"
            className="mt-2"
            onChange={handleImageUpload}
            style={{
              background: darkMode ? "#222" : "#fff",
              color: darkMode ? "#fff" : "#000",
              borderColor: darkMode ? "#444" : "#ccc",
            }}
          />
        </div>

        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              style={{
                background: darkMode ? "#222" : "#fff",
                color: darkMode ? "#fff" : "#000",
                borderColor: darkMode ? "#444" : "#ccc",
              }}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Phone</Form.Label>
            <Form.Control
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              style={{
                background: darkMode ? "#222" : "#fff",
                color: darkMode ? "#fff" : "#000",
                borderColor: darkMode ? "#444" : "#ccc",
              }}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Location</Form.Label>
            <Form.Control
              value={profile.location}
              onChange={(e) =>
                setProfile({ ...profile, location: e.target.value })
              }
              style={{
                background: darkMode ? "#222" : "#fff",
                color: darkMode ? "#fff" : "#000",
                borderColor: darkMode ? "#444" : "#ccc",
              }}
            />
          </Form.Group>

          {/* Supplier-only fields */}
          {role === "SUPPLIER" && (
            <>
              <Form.Group className="mb-3">
                <Form.Label>Available Units</Form.Label>
                <Form.Control
                  type="number"
                  value={profile.availableUnits}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      availableUnits: e.target.value,
                    })
                  }
                  style={{
                    background: darkMode ? "#222" : "#fff",
                    color: darkMode ? "#fff" : "#000",
                    borderColor: darkMode ? "#444" : "#ccc",
                  }}
                />
              </Form.Group>

            </>
          )}

          <Button
            variant="primary"
            className="w-100"
            onClick={handleSave}
          >
            Save Changes
          </Button>
        </Form>

        <hr />

        {/* Change Password */}
        <h6>Change Password</h6>
        <Form.Control
          type="password"
          placeholder="New password"
          className="mb-2"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          style={{
            background: darkMode ? "#222" : "#fff",
            color: darkMode ? "#fff" : "#000",
            borderColor: darkMode ? "#444" : "#ccc",
          }}
        />
        <Button
          variant="warning"
          className="w-100"
          onClick={handlePasswordChange}
        >
          Update Password
        </Button>

        <hr />

        {/* Dark Mode Toggle */}
        <Form.Check
          type="switch"
          id="dark-mode-switch"
          label="Dark Mode"
          checked={darkMode}
          onChange={toggleDarkMode}
        />

        <Button
          variant="secondary"
          className="mt-3 w-100"
          onClick={onClose}
        >
          Close
        </Button>
      </motion.div>
    </>
  );
}

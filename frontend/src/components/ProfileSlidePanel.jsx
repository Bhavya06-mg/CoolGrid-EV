// src/components/ProfileSlidePanel.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button, Form, Spinner } from "react-bootstrap";
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
  const [snapshot, setSnapshot] = useState(null); // used to revert on Cancel

  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [toast, setToast] = useState(null); // { type: "success" | "error", text: string }

  const flashToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3000);
  };

  // Load profile data
  useEffect(() => {
    const fetchProfile = async () => {
      setLoadingProfile(true);
      try {
        const res = await axios.get(
          "https://coolgrid-ev-1.onrender.com/api/profile/profile",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setProfile(res.data.profile);
        setSnapshot(res.data.profile);
      } catch (err) {
        console.error("Error loading profile:", err);
      } finally {
        setLoadingProfile(false);
      }
    };

    if (show) {
      fetchProfile();
      setIsEditing(false);
    }
  }, [show, token]);

  // Save profile update
  const handleSave = async () => {
    setSaving(true);
    try {
      const url =
        role === "SUPPLIER"
          ? `https://coolgrid-ev-1.onrender.com/api/profile/supplier/update`
          : `https://coolgrid-ev-1.onrender.com/api/profile/customer/update`;

      await axios.put(url, profile, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSnapshot(profile);
      setIsEditing(false);
      flashToast("success", "Profile updated successfully!");
    } catch (err) {
      console.error("Error updating profile:", err);
      flashToast("error", "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (snapshot) setProfile(snapshot);
    setIsEditing(false);
  };

  // Change password
  const handlePasswordChange = async () => {
    if (!newPassword) {
      flashToast("error", "Enter a new password");
      return;
    }

    setSavingPassword(true);
    try {
      await axios.put(
        `https://coolgrid-ev-1.onrender.com/api/auth/change-password/${userId}`,
        { newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      flashToast("success", "Password updated!");
      setNewPassword("");
    } catch (err) {
      console.error(err);
      flashToast("error", "Failed to update password");
    } finally {
      setSavingPassword(false);
    }
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

  const fields = [
    { key: "name", label: "Name" },
    { key: "phone", label: "Phone" },
    { key: "location", label: "Location" },
    ...(role === "SUPPLIER" ? [{ key: "availableUnits", label: "Available Units", type: "number" }] : []),
  ];

  return (
    <>
      <style>{`
        .profile-glass-overlay {
          position: fixed;
          top: 0; left: 0;
          width: 100vw; height: 100vh;
          background: rgba(6, 10, 18, 0.55);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          z-index: 999;
        }
        .profile-glass-panel {
          position: fixed;
          top: 0; right: 0;
          width: 400px;
          height: 100vh;
          background: rgba(16, 25, 46, 0.78);
          backdrop-filter: blur(26px);
          -webkit-backdrop-filter: blur(26px);
          border-left: 1px solid rgba(255,255,255,0.14);
          box-shadow: -8px 0 40px rgba(0,0,0,0.5), inset 1px 0 0 rgba(255,255,255,0.05);
          z-index: 1000;
          padding: 22px 22px 28px;
          overflow-y: auto;
          color: #f3f6fb;
          display: flex;
          flex-direction: column;
        }
        .profile-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 18px;
        }
        .profile-header h3 {
          font-weight: 600;
          color: #f3f6fb;
          margin: 0;
          font-size: 20px;
        }
        .profile-x-btn {
          width: 34px; height: 34px;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.18);
          background: rgba(255,255,255,0.06);
          color: rgba(230,235,244,0.85);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          line-height: 1;
          cursor: pointer;
          transition: background 0.15s ease, transform 0.15s ease;
        }
        .profile-x-btn:hover {
          background: rgba(255,255,255,0.14);
          transform: rotate(90deg);
        }

        .profile-section {
          background: rgba(255,255,255,0.035);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 16px;
          padding: 18px;
          margin-bottom: 16px;
        }
        .profile-section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
        }
        .profile-section-title {
          color: rgba(125,211,252,0.85);
          font-size: 11.5px;
          letter-spacing: 1.2px;
          text-transform: uppercase;
          font-weight: 700;
        }
        .profile-section-title.amber { color: rgba(251,191,143,0.9); }

        .profile-edit-btn {
          display: flex;
          align-items: center;
          gap: 5px;
          background: rgba(56,189,248,0.14);
          border: 1px solid rgba(125,211,252,0.35);
          color: #7dd3fc;
          font-size: 11.5px;
          font-weight: 700;
          letter-spacing: 0.4px;
          border-radius: 999px;
          padding: 5px 12px;
          cursor: pointer;
          transition: background 0.15s ease;
        }
        .profile-edit-btn:hover { background: rgba(56,189,248,0.24); }

        .profile-avatar {
          width: 84px; height: 84px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid rgba(56,189,248,0.5);
          box-shadow: 0 0 20px rgba(56,189,248,0.25);
        }
        .profile-glass-input {
          background: rgba(255,255,255,0.06) !important;
          border: 1px solid rgba(255,255,255,0.22) !important;
          color: #f3f6fb !important;
          border-radius: 10px !important;
          padding: 10px 14px !important;
          backdrop-filter: blur(4px);
        }
        .profile-glass-input::placeholder { color: rgba(230,235,244,0.4); }
        .profile-glass-input:focus {
          background: rgba(255,255,255,0.09) !important;
          border-color: rgba(56,189,248,0.65) !important;
          box-shadow: 0 0 0 3px rgba(56,189,248,0.18) !important;
          color: #fff !important;
        }
        .profile-glass-input::file-selector-button {
          background: rgba(56,189,248,0.18);
          color: #7dd3fc;
          border: 1px solid rgba(125,211,252,0.3);
          border-radius: 8px;
          padding: 5px 10px;
          margin-right: 10px;
        }
        .profile-glass-label {
          color: rgba(230,235,244,0.7);
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.3px;
          margin-bottom: 5px;
        }

        /* Read-only display rows, shown when not editing */
        .profile-view-row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          padding: 10px 2px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }
        .profile-view-row:last-child { border-bottom: none; }
        .profile-view-label {
          color: rgba(230,235,244,0.5);
          font-size: 12.5px;
        }
        .profile-view-value {
          color: #f3f6fb;
          font-size: 14.5px;
          font-weight: 600;
        }
        .profile-view-value.empty {
          color: rgba(230,235,244,0.35);
          font-weight: 400;
          font-style: italic;
        }

        .profile-password-wrap {
          position: relative;
        }
        .profile-password-toggle {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: rgba(230,235,244,0.55);
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          padding: 4px 6px;
        }
        .profile-password-toggle:hover { color: #7dd3fc; }

        .profile-save-btn {
          border: none !important;
          background: linear-gradient(180deg, rgba(56,189,248,0.9), rgba(59,130,246,0.8)) !important;
          color: #fff !important;
          font-weight: 600 !important;
          border-radius: 999px !important;
          padding: 10px !important;
          box-shadow: 0 6px 18px rgba(56,189,248,0.3), inset 0 1px 0 rgba(255,255,255,0.4);
          transition: transform 0.2s ease, opacity 0.2s ease;
        }
        .profile-save-btn:hover:not(:disabled) { transform: translateY(-2px); }
        .profile-save-btn:disabled { opacity: 0.7; }

        .profile-cancel-btn {
          border: 1px solid rgba(255,255,255,0.25) !important;
          background: rgba(255,255,255,0.05) !important;
          color: rgba(230,235,244,0.85) !important;
          font-weight: 600 !important;
          border-radius: 999px !important;
          padding: 10px !important;
          transition: background 0.2s ease;
        }
        .profile-cancel-btn:hover { background: rgba(255,255,255,0.11) !important; }

        .profile-password-btn {
          border: none !important;
          background: linear-gradient(180deg, rgba(245,158,11,0.9), rgba(217,119,6,0.8)) !important;
          color: #2b1503 !important;
          font-weight: 600 !important;
          border-radius: 999px !important;
          padding: 10px !important;
          box-shadow: 0 6px 18px rgba(201,121,61,0.3), inset 0 1px 0 rgba(255,255,255,0.4);
          transition: transform 0.2s ease, opacity 0.2s ease;
        }
        .profile-password-btn:hover:not(:disabled) { transform: translateY(-2px); }
        .profile-password-btn:disabled { opacity: 0.7; }

        .profile-toast {
          position: absolute;
          top: 18px;
          left: 22px;
          right: 22px;
          padding: 11px 16px;
          border-radius: 12px;
          font-size: 13.5px;
          font-weight: 600;
          text-align: center;
          backdrop-filter: blur(10px);
          z-index: 10;
        }
        .profile-toast.success {
          background: rgba(34,197,94,0.18);
          border: 1px solid rgba(74,222,128,0.4);
          color: #86efac;
        }
        .profile-toast.error {
          background: rgba(220,38,38,0.18);
          border: 1px solid rgba(248,113,113,0.4);
          color: #fca5a5;
        }

        .profile-skeleton {
          background: linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
          border-radius: 10px;
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      {show && (
        <div onClick={onClose} className="profile-glass-overlay" />
      )}

      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: show ? 0 : "100%" }}
        transition={{ type: "tween", duration: 0.4 }}
        className="profile-glass-panel"
      >
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`profile-toast ${toast.type}`}
            >
              {toast.text}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="profile-header">
          <h3>My Profile</h3>
          <button className="profile-x-btn" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        {/* Avatar + basic info */}
        <div className="profile-section">
          <div className="profile-section-header">
            <div className="profile-section-title">Profile</div>
            {!loadingProfile && !isEditing && (
              <button className="profile-edit-btn" onClick={() => setIsEditing(true)}>
                ✎ Edit
              </button>
            )}
          </div>

          <div className="text-center mb-3">
            {loadingProfile ? (
              <div
                className="profile-skeleton mx-auto"
                style={{ width: 84, height: 84, borderRadius: "50%" }}
              />
            ) : (
              <img
                src={
                  profile.profileImage ||
                  "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                }
                alt="profile"
                className="profile-avatar"
              />
            )}
            {isEditing && (
              <Form.Control
                type="file"
                accept="image/*"
                className="mt-3 profile-glass-input"
                onChange={handleImageUpload}
              />
            )}
          </div>

          {loadingProfile ? (
            <>
              <div className="profile-skeleton mb-2" style={{ height: 38 }} />
              <div className="profile-skeleton mb-2" style={{ height: 38 }} />
              <div className="profile-skeleton mb-2" style={{ height: 38 }} />
            </>
          ) : isEditing ? (
            <Form>
              {fields.map((f) => (
                <Form.Group className="mb-3" key={f.key}>
                  <Form.Label className="profile-glass-label">{f.label}</Form.Label>
                  <Form.Control
                    type={f.type || "text"}
                    className="profile-glass-input"
                    value={profile[f.key]}
                    onChange={(e) =>
                      setProfile({ ...profile, [f.key]: e.target.value })
                    }
                  />
                </Form.Group>
              ))}

              <div className="d-flex gap-2">
                <Button
                  className="profile-cancel-btn w-100"
                  onClick={handleCancelEdit}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  className="profile-save-btn w-100 d-flex align-items-center justify-content-center gap-2"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving && <Spinner animation="border" size="sm" />}
                  {saving ? "Saving..." : "Save"}
                </Button>
              </div>
            </Form>
          ) : (
            <div>
              {fields.map((f) => (
                <div className="profile-view-row" key={f.key}>
                  <span className="profile-view-label">{f.label}</span>
                  <span className={`profile-view-value ${!profile[f.key] ? "empty" : ""}`}>
                    {profile[f.key] || "Not set"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Password */}
        <div className="profile-section">
          <div className="profile-section-title amber mb-3">Change Password</div>

          <div className="profile-password-wrap mb-3">
            <Form.Control
              type={showPassword ? "text" : "password"}
              placeholder="New password"
              className="profile-glass-input"
              style={{ paddingRight: 56 }}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <button
              type="button"
              className="profile-password-toggle"
              onClick={() => setShowPassword((v) => !v)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <Button
            className="profile-password-btn w-100 d-flex align-items-center justify-content-center gap-2"
            onClick={handlePasswordChange}
            disabled={savingPassword}
          >
            {savingPassword && <Spinner animation="border" size="sm" />}
            {savingPassword ? "Updating..." : "Update Password"}
          </Button>
        </div>
      </motion.div>
    </>
  );
}
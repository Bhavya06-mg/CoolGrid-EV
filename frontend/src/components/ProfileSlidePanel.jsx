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
          background: rgba(0,0,0,0.6);
          z-index: 999;
        }
        .profile-glass-panel {
          position: fixed;
          top: 0; right: 0;
          width: 400px;
          height: 100vh;
          background: #111213;
          border-left: 1px solid #232526;
          box-shadow: -8px 0 40px rgba(0,0,0,0.5), inset 1px 0 0 #161718;
          z-index: 1000;
          padding: 22px 22px 28px;
          overflow-y: auto;
          color: #f2f4f3;
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
          color: #f2f4f3;
          margin: 0;
          font-size: 20px;
        }
        .profile-x-btn {
          width: 34px; height: 34px;
          border-radius: 50%;
          border: 1px solid #232526;
          background: #161718;
          color: #9aa3a0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          line-height: 1;
          cursor: pointer;
          transition: background 0.15s ease, transform 0.15s ease;
        }
        .profile-x-btn:hover {
          background: #232526;
          transform: rotate(90deg);
        }

        .profile-section {
          background: #161718;
          border: 1px solid #232526;
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
          color: rgba(52,224,161,0.85);
          font-size: 11.5px;
          letter-spacing: 1.2px;
          text-transform: uppercase;
          font-weight: 700;
        }
        .profile-section-title.amber { color: rgba(52,224,161,0.9); }

        .profile-edit-btn {
          display: flex;
          align-items: center;
          gap: 5px;
          background: rgba(52,224,161,0.14);
          border: 1px solid rgba(52,224,161,0.35);
          color: #34e0a1;
          font-size: 11.5px;
          font-weight: 700;
          letter-spacing: 0.4px;
          border-radius: 999px;
          padding: 5px 12px;
          cursor: pointer;
          transition: background 0.15s ease;
        }
        .profile-edit-btn:hover { background: rgba(52,224,161,0.24); }

        .profile-avatar {
          width: 84px; height: 84px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid rgba(52,224,161,0.5);
          box-shadow: 0 0 20px rgba(52,224,161,0.25);
        }
        .profile-glass-input {
          background: #161718 !important;
          border: 1px solid #232526 !important;
          color: #f2f4f3 !important;
          border-radius: 10px !important;
          padding: 10px 14px !important;
        }
        .profile-glass-input::placeholder { color: #7d8582; }
        .profile-glass-input:focus {
          background: #232526 !important;
          border-color: rgba(52,224,161,0.65) !important;
          box-shadow: 0 0 0 3px rgba(52,224,161,0.18) !important;
          color: #fff !important;
        }
        .profile-glass-input::file-selector-button {
          background: rgba(52,224,161,0.18);
          color: #34e0a1;
          border: 1px solid rgba(52,224,161,0.3);
          border-radius: 8px;
          padding: 5px 10px;
          margin-right: 10px;
        }
        .profile-glass-label {
          color: #9aa3a0;
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
          border-bottom: 1px solid #161718;
        }
        .profile-view-row:last-child { border-bottom: none; }
        .profile-view-label {
          color: #7d8582;
          font-size: 12.5px;
        }
        .profile-view-value {
          color: #f2f4f3;
          font-size: 14.5px;
          font-weight: 600;
        }
        .profile-view-value.empty {
          color: #7d8582;
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
          color: #7d8582;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          padding: 4px 6px;
        }
        .profile-password-toggle:hover { color: #34e0a1; }

        .profile-save-btn {
          border: none !important;
          background: #34e0a1 !important;
          color: #fff !important;
          font-weight: 600 !important;
          border-radius: 999px !important;
          padding: 10px !important;
          box-shadow: 0 6px 18px rgba(52,224,161,0.3), inset 0 1px 0 transparent;
          transition: transform 0.2s ease, opacity 0.2s ease;
        }
        .profile-save-btn:hover:not(:disabled) { transform: translateY(-2px); }
        .profile-save-btn:disabled { opacity: 0.7; }

        .profile-cancel-btn {
          border: 1px solid #232526 !important;
          background: #161718 !important;
          color: #9aa3a0 !important;
          font-weight: 600 !important;
          border-radius: 999px !important;
          padding: 10px !important;
          transition: background 0.2s ease;
        }
        .profile-cancel-btn:hover { background: #232526 !important; }

        .profile-password-btn {
          border: none !important;
          background: #34e0a1 !important;
          color: #04251a !important;
          font-weight: 600 !important;
          border-radius: 999px !important;
          padding: 10px !important;
          box-shadow: 0 6px 18px rgba(52,224,161,0.3), inset 0 1px 0 transparent;
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
          z-index: 10;
        }
        .profile-toast.success {
          background: rgba(31,168,116,0.18);
          border: 1px solid rgba(52,224,161,0.4);
          color: #86efac;
        }
        .profile-toast.error {
          background: rgba(220,38,38,0.18);
          border: 1px solid rgba(248,113,113,0.4);
          color: #fca5a5;
        }

        .profile-skeleton {
          background: linear-gradient(90deg, #161718 25%, #232526 50%, #161718 75%);
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
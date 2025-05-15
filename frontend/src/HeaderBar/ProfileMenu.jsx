import React, { useState, useRef, useEffect } from "react";

export default function ProfileMenu({ user, onLogout }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef();

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div style={{ position: "relative" }} ref={profileRef}>
      <span
        className="material-icons"
        style={{
          fontSize: 36,
          color: "#fff",
          background: "#1976d2",
          borderRadius: "8px",
          padding: 4,
          cursor: "pointer",
          border: profileOpen ? "2px solid #7c5fe6" : "none"
        }}
        onClick={() => setProfileOpen((v) => !v)}
      >
        account_circle
      </span>
      {profileOpen && (
        <div style={{
          position: "absolute",
          right: 0,
          top: 44,
          background: "#fff",
          boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
          borderRadius: 12,
          minWidth: 240,
          zIndex: 10,
          padding: "16px 0"
        }}>
          <div style={{ padding: "8px 24px", color: "#444", fontWeight: 700, fontSize: 18 }}>
            {user?.name || "User"}
          </div>
          <div style={{ padding: "4px 24px", color: "#888", fontSize: 15 }}>
            <span style={{ fontWeight: 500 }}>Email:</span> {user?.gmail}
          </div>
          <div style={{ padding: "4px 24px", color: "#888", fontSize: 15 }}>
            <span style={{ fontWeight: 500 }}>SĐT:</span> {user?.phone}
          </div>
          <hr style={{ margin: "12px 0" }} />
          <div
            style={{
              padding: "10px 0",
              color: "#fff",
              background: "#7c5fe6",
              borderRadius: "8px",
              fontWeight: "bold",
              fontSize: "16px",
              cursor: "pointer",
              textAlign: "center",
              margin: "8px 16px",
              transition: "background 0.2s"
            }}
            onMouseOver={e => {
              e.currentTarget.style.background = "#5a3ec8";
            }}
            onMouseOut={e => {
              e.currentTarget.style.background = "#7c5fe6";
            }}
            onClick={onLogout}
          >
            Đăng xuất
          </div>
        </div>
      )}
    </div>
  );
}

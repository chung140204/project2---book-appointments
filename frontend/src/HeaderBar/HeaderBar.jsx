import React, { useState } from "react";
import LanguageSelector from "./LanguageSelector";
import NotificationBell from "./NotificationBell";
import ProfileMenu from "./ProfileMenu";
import { useNavigate } from "react-router-dom";

export default function HeaderBar({ user, onToggleSidebar, onLogout }) {
  const [lang, setLang] = useState("en");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/search?query=${encodeURIComponent(search.trim())}`);
      setSearch("");
    }
  };

  return (
    <div style={{
      width: "100%",
      background: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 32px",
      height: 60,
      boxShadow: "0 2px 8px rgba(161,140,209,0.08)",
      borderBottom: "1px solid #eee"
    }}>
      {/* Left: Search */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <button
          style={{
            background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#888"
          }}
          onClick={onToggleSidebar}
        >
          <span className="material-icons">menu</span>
        </button>
        <form
          onSubmit={handleSearch}
          style={{
            background: "#f4f6fa",
            borderRadius: 20,
            padding: "6px 16px",
            display: "flex",
            alignItems: "center"
          }}
        >
          <span className="material-icons" style={{ color: "#aaa", fontSize: 20, marginRight: 6 }}>search</span>
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              border: "none",
              background: "transparent",
              outline: "none",
              fontSize: 16,
              width: 120
            }}
          />
        </form>
      </div>
      {/* Right: Language, icons, avatar, settings */}
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <LanguageSelector lang={lang} setLang={setLang} />
        {/* Mail icon */}
        <span className="material-icons" style={{ fontSize: 22, color: "#7c5fe6", position: "relative" }}>
          mail
          <span style={{
            position: "absolute", top: -6, right: -8, background: "#f06292", color: "#fff",
            borderRadius: "50%", fontSize: 11, width: 16, height: 16, display: "flex",
            alignItems: "center", justifyContent: "center"
          }}>2</span>
        </span>
        <NotificationBell />
        <ProfileMenu user={user} onLogout={onLogout} />
        {/* Settings */}
        <span className="material-icons" style={{ fontSize: 22, color: "#888", cursor: "pointer" }}>
          settings
        </span>
      </div>
    </div>
  );
}
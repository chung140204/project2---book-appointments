import React from "react";

export default function SidebarButton({ label, onClick, icon, collapsed }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        padding: collapsed ? "12px 0" : "12px 32px",
        cursor: "pointer",
        fontWeight: 500,
        fontSize: 17,
        transition: "background 0.2s",
        borderLeft: "4px solid transparent",
        justifyContent: collapsed ? "center" : "flex-start"
      }}
      onMouseOver={e => e.currentTarget.style.background = "#2e3a4d"}
      onMouseOut={e => e.currentTarget.style.background = "transparent"}
    >
      <span style={{ fontSize: 22, marginRight: collapsed ? 0 : 16 }}>{icon}</span>
      {!collapsed && label}
    </div>
  );
} 
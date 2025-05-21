import React from "react";
import SidebarButton from "./SidebarButton";

export default function Sidebar({ collapsed, onLogout, navigate, user, sidebarControl }) {
  return (
    <aside style={{
      width: collapsed ? 60 : 220,
      transition: "width 0.2s",
      background: "#232d3b",
      color: "#fff",
      display: "flex",
      flexDirection: "column",
      alignItems: collapsed ? "center" : "flex-start",
      padding: "32px 0",
      position: "relative"
    }}>
      <div style={{
        fontWeight: "bold",
        fontSize: 24,
        textAlign: "center",
        marginBottom: 40,
        letterSpacing: 1,
        display: collapsed ? "none" : "block",
        width: "100%"
      }}>
        <span>Booking</span>
      </div>
      <nav style={{ flex: 1 }}>
        <SidebarButton label="Home" onClick={() => navigate("/dashboard")} icon="🏠" collapsed={collapsed} />
        <SidebarButton label="Đặt lịch" onClick={() => navigate("/book")} icon="📝" collapsed={collapsed} />
        <SidebarButton label="Lịch của tôi" onClick={() => navigate("/my-appointments")} icon="📅" collapsed={collapsed} />
        <SidebarButton label="Chỉnh sửa thông tin" onClick={() => navigate("/profile")} icon="👤" collapsed={collapsed} />
        <SidebarButton label="Xem lịch làm việc admin" onClick={() => navigate("/admin-calendar")} icon="📆" collapsed={collapsed} />        {user?.role === "admin" && (
          <>
            <SidebarButton label="Quản lý lịch" onClick={() => navigate("/admin")} icon="📊" collapsed={collapsed} />
            <SidebarButton label="Quản lý dịch vụ" onClick={() => navigate("/admin/services")} icon="🔧" collapsed={collapsed} />
            <SidebarButton label="Quản lý user" onClick={() => navigate("/admin/users")} icon="👥" collapsed={collapsed} />
          </>
        )}
      </nav>
      <button
        onClick={onLogout}
        style={{
          position: "absolute",
          left: collapsed ? "50%" : 24,
          bottom: 32,
          transform: collapsed ? "translateX(-50%)" : "none",
          width: collapsed ? 56 : "calc(100% - 48px)",
          minWidth: 56,
          height: 48,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: collapsed ? 0 : 10,
          padding: 0,
          background: "linear-gradient(90deg, #a18cd1 0%, #fbc2eb 100%)",
          color: "#fff",
          border: "none",
          borderRadius: 24,
          fontWeight: "bold",
          fontSize: 18,
          cursor: "pointer",
          boxShadow: "0 4px 24px rgba(161,140,209,0.13)",
          transition: "background 0.2s, color 0.2s, box-shadow 0.2s, width 0.2s, left 0.2s, transform 0.2s"
        }}
        onMouseOver={e => {
          e.currentTarget.style.background = "linear-gradient(90deg, #fbc2eb 0%, #a18cd1 100%)";
          e.currentTarget.style.color = "#232d3b";
          e.currentTarget.style.boxShadow = "0 8px 32px rgba(161,140,209,0.18)";
        }}
        onMouseOut={e => {
          e.currentTarget.style.background = "linear-gradient(90deg, #a18cd1 0%, #fbc2eb 100%)";
          e.currentTarget.style.color = "#fff";
          e.currentTarget.style.boxShadow = "0 4px 24px rgba(161,140,209,0.13)";
        }}
        title="Đăng xuất"
      >
        <span className="material-icons" style={{ fontSize: 22 }}>
          logout
        </span>
        {!collapsed && <span style={{ marginLeft: 8 }}>Đăng xuất</span>}
      </button>
    </aside>
  );
} 
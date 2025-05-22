import React, { useState } from "react";
import {useNavigate } from "react-router-dom";
import AdminCalendar from './components/AdminCalendar';


export default function DashboardHomePage({ user }) {
    const navigate = useNavigate();
    const isAdmin = user?.role === "admin";
    return (
      <div>
        <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 32, color: "#232d3b" }}>
          Xin chào! 👋
        </div>
        <div style={{ display: "flex", gap: 32, marginBottom: 40, flexWrap: 'wrap' }}>
          {isAdmin ? (
            <>
              <DashboardCard
                color="#43cea2"
                icon="📆"
                label="Xem lịch làm việc admin"
                onClick={() => navigate("/admin-calendar")}
              />
              <DashboardCard
                color="#7c5fe6"
                icon="📊"
                label="Quản lý lịch"
                onClick={() => navigate("/admin")}
              />
              <DashboardCard
                color="#ffd54f"
                icon="🔧"
                label="Quản lý dịch vụ"
                onClick={() => navigate("/admin/services")}
              />
              <DashboardCard
                color="#64b5f6"
                icon="👥"
                label="Quản lý user"
                onClick={() => navigate("/admin/users")}
              />
            </>
          ) : (
            <>
              <DashboardCard
                color="#f06292"
                icon="📝"
                label="Đặt lịch"
                onClick={() => navigate("/book")}
              />
              <DashboardCard
                color="#64b5f6"
                icon="📅"
                label="Lịch của tôi"
                onClick={() => navigate("/my-appointments")}
              />
              <DashboardCard
                color="#ffd54f"
                icon="👤"
                label="Chỉnh sửa thông tin"
                onClick={() => navigate("/profile")}
              />
              <DashboardCard
                color="#a18cd1"
                icon="📖"
                label="Thông tin dịch vụ"
                onClick={() => navigate("/services-info")}
              />
              <DashboardCard
                color="#43cea2"
                icon="📆"
                label="Xem lịch làm việc admin"
                onClick={() => navigate("/admin-calendar")}
              />
            </>
          )}
        </div>
        <div style={{
          background: "#fff",
          borderRadius: 16,
          padding: 32,
          boxShadow: "0 2px 12px rgba(161,140,209,0.08)",
          minHeight: 200
        }}>
          <h2 style={{ color: "#7c5fe6", marginBottom: 16 }}>Chào mừng bạn đến với hệ thống đặt lịch hẹn!</h2>
          <p style={{ color: "#444", fontSize: 18 }}>
            Hãy sử dụng sidebar hoặc các ô chức năng phía trên để truy cập nhanh các tính năng chính.
          </p>
        </div>
      </div>
    );
}

// Sidebar button component
function SidebarButton({ label, onClick, icon, collapsed }) {
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

// Dashboard card component
function DashboardCard({ color, icon, label, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        flex: 1,
        background: color,
        color: "#fff",
        borderRadius: 16,
        padding: "32px 0",
        textAlign: "center",
        fontWeight: "bold",
        fontSize: 20,
        cursor: "pointer",
        boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
        transition: "transform 0.1s",
      }}
      onMouseOver={e => e.currentTarget.style.transform = "scale(1.04)"}
      onMouseOut={e => e.currentTarget.style.transform = "scale(1)"}
    >
      <div style={{ fontSize: 40, marginBottom: 12 }}>{icon}</div>
      {label}
    </div>
  );
}
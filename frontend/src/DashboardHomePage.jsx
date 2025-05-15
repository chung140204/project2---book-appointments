import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HeaderBar from "./HeaderBar/HeaderBar";
import Sidebar from "./Sidebar/Sidebar";

export default function DashboardHomePage({ setUser }) {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notification, setNotification] = useState("");
  const [notificationRead, setNotificationRead] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);  
    navigate("/login");
  };

  // Lấy user từ localStorage nếu muốn truyền vào HeaderBar
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {}

  // Fetch lịch hẹn và cập nhật notification
  useEffect(() => {
    let intervalId;
    const fetchAppointments = () => {
      if (notificationRead) return; // Nếu đã đọc thì không fetch lại thông báo
      const token = localStorage.getItem("token");
      fetch("http://localhost:5000/api/appointments", {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data.appointments)) {
            const latest = data.appointments
              .filter(app => app.status === "confirmed" || app.status === "rejected")
              .sort((a, b) => new Date(b.updated_at || b.date) - new Date(a.updated_at || a.date))[0];
            let newNotification = "";
            if (latest) {
              if (latest.status === "confirmed") {
                newNotification = "Lịch hẹn của bạn đã được admin xác nhận!";
              } else if (latest.status === "rejected") {
                newNotification = "Lịch hẹn của bạn đã bị admin từ chối!";
              }
            }
            // Nếu có thông báo mới khác với thông báo cũ, reset notificationRead
            if (newNotification && newNotification !== notification) {
              setNotificationRead(false);
              setNotification(newNotification);
            } else if (!newNotification) {
              setNotification("");
            }
          } else {
            setNotification("");
          }
        })
        .catch(() => setNotification(""));
    };
    fetchAppointments();
    intervalId = setInterval(fetchAppointments, 10000); // 10 giây fetch lại
    return () => clearInterval(intervalId);
  }, [notification, notificationRead]);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f4f6fa" }}>
      {/* Sidebar */}
      <Sidebar collapsed={sidebarCollapsed} onLogout={handleLogout} navigate={navigate} />

      {/* Main content wrapper */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Header bar */}
        <HeaderBar user={user} onToggleSidebar={() => setSidebarCollapsed(v => !v)} onLogout={handleLogout} notification={notification} setNotification={setNotification} setNotificationRead={setNotificationRead} />
      {/* Main content */}
      <main style={{ flex: 1, padding: "40px 48px" }}>
        <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 32, color: "#232d3b" }}>
          Xin chào! 👋
        </div>
        {/* Cards */}
        <div style={{ display: "flex", gap: 32, marginBottom: 40 }}>
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
          {/* <DashboardCard
            color="#81c784"
            icon="🏠"
            label="Trang chủ"
            onClick={() => navigate("/home")}
          /> */}
          <DashboardCard
            color="#ffd54f"
            icon="👤"
            label="Chỉnh sửa thông tin"
            onClick={() => navigate("/profile")}
          />
        </div>
        {/* Bạn có thể thêm biểu đồ, báo cáo, hoặc thông tin khác ở đây */}
        <div style={{
          background: "#fff",
          borderRadius: 16,
          padding: 32,
          boxShadow: "0 2px 12px rgba(161,140,209,0.08)",
          minHeight: 200
        }}>
          <h2 style={{ color: "#7c5fe6", marginBottom: 16 }}>Chào mừng bạn đến với hệ thống đặt lịch hẹn!</h2>
          <p style={{ color: "#444", fontSize: 18 }}>
            Hãy sử dụng sidebar hoặc các ô chức năng phía trên để đặt lịch, xem lịch của bạn hoặc quay về trang chủ.
          </p>
        </div>
      </main>
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
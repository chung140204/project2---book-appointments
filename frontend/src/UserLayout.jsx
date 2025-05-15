import HeaderBar from "./HeaderBar/HeaderBar";
import Sidebar from "./Sidebar/Sidebar";
import { Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function UserLayout({ user, setUser }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)" }}>
      <Sidebar collapsed={sidebarCollapsed} onLogout={handleLogout} navigate={navigate} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <HeaderBar user={user} onToggleSidebar={() => setSidebarCollapsed(v => !v)} onLogout={handleLogout} />
        <main style={{ flex: 1, padding: "40px 48px" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
} 
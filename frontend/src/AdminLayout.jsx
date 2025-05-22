import { useState } from "react";
import Sidebar from "./Sidebar/Sidebar";
import HeaderBar from "./HeaderBar/HeaderBar";
import { useNavigate, Outlet } from "react-router-dom";

export default function AdminLayout({ user, onLogout, children }) {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    }}>
      <Sidebar
        collapsed={collapsed}
        onLogout={onLogout}
        navigate={navigate}
        user={user}
        sidebarControl={{}}
      />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <HeaderBar user={user} onToggleSidebar={() => setCollapsed(c => !c)} onLogout={onLogout} />
        <div style={{ flex: 1, padding: 0, minHeight: 0 }}>
          <Outlet context={{ user }} />
        </div>
      </div>
    </div>
  );
} 
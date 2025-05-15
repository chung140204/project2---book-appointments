import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';

const iconStyle = {
  fontSize: 20,
  marginRight: 10,
  color: '#7c5fe6',
  minWidth: 24
};

export default function ProfileEdit({ user, setUser }) {
  const [name, setName] = useState(user?.name || "");
  const [gmail, setGmail] = useState(user?.gmail || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(`http://localhost:5000/api/users/${user.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, gmail, phone }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.success) {
      toast.success("Cập nhật thông tin thành công!");
      const newUser = { ...user, name, gmail, phone };
      localStorage.setItem("user", JSON.stringify(newUser));
      setUser(newUser);
    } else {
      toast.error(data.message || "Cập nhật thông tin thất bại!");
    }
  };

  return (
    <div
      style={{
        minHeight: "calc(100vh - 120px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        padding: "32px 0 40px 0",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: "#fff",
          borderRadius: 18,
          boxShadow: "0 2px 16px rgba(161,140,209,0.10)",
          padding: "48px 48px 40px 48px",
          minWidth: 340,
          maxWidth: 520,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginTop: 0,
          marginBottom: 32,
        }}
      >
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          marginBottom: 28
        }}>
          <span style={{ fontSize: 28, marginRight: 10, color: "#7c5fe6" }}>🧑</span>
          <span style={{
            color: "#7c5fe6",
            fontWeight: 700,
            fontSize: 24,
            letterSpacing: 1
          }}>
            Chỉnh sửa thông tin cá nhân
          </span>
        </div>
        <label style={{ display: "flex", alignItems: "center", width: "100%", marginBottom: 22 }}>
          <span style={iconStyle}>👤</span>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Họ tên"
            required
            style={{
              width: "100%",
              padding: "16px 18px",
              border: "1.5px solid #d1d1d1",
              borderRadius: 12,
              background: "#f7f7f7",
              color: "#222",
              fontSize: 18
            }}
          />
        </label>
        <label style={{ display: "flex", alignItems: "center", width: "100%", marginBottom: 22 }}>
          <span style={iconStyle}>📧</span>
          <input
            type="email"
            value={gmail}
            onChange={e => setGmail(e.target.value)}
            placeholder="Gmail"
            required
            style={{
              width: "100%",
              padding: "16px 18px",
              border: "1.5px solid #d1d1d1",
              borderRadius: 12,
              background: "#f7f7f7",
              color: "#222",
              fontSize: 18
            }}
          />
        </label>
        <label style={{ display: "flex", alignItems: "center", width: "100%", marginBottom: 32 }}>
          <span style={iconStyle}>📱</span>
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="Số điện thoại"
            required
            style={{
              width: "100%",
              padding: "16px 18px",
              border: "1.5px solid #d1d1d1",
              borderRadius: 12,
              background: "#f7f7f7",
              color: "#222",
              fontSize: 18
            }}
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: 16,
            background: "linear-gradient(90deg, #a18cd1 0%, #6dd5fa 100%)",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            fontSize: 20,
            fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer",
            marginTop: 8,
            marginBottom: 8,
            transition: "background 0.2s, color 0.2s"
          }}
        >
          {loading ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
      </form>
    </div>
  );
} 
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';

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
      navigate("/dashboard");
    } else {
      toast.error(data.message || "Cập nhật thông tin thất bại!");
    }
  };

  return (
    <div className="form-auth-outer">
      <form className="form-auth-container" onSubmit={handleSubmit} style={{maxWidth: 400}}>
        <h2>Chỉnh sửa thông tin cá nhân</h2>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Họ tên"
          required
        />
        <input
          type="email"
          value={gmail}
          onChange={e => setGmail(e.target.value)}
          placeholder="Gmail"
          required
        />
        <input
          type="tel"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          placeholder="Số điện thoại"
          required
        />
        <button type="submit" disabled={loading}>{loading ? "Đang lưu..." : "Lưu thay đổi"}</button>
        <button type="button" onClick={() => navigate("/dashboard")} style={{marginTop: 10}}>Quay lại</button>
      </form>
    </div>
  );
} 
import { useState} from "react";
import "../FormAuth.css";
import { Link, useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';


export default function Login({ setUser }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("http://localhost:5000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.success) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      toast.success("Đăng nhập thành công!");
      if (data.user.role === "admin") {
        setTimeout(() => navigate("/admin"), 800);
      } else {
        setTimeout(() => navigate("/dashboard"), 800);
      }
    } else {
      toast.error(data.message || "Đăng nhập thất bại!");
    }
  };

  return (
    <div className="form-auth-outer">
      <form className="form-auth-container" onSubmit={handleSubmit}>
        <h2>Đăng nhập</h2>
        <input
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="Username"
          autoFocus
        />
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Password"
        />
        <button type="submit" disabled={loading}>{loading ? "Đang đăng nhập..." : "Đăng nhập"}</button>
        <p>
          Bạn chưa có tài khoản? <Link to="/register">Đăng Ký Tại đây</Link>
        </p>
      </form>
    </div>
  );
}
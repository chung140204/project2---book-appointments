import { useState } from "react";
import "../FormAuth.css";
import { Link, useNavigate } from "react-router-dom";


export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [gmail, setGmail] = useState("");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("http://localhost:5000/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, gmail, phone, name }),
    });
    const data = await res.json();
    if (data.success) {
        alert("Đăng ký thành công! Vui lòng đăng nhập.");
        navigate("/login"); 
    } else {
      alert(data.message);
    }
  };

  return (
    <div className="form-auth-outer">
      <form className="form-auth-container" onSubmit={handleSubmit}>
        <h2>Đăng ký</h2>
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
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Họ Tên"
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
        <button type="submit">Đăng ký</button>
        <p>
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </p>
      </form>
    </div>
  );
}
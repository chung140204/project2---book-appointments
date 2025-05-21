import { useState, useEffect } from "react";
import "../BookForm.css";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';

const iconStyle = {
  fontSize: 20,
  marginRight: 10,
  color: '#7c5fe6',
  minWidth: 24
};

export default function BookAppointment({ user }) {
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [service, setService] = useState("");
  const [myAppointments, setMyAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [description, setDescription] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`http://localhost:5000/api/appointments?user_id=${user.id}&limit=100`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setMyAppointments(data.appointments);
      });
  }, [user.id]);

  useEffect(() => {
    fetch('http://localhost:5000/api/services')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setServices(data);
      });
  }, []);

  useEffect(() => {
    setName(user?.name || "");
    setPhone(user?.phone || "");
  }, [user?.name, user?.phone]);

  // Hàm format date và time chuẩn hóa dữ liệu gửi lên backend
  const formatDate = (date) => {
    // Đảm bảo date là YYYY-MM-DD
    return new Date(date).toISOString().slice(0, 10);
  };
  const formatTime = (time) => {
    // Đảm bảo time là HH:mm:ss
    return time.length === 5 ? time + ':00' : time;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Kiểm tra họ tên
    if (!name || name.length < 2) {
      toast.error("Họ tên không hợp lệ!");
      return;
    }
    // Kiểm tra số điện thoại
    if (!/^0[0-9]{9,10}$/.test(phone)) {
      toast.error("Số điện thoại không hợp lệ!");
      return;
    }
    // Kiểm tra ngày
    const inputDateObj = new Date(date);
    const year = inputDateObj.getFullYear();
    if (!date || inputDateObj < new Date(new Date().toDateString()) || year < 2020 || year > 2100) {
      toast.error("Ngày không hợp lệ hoặc đã qua! (Chỉ cho phép năm từ 2020 đến 2100)");
      return;
    }
    // Kiểm tra dịch vụ
    if (!service) {
      toast.error("Vui lòng chọn dịch vụ!");
      return;
    }
    // Kiểm tra trùng lịch
    const isDuplicate = myAppointments.some(a =>
      a.date === date &&
      a.time === time &&
      a.service === service &&
      a.status !== "cancelled" && a.status !== "rejected"
    );
    if (isDuplicate) {
      toast.error("Bạn đã đặt lịch trùng ngày, giờ và dịch vụ này!");
      return;
    }
    const res = await fetch("http://localhost:5000/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: user.id,
        name,
        phone,
        date: formatDate(date),
        time: formatTime(time),
        service,
        description,
      }),
    });
    const data = await res.json();
    if (data.success) {
      toast.success("Đặt lịch thành công!");
      setTimeout(() => navigate("/my-appointments"), 1200);
    } else {
      toast.error(data.message || "Lỗi đặt lịch!");
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
      <div style={{
        background: "#fff",
        borderRadius: 18,
        boxShadow: "0 2px 16px rgba(161,140,209,0.10)",
        padding: "40px 32px 32px 32px",
        minWidth: 340,
        maxWidth: 700,
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginTop: 0,
        marginBottom: 32,
      }}>
        {/* Icon lịch lớn phía trên */}
        <div style={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 38,
          color: "#fff",
          fontWeight: 700,
          marginBottom: 18
        }}>
          <span role="img" aria-label="calendar">📅</span>
        </div>
        <h2 style={{ color: "#7c5fe6", marginBottom: 28, fontWeight: 700, fontSize: 26 }}>Đặt lịch hẹn</h2>
        <form style={{ width: "100%" }} onSubmit={handleSubmit}>
          <label style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
            <span style={iconStyle}>👤</span>
            <input
              type="text"
              value={name}
              placeholder="Họ và tên"
              required
              readOnly
              style={{ flex: 1, padding: 12, borderRadius: 8, border: '1px solid #d1d1d1', fontSize: 16, background: '#f5f5f5', color: '#888' }}
            />
          </label>
          <label style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
            <span style={iconStyle}>📱</span>
            <input
              type="tel"
              value={phone}
              placeholder="Số điện thoại"
              required
              readOnly
              style={{ flex: 1, padding: 12, borderRadius: 8, border: '1px solid #d1d1d1', fontSize: 16, background: '#f5f5f5', color: '#888' }}
            />
          </label>
          <label style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
            <span style={iconStyle}>📅</span>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              required
              style={{ flex: 1, padding: 12, borderRadius: 8, border: '1px solid #d1d1d1', fontSize: 16 }}
            />
          </label>
          <label style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
            <span style={iconStyle}>⏰</span>
            <input
              type="time"
              value={time}
              onChange={e => setTime(e.target.value)}
              required
              style={{ flex: 1, padding: 12, borderRadius: 8, border: '1px solid #d1d1d1', fontSize: 16 }}
            />
          </label>
          <label style={{ display: "flex", alignItems: "center", marginBottom: 24 }}>
            <span style={iconStyle}>🛠️</span>
            <select
              value={service}
              onChange={e => setService(e.target.value)}
              required
              style={{ flex: 1, padding: 12, borderRadius: 8, border: '1px solid #d1d1d1', fontSize: 16 }}
            >
              <option value="">Chọn dịch vụ</option>
              {services.map(s => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>
          </label>
          <label style={{ display: "flex", alignItems: "center", marginBottom: 18 }}>
            <span style={iconStyle}>📝</span>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Mô tả thêm (tuỳ chọn)"
              rows={3}
              style={{ flex: 1, width: '100%', padding: 12, borderRadius: 8, border: '1px solid #d1d1d1', fontSize: 16, resize: 'vertical' }}
            />
          </label>
          <button type="submit" style={{
            width: "100%",
            padding: 14,
            background: "linear-gradient(90deg, #a18cd1 0%, #6dd5fa 100%)",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontSize: 18,
            fontWeight: 700,
            cursor: "pointer",
            marginTop: 8,
            marginBottom: 8,
            transition: "background 0.2s, color 0.2s"
          }}>Đặt lịch</button>
        </form>
      </div>
    </div>
  );
}
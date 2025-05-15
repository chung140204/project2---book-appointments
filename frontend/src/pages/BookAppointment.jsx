import { useState, useEffect } from "react";
import "../BookForm.css";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';

export default function BookAppointment({ user }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [service, setService] = useState("");
  const [myAppointments, setMyAppointments] = useState([]);
  const [services, setServices] = useState([]);
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

  // Hàm đăng xuất
  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.replace("/login"); // dùng replace để không quay lại được trang admin
  };

  return (
    <div className="book-form-outer">
      <button
        onClick={() => navigate('/dashboard')}
        style={{
          position: 'absolute',
          top: 30,
          left: 40,
          padding: '10px 24px',
          background: 'linear-gradient(90deg, #a18cd1 0%, #fbc2eb 100%)',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          fontWeight: 'bold',
          fontSize: '16px',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(161,140,209,0.2)'
        }}
      >
        Quay lại Dashboard
      </button>
      <button
        onClick={handleLogout}
        style={{
          position: 'absolute',
          top: 30,
          right: 40,
          padding: '10px 24px',
          background: 'linear-gradient(90deg, #a18cd1 0%, #fbc2eb 100%)',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          fontWeight: 'bold',
          fontSize: '16px',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(161,140,209,0.2)'
        }}
      >
        Đăng xuất
      </button>
      <form className="book-form-container" onSubmit={handleSubmit}>
        <h2>Đặt lịch hẹn</h2>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Họ và tên"
          required
        />
        <input
          value={phone}
          onChange={e => setPhone(e.target.value)}
          placeholder="Số điện thoại"
          type="tel"
          // pattern="0[0-9]{9,10}"
          required
        />
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          required
        />
        <input
          type="time"
          value={time}
          onChange={e => setTime(e.target.value)}
          required
        />
        <select
          value={service}
          onChange={e => setService(e.target.value)}
          required
        >
          <option value="">Chọn dịch vụ</option>
          {services.map(s => (
            <option key={s.id} value={s.name}>{s.name}</option>
          ))}
        </select>
        <button type="submit">Đặt lịch</button>
      </form>
    </div>
  );
}
import { useEffect, useState } from "react";
import "../MyAppointments.css";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

export default function MyAppointments({ user }) {
  const [appointments, setAppointments] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 4;
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  useEffect(() => {
    fetch(`http://localhost:5000/api/appointments?user_id=${user.id}&page=${page}&limit=${limit}&search=${encodeURIComponent(search)}&status=${filterStatus}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setAppointments(data.appointments);
        setTotal(data.total);
      });
  }, [user.id, page, search, filterStatus]);
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/login"
  };

  const handleCancel = id => {
    Swal.fire({
      title: 'Bạn chắc chắn muốn hủy lịch này?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Hủy lịch',
      cancelButtonText: 'Không',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`http://localhost:5000/api/appointments/${id}`, { method: "DELETE" })
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              toast.success("Đã hủy lịch!");
              setAppointments(appointments => appointments.filter(a => a.id !== id));
            } else {
              toast.error(data.message || "Lỗi hủy lịch!");
            }
          })
          .catch(() => toast.error("Lỗi kết nối server!"));
      }
    });
  };

  // Hàm format ngày/thời gian cho đẹp
  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    // Định dạng dd/MM/yyyy
    return d.toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit', year: 'numeric' });
  };
  const formatTime = (timeStr) => {
    // Định dạng HH:mm
    return timeStr?.slice(0,5);
  };
  const totalPages = Math.ceil(total / limit);
  function getPageNumbers(current, total) {
    const delta = 2; // Số trang lân cận mỗi bên
    const range = [];
    for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
      range.push(i);
    }
    if (current - delta > 2) range.unshift("...");
    if (current + delta < total - 1) range.push("...");
    range.unshift(1);
    if (total > 1) range.push(total);
    return range.filter((v, i, arr) => arr.indexOf(v) === i); // Loại trùng
  }

  return (
    <div className="my-appointments-container">
      <div className="my-appointments-header">
  <div className="my-appointments-title">Lịch hẹn của tôi</div>
  <div className="my-appointments-actions">
    <button className="nav-btn" onClick={() => navigate("/dashboard")}>Quay lại Dashboard</button>
    <button className="nav-btn" onClick={() => navigate("/book")}>Đặt lịch mới</button>
    <button className="nav-btn" onClick={handleLogout}>Đăng xuất</button>
  </div>
</div>
      <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
        <input
          type="text"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="Tìm kiếm theo tên, SĐT, dịch vụ..."
          style={{ width: 220, padding: 8, borderRadius: 6, border: '1.5px solid #a18cd1', fontSize: 15 }}
        />
        <select
          value={filterStatus}
          onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
          style={{ padding: 8, borderRadius: 6, fontSize: 15 }}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="pending">Chờ duyệt</option>
          <option value="confirmed">Đã xác nhận</option>
          <option value="rejected">Đã từ chối</option>
          <option value="cancelled">Đã hủy</option>
        </select>
      </div>
      <table className="my-appointments-table">
        <thead>
          <tr>
            <th>Ngày</th>
            <th>Giờ</th>
            <th>Dịch vụ</th>
            <th>Họ tên</th>
            <th>SĐT</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map(a => (
            <tr key={a.id}>
              <td>{formatDate(a.date)}</td>
              <td>{formatTime(a.time)}</td>
              <td>{a.service}</td>
              <td>{a.name || "-"}</td>
              <td>{a.phone || "-"}</td>
              <td>
                <span className={
                  a.status === "confirmed"
                    ? "status-confirmed"
                    : a.status === "rejected"
                    ? "status-rejected"
                    : a.status === "cancelled"
                    ? "status-cancelled"
                    : "status-pending"
                }>
                  {a.status === "confirmed"
                    ? "Đã xác nhận"
                    : a.status === "rejected"
                    ? "Đã từ chối"
                    : a.status === "cancelled"
                    ? "Đã hủy"
                    : "Chờ duyệt"}
                </span>
              </td>
              <td>
                {(a.status !== "cancelled" && a.status !== "rejected") && (
                  <button className="cancel-btn" onClick={() => handleCancel(a.id)}>
                    Hủy
                  </button>
                )}
              </td>
            </tr>
          ))}
          {appointments.length === 0 && (
            <tr>
              <td colSpan={7} style={{textAlign: "center", color: "#888"}}>Không có lịch hẹn nào.</td>
            </tr>
          )}
        </tbody>
      </table>
      <div style={{ textAlign: "center", marginTop: 20, display: "flex", justifyContent: "center", gap: 4 }}>
        <button
          className="nav-btn"
          onClick={() => setPage(page - 1)}
          disabled={page === 1}
          style={{ minWidth: 36 }}
        >
          &lt;
        </button>
        {getPageNumbers(page, totalPages).map((num, idx) =>
          num === "..." ? (
            <span key={idx} style={{ display: "inline-block", minWidth: 36, textAlign: "center" }}>...</span>
          ) : (
            <button
              key={num}
              className="nav-btn"
              style={{
                minWidth: 36,
                background: num === page ? "#222" : "#fff",
                color: num === page ? "#fff" : "#222",
                border: num === page ? "2px solid #a18cd1" : "1px solid #ccc",
                fontWeight: num === page ? "bold" : "normal",
              }}
              onClick={() => setPage(num)}
              disabled={num === page}
            >
              {num}
            </button>
          )
        )}
        <button
          className="nav-btn"
          onClick={() => setPage(page + 1)}
          disabled={page === totalPages || totalPages === 0}
          style={{ minWidth: 36 }}
        >
          &gt;
        </button>
      </div>
    </div>
  );
}
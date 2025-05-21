import { useEffect, useState } from "react";
import "../MyAppointments.css";
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

export default function MyAppointments({ user }) {
  const [appointments, setAppointments] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 4;
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

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatTime = (timeStr) => {
    return timeStr?.slice(0,5);
  };

  const totalPages = Math.ceil(total / limit);

  function getPageNumbers(current, total) {
    const delta = 2;
    const range = [];
    for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
      range.push(i);
    }
    if (current - delta > 2) range.unshift("...");
    if (current + delta < total - 1) range.push("...");
    range.unshift(1);
    if (total > 1) range.push(total);
    return range.filter((v, i, arr) => arr.indexOf(v) === i);
  }

  return (
    <div style={{
      minHeight: "calc(100vh - 120px)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "32px 0 40px 0",
    }}>
      <div style={{
        background: "#fff",
        borderRadius: 18,
        boxShadow: "0 2px 16px rgba(161,140,209,0.10)",
        padding: "40px 32px 32px 32px",
        minWidth: 340,
        maxWidth: 1100,
        width: "100%",
        marginTop: 32,
        marginBottom: 32,
      }}>
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ color: "#7c5fe6", margin: 0, fontSize: 24 }}>Lịch hẹn của tôi</h2>
        </div>

        <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Tìm kiếm theo tên, SĐT, dịch vụ..."
            style={{ 
              width: 220, 
              padding: 8, 
              borderRadius: 6, 
              border: '1.5px solid #a18cd1', 
              fontSize: 15 
            }}
          />
          <select
            value={filterStatus}
            onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
            style={{ 
              padding: 8, 
              borderRadius: 6, 
              fontSize: 15,
              border: '1.5px solid #a18cd1',
              minWidth: 160
            }}
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
                    <button 
                      className="cancel-btn" 
                      onClick={() => handleCancel(a.id)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 6,
                        border: "none",
                        background: "black",
                        color: "white",
                        cursor: "pointer",
                        fontSize: 14
                      }}
                    >
                      Hủy
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {appointments.length === 0 && (
              <tr>
                <td colSpan={7} style={{textAlign: "center", color: "#888", padding: "24px 0"}}>
                  Không có lịch hẹn nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div style={{ 
          textAlign: "center", 
          marginTop: 24, 
          display: "flex", 
          justifyContent: "center", 
          gap: 4 
        }}>
          <button
            className="nav-btn"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            style={{ 
              minWidth: 36,
              padding: "6px 12px",
              borderRadius: 6,
              border: "1px solid #a18cd1",
              background: "white",
              cursor: page === 1 ? "not-allowed" : "pointer",
              opacity: page === 1 ? 0.5 : 1
            }}
          >
            &lt;
          </button>
          {getPageNumbers(page, totalPages).map((num, idx) =>
            num === "..." ? (
              <span key={idx} style={{ 
                display: "inline-block", 
                minWidth: 36, 
                textAlign: "center",
                padding: "6px 12px"
              }}>
                ...
              </span>
            ) : (
              <button
                key={num}
                className="nav-btn"
                style={{
                  minWidth: 36,
                  padding: "6px 12px",
                  borderRadius: 6,
                  background: num === page ? "#7c5fe6" : "white",
                  color: num === page ? "white" : "#333",
                  border: "1px solid #a18cd1",
                  cursor: num === page ? "default" : "pointer",
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
            style={{ 
              minWidth: 36,
              padding: "6px 12px",
              borderRadius: 6,
              border: "1px solid #a18cd1",
              background: "white",
              cursor: (page === totalPages || totalPages === 0) ? "not-allowed" : "pointer",
              opacity: (page === totalPages || totalPages === 0) ? 0.5 : 1
            }}
          >
            &gt;
          </button>
        </div>
      </div>
    </div>
  );
}
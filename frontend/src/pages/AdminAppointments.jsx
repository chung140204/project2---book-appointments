import React, { useEffect, useState, useCallback } from "react";
import "../AdminAppointments.css";
import { useNavigate } from "react-router-dom";
import usePagination from "../hooks/usePagination";
import { toast } from 'react-toastify';

function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [filterStatus, setFilterStatus] = useState("");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const {
    page,
    setPage,
    nextPage,
    prevPage,
    isFirstPage,
    isLastPage
  } = usePagination({
    initialPage: 1,
    totalPages,
  });

  useEffect(() => {
    let url = `http://localhost:5000/api/admin/appointments?page=${page}&limit=4`;
    if (filterStatus) url += `&status=${filterStatus}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setAppointments(data.appointments || []);
        setTotalPages(data.totalPages || 1);
      });
  }, [page, filterStatus, search]);

  const handleUpdateStatus = (id, status) => {
    fetch(`http://localhost:5000/api/admin/appointments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setAppointments(appointments =>
            appointments.map(a => a.id === id ? { ...a, status } : a)
          );
          toast.success(status === 'confirmed' ? 'Đã xác nhận lịch hẹn!' : 'Đã từ chối lịch hẹn!');
        } else {
          toast.error(data.message || 'Có lỗi xảy ra!');
        }
      });
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.replace("/login");
  };

  const handleFilterChange = useCallback(e => {
    setFilterStatus(e.target.value);
    setPage(1);
  }, [setPage]);

  const formatDate = dateStr => {
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  };
  const formatTime = timeStr => typeof timeStr === "string" && timeStr.length >= 5 ? timeStr.slice(0, 5) : `${String(new Date(timeStr).getHours()).padStart(2, '0')}:${String(new Date(timeStr).getMinutes()).padStart(2, '0')}`;

  return (
    <div className="admin-table-container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>Quản lý lịch hẹn</h2>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="service-btn" onClick={() => navigate('/admin/services')}>Quản lý dịch vụ</button>
          <button className="logout-btn" onClick={handleLogout}>Đăng xuất</button>
        </div>
      </div>
      <div style={{ marginBottom: 16 }}>
        <label>Lọc theo trạng thái: </label>
        <select
          value={filterStatus}
          onChange={handleFilterChange}
          style={{ padding: 4, borderRadius: 4, marginLeft: 8 }}
        >
          <option value="">Tất cả</option>
          <option value="pending">Đang chờ</option>
          <option value="confirmed">Đã chấp nhận</option>
          <option value="rejected">Đã từ chối</option>
        </select>
      </div>
      <input
        type="text"
        value={search}
        onChange={e => {
          setSearch(e.target.value);
          setPage(1);
        }}
        placeholder="Tìm kiếm theo tên, SĐT, dịch vụ..."
        style={{ width: '320px', margin: '0 0 16px 0', padding: 10, borderRadius: 6, border: '1.5px solid #a18cd1', fontSize: 16 }}
      />
      <table className="admin-table">
        <thead>
          <tr>
            <th>STT</th>
            <th>Họ tên</th>
            <th>SĐT</th>
            <th>Dịch vụ</th>
            <th>Ngày</th>
            <th>Giờ</th>
            <th>Trạng thái</th>
            <th>Hành động</th> 
          </tr>
        </thead>
        <tbody>
          {appointments.length === 0 ? (
            <tr>
              <td colSpan={8} style={{ color: '#888', fontStyle: 'italic' }}>Không có lịch hẹn nào</td>
            </tr>
          ) : (
            appointments.map((a, idx) => (
              <tr key={a.id}>
                <td>{(page - 1) * 4 + idx + 1}</td>
                <td>{a.name || "-"}</td>
                <td>{a.phone || "-"}</td>
                <td>{a.service || "-"}</td>
                <td>{formatDate(a.date)}</td>
                <td>{formatTime(a.time)}</td>
                <td>
                  <span className={
                    a.status === 'pending' ? 'status-pending'
                    : a.status === 'confirmed' ? 'status-confirmed'
                    : a.status === 'rejected' ? 'status-rejected'
                    : ''
                  }>
                    {a.status === 'pending' ? 'Đang chờ'
                      : a.status === 'confirmed' ? 'Đã chấp nhận'
                      : a.status === 'rejected' ? 'Đã từ chối'
                      : a.status}
                  </span>
                </td>
                <td>
                  {a.status === 'pending' ? (
                    <div className="admin-action-buttons">
                      <button className="accept-btn" onClick={() => handleUpdateStatus(a.id, 'confirmed')}>Chấp nhận</button>
                      <button className="reject-btn" onClick={() => handleUpdateStatus(a.id, 'rejected')} style={{ marginLeft: 8 }}>Từ chối</button>
                    </div>
                  ) : <span style={{ color: '#888' }}>-</span>}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <div className="pagination">
        <button disabled={isFirstPage} onClick={prevPage}>Trước</button>
        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            className={page === i + 1 ? "active" : ""}
            onClick={() => setPage(i + 1)}
            disabled={page === i + 1}
          >
            {i + 1}
          </button>
        ))}
        <button disabled={isLastPage} onClick={nextPage}>Sau</button>
      </div>
    </div>
  );
}

export default AdminAppointments;
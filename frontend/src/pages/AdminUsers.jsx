import React, { useEffect, useState } from "react";
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";
import usePagination from "../hooks/usePagination";
import Swal from 'sweetalert2';
import "../AdminUsers.css"

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [editingUser, setEditingUser] = useState(null);
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

  // Fetch danh sách user
  useEffect(() => {
    const token = localStorage.getItem("token");
    let url = `http://localhost:5000/api/admin/users?page=${page}&limit=10`;
    if (search) url += `&search=${encodeURIComponent(search)}`;

    fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setUsers(data.users);
          setTotalPages(data.totalPages);
        } else {
          toast.error(data.message || "Lỗi tải danh sách user!");
        }
      })
      .catch(() => toast.error("Lỗi kết nối server!"));
  }, [page, search]);

  // Cập nhật thông tin user
  const handleUpdateUser = async (id, data) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`http://localhost:5000/api/admin/users/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (result.success) {
      toast.success("Cập nhật thành công!");
      setUsers(users.map(u => u.id === id ? { ...u, ...data } : u));
      setEditingUser(null);
    } else {
      toast.error(result.message || "Lỗi cập nhật!");
    }
  };

  // Reset mật khẩu
  const handleResetPassword = async (id) => {
    const { value: newPassword } = await Swal.fire({
      title: 'Nhập mật khẩu mới',
      input: 'password',
      inputLabel: 'Mật khẩu mới',
      inputPlaceholder: 'Nhập mật khẩu mới',
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value || value.length < 6) {
          return 'Mật khẩu phải có ít nhất 6 ký tự!';
        }
      }
    });

    if (newPassword) {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/admin/users/${id}/reset-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ newPassword })
      });
      const result = await res.json();
      if (result.success) {
        toast.success("Reset mật khẩu thành công!");
      } else {
        toast.error(result.message || "Lỗi reset mật khẩu!");
      }
    }
  };

  // Khóa/Mở khóa user
  const handleToggleStatus = async (id, currentStatus) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`http://localhost:5000/api/admin/users/${id}/toggle-status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ isActive: !currentStatus })
    });
    const result = await res.json();
    if (result.success) {
      toast.success(currentStatus ? "Đã khóa user!" : "Đã mở khóa user!");
      setUsers(users.map(u => u.id === id ? { ...u, is_active: !currentStatus } : u));
    } else {
      toast.error(result.message || "Lỗi cập nhật trạng thái!");
    }
  };

  // Xóa user
  const handleDeleteUser = async (id) => {
    const result = await Swal.fire({
      title: 'Bạn chắc chắn muốn xóa user này?',
      text: "Không thể hoàn tác sau khi xóa!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy'
    });

    if (result.isConfirmed) {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/admin/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Xóa user thành công!");
        setUsers(users.filter(u => u.id !== id));
      } else {
        toast.error(data.message || "Lỗi xóa user!");
      }
    }
  };

  return (
    <div className="admin-users-container">
      <div className="admin-users-header">
        <h1>Quản lý người dùng</h1>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            className="back-admin-btn"
            onClick={() => navigate('/admin')}
          >
            Quay lại
          </button>
          <div className="search-box">
            <input
              type="text"
              placeholder="Tìm kiếm user..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="admin-users-table-container">
        <table className="admin-users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Họ tên</th>
              <th>Email</th>
              <th>Số điện thoại</th>
              <th>Role</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={`${user.id}-${user.username}`} className={!user.is_active ? 'user-inactive' : ''}>
                <td>{user.id}</td>
                <td>{user.username}</td>
                <td>
                  {editingUser?.id === user.id ? (
                    <input
                      type="text"
                      value={editingUser.name}
                      onChange={e => setEditingUser({ ...editingUser, name: e.target.value })}
                    />
                  ) : (
                    user.name
                  )}
                </td>
                <td>
                  {editingUser?.id === user.id ? (
                    <input
                      type="email"
                      value={editingUser.gmail}
                      onChange={e => setEditingUser({ ...editingUser, gmail: e.target.value })}
                    />
                  ) : (
                    user.gmail
                  )}
                </td>
                <td>
                  {editingUser?.id === user.id ? (
                    <input
                      type="text"
                      value={editingUser.phone}
                      onChange={e => setEditingUser({ ...editingUser, phone: e.target.value })}
                    />
                  ) : (
                    user.phone
                  )}
                </td>
                <td>
                  {editingUser?.id === user.id ? (
                    <select
                      value={editingUser.role}
                      onChange={e => setEditingUser({ ...editingUser, role: e.target.value })}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  ) : (
                    user.role
                  )}
                </td>
                <td>
                  <span className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}>
                    {user.is_active ? 'Hoạt động' : 'Đã khóa'}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    {editingUser?.id === user.id ? (
                      <>
                        <button
                          className="save-btn"
                          onClick={() => handleUpdateUser(user.id, editingUser)}
                        >
                          Lưu
                        </button>
                        <button
                          className="cancel-btn"
                          onClick={() => setEditingUser(null)}
                        >
                          Hủy
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="edit-btn"
                          onClick={() => setEditingUser(user)}
                        >
                          Sửa
                        </button>
                        <button
                          className="reset-btn"
                          onClick={() => handleResetPassword(user.id)}
                        >
                          Reset MK
                        </button>
                        <button
                          className={`toggle-btn ${user.is_active ? 'lock' : 'unlock'}`}
                          onClick={() => handleToggleStatus(user.id, user.is_active)}
                        >
                          {user.is_active ? 'Khóa' : 'Mở khóa'}
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          Xóa
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button onClick={prevPage} disabled={isFirstPage}>
          Trước
        </button>
        <span>Trang {page} / {totalPages}</span>
        <button onClick={nextPage} disabled={isLastPage}>
          Sau
        </button>
      </div>
    </div>
  );
} 
import React, { useEffect, useState } from "react";
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";

export default function AdminServices() {
  const [services, setServices] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [editing, setEditing] = useState(null);
  const [deletedIds, setDeletedIds] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  // Lấy danh sách dịch vụ
  const fetchServices = () => {
    fetch("http://localhost:5000/api/services")
      .then(res => res.json())
      .then(data => setServices(Array.isArray(data) ? data : []));
  };
  useEffect(fetchServices, []);

  // Thêm hoặc sửa dịch vụ
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !price || isNaN(price) || Number(price) <= 0) {
      toast.error("Tên và giá dịch vụ hợp lệ là bắt buộc!");
      return;
    }
    const body = { name, description, price };
    let url = "http://localhost:5000/api/services";
    let method = "POST";
    if (editing) {
      url += `/${editing.id}`;
      method = "PUT";
    }
    const token = localStorage.getItem("token");
    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      toast.success(editing ? "Đã cập nhật dịch vụ!" : "Đã thêm dịch vụ!");
      setName(""); setDescription(""); setPrice(""); setEditing(null);
      fetchServices();
    } else {
      toast.error("Có lỗi xảy ra!");
    }
  };

  // Xóa dịch vụ
  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`http://localhost:5000/api/services/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": "Bearer " + token
      }
    });
    if (res.ok) {
      toast.error("Đã xóa dịch vụ!");
      setDeletedIds(ids => [...ids, id]);
      setTimeout(fetchServices, 1000); // Sau 1s mới reload lại bảng
    } else {
      toast.error("Xóa thất bại!");
    }
  };

  // Chọn dịch vụ để sửa
  const handleEdit = (s) => {
    setEditing(s);
    setName(s.name);
    setDescription(s.description || "");
    setPrice(s.price);
  };

  // Hủy sửa
  const handleCancelEdit = () => {
    setEditing(null); setName(""); setDescription(""); setPrice("");
  };

  // Lọc dịch vụ theo từ khóa
  const filteredServices = services.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.description || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ maxWidth: 700, margin: "40px auto", background: "#fff", borderRadius: 12, boxShadow: "0 2px 12px #ccc", padding: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>Quản lý dịch vụ</h2>
        <button className="service-btn" onClick={() => navigate('/admin')}>Quay lại trang admin</button>
      </div>
      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Tìm kiếm dịch vụ..."
        style={{ width: '100%', marginBottom: 16, padding: 10, borderRadius: 6, border: '1.5px solid #a18cd1', fontSize: 16 }}
      />
      <form onSubmit={handleSubmit} className="admin-services-form" style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Tên dịch vụ" required style={{ flex: 2 }} />
        <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Mô tả" style={{ flex: 3 }} />
        <input value={price} onChange={e => setPrice(e.target.value)} placeholder="Giá" type="number" min={0} required style={{ flex: 1 }} />
        <button type="submit" className="accept-btn" style={{ flex: 1 }}>{editing ? "Cập nhật" : "Thêm"}</button>
        {editing && <button type="button" className="logout-btn" onClick={handleCancelEdit} style={{ flex: 1 }}>Hủy</button>}
      </form>
      <table className="admin-services-table">
        <thead>
          <tr style={{ background: "#f0f0f0" }}>
            <th style={{ padding: 8 }}>Tên</th>
            <th style={{ padding: 8 }}>Mô tả</th>
            <th style={{ padding: 8 }}>Giá</th>
            <th style={{ padding: 8 }}>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {filteredServices.map(s => (
            <tr key={s.id} className={deletedIds.includes(s.id) ? "service-row-deleted" : ""}>
              <td style={{ padding: 8 }}>{s.name}</td>
              <td style={{ padding: 8 }}>{s.description || "-"}</td>
              <td style={{ padding: 8 }}>{s.price}</td>
              <td style={{ padding: 8 }}>
                <div className="admin-action-buttons">
                  <button onClick={() => handleEdit(s)} className="accept-btn" style={{ marginRight: 0 }}>Sửa</button>
                  <button onClick={() => handleDelete(s.id)} className="reject-btn">Xóa</button>
                </div>
              </td>
            </tr>
          ))}
          {filteredServices.length === 0 && <tr><td colSpan={4} style={{ textAlign: "center", color: "#888" }}>Không tìm thấy dịch vụ nào.</td></tr>}
        </tbody>
      </table>
    </div>
  );
} 
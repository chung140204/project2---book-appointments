import { useEffect, useState } from "react";

export default function ServicesInfo() {
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/api/services")
      .then(res => res.json())
      .then(data => setServices(Array.isArray(data) ? data : []));
  }, []);

  const filteredServices = services.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.description || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{
      maxWidth: 800,
      margin: "40px auto",
      background: "#fff",
      borderRadius: 18,
      boxShadow: "0 4px 32px rgba(161,140,209,0.13)",
      padding: 40,
      border: '1.5px solid #e0e0e0',
      position: 'relative',
    }}>
      <h2 style={{
        color: "#7c5fe6",
        marginBottom: 32,
        fontWeight: 900,
        fontSize: 40,
        letterSpacing: 1,
        textAlign: 'center',
      }}>Thông tin dịch vụ</h2>
      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Tìm kiếm dịch vụ..."
        style={{
          width: '100%',
          marginBottom: 28,
          padding: '14px 18px',
          borderRadius: 12,
          border: '2px solid #a18cd1',
          fontSize: 17,
          background: '#f7f7fb',
          outline: 'none',
          boxSizing: 'border-box',
          transition: 'border 0.2s',
        }}
        onFocus={e => e.target.style.border = '2px solid #7c5fe6'}
        onBlur={e => e.target.style.border = '2px solid #a18cd1'}
      />
      <div style={{ overflowX: 'auto' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'separate',
          borderSpacing: 0,
          background: '#fff',
          borderRadius: 14,
          overflow: 'hidden',
          boxShadow: '0 2px 12px rgba(161,140,209,0.08)',
        }}>
          <thead>
            <tr style={{ background: "#ede7f6" }}>
              <th style={{ padding: 18, fontSize: 22, color: '#7c5fe6', fontWeight: 800, textAlign: 'left' }}>Tên</th>
              <th style={{ padding: 18, fontSize: 22, color: '#7c5fe6', fontWeight: 800, textAlign: 'left' }}>Mô tả</th>
              <th style={{ padding: 18, fontSize: 22, color: '#7c5fe6', fontWeight: 800, textAlign: 'right' }}>Giá</th>
            </tr>
          </thead>
          <tbody>
            {filteredServices.map(s => (
              <tr key={`${s.id}-${s.name}`}
                style={{ transition: 'background 0.15s' }}
                onMouseOver={e => e.currentTarget.style.background = '#f3eaff'}
                onMouseOut={e => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ padding: 14, fontSize: 16, fontWeight: 500 }}>{s.name}</td>
                <td style={{ padding: 14, fontSize: 18, fontStyle: s.description ? 'italic' : 'normal', color: '#555' }}>{s.description || "-"}</td>
                <td style={{ padding: 14, fontSize: 20, fontWeight: 800, color: '#7c5fe6', textAlign: 'right' }}>{s.price}</td>
              </tr>
            ))}
            {filteredServices.length === 0 && <tr><td colSpan={3} style={{ textAlign: "center", color: "#888", padding: 24 }}>Không tìm thấy dịch vụ nào.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
} 
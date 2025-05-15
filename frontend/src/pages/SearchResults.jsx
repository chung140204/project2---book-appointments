import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export default function SearchResults() {
  const location = useLocation();
  const query = new URLSearchParams(location.search).get("query") || "";
  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) return;
    setLoading(true);
    Promise.all([
      fetch(`http://localhost:5000/api/appointments?search=${encodeURIComponent(query)}&limit=5`).then(r => r.json()),
      fetch(`http://localhost:5000/api/services?search=${encodeURIComponent(query)}&limit=5`).then(r => r.json()),
      fetch(`http://localhost:5000/api/users?search=${encodeURIComponent(query)}&limit=5`).then(r => r.json()),
    ]).then(([a, s, u]) => {
      setAppointments(a.appointments || []);
      setServices(Array.isArray(s) ? s : (s.services || []));
      setUsers(Array.isArray(u) ? u : (u.users || []));
      setLoading(false);
    });
  }, [query]);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", background: "#fff", borderRadius: 16, padding: 32, boxShadow: "0 2px 12px rgba(161,140,209,0.08)" }}>
      <h2 style={{ color: "#7c5fe6", marginBottom: 24 }}>Kết quả tìm kiếm cho: <span style={{ color: "#232d3b" }}>{query}</span></h2>
      {loading && <div>Đang tìm kiếm...</div>}
      {!loading && (
        <>
          <div style={{ marginBottom: 32 }}>
            <h3 style={{ color: "#a18cd1" }}>Lịch hẹn</h3>
            {appointments.length === 0 ? <div style={{ color: "#888" }}>Không có kết quả.</div> : (
              <ul>
                {appointments.map(a => (
                  <li key={a.id}>{a.name} - {a.service} - {a.date} {a.time}</li>
                ))}
              </ul>
            )}
          </div>
          <div style={{ marginBottom: 32 }}>
            <h3 style={{ color: "#a18cd1" }}>Dịch vụ</h3>
            {services.length === 0 ? <div style={{ color: "#888" }}>Không có kết quả.</div> : (
              <ul>
                {services.map(s => (
                  <li key={s.id}>{s.name} - {s.description}</li>
                ))}
              </ul>
            )}
          </div>
          <div style={{ marginBottom: 32 }}>
            <h3 style={{ color: "#a18cd1" }}>Người dùng</h3>
            {users.length === 0 ? <div style={{ color: "#888" }}>Không có kết quả.</div> : (
              <ul>
                {users.map(u => (
                  <li key={u.id}>{u.name} - {u.gmail} - {u.phone}</li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
} 
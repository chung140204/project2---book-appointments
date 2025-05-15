import React, { useState, useRef, useEffect } from "react";

export default function NotificationBell() {
  const [notifOpen, setNotifOpen] = useState(false);
  const [notification, setNotification] = useState("");
  const [lastNotified, setLastNotified] = useState(() => localStorage.getItem("lastNotified") || "");
  const [latestKey, setLatestKey] = useState("");
  const notifRef = useRef();

  // Fetch thông báo lịch hẹn
  useEffect(() => {
    let intervalId;
    const fetchAppointments = () => {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));
      const user_id = user?.id;
      fetch(`http://localhost:5000/api/appointments?user_id=${user_id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data.appointments)) {
            const latest = data.appointments
              .filter(app => app.status === "confirmed" || app.status === "rejected")
              .sort((a, b) => {
                // Ưu tiên updated_at, nếu không có thì so sánh id
                const dateA = b.updated_at ? new Date(b.updated_at) : 0;
                const dateB = a.updated_at ? new Date(a.updated_at) : 0;
                if (dateA !== dateB) return dateA - dateB;
                return b.id - a.id;
              })[0];
            if (latest) {
              // latestKey gồm id, status, updated_at để phân biệt từng lần cập nhật
              setLatestKey(`${latest.id}_${latest.status}_${latest.updated_at || ''}`);
              if (latest.status === "confirmed") {
                setNotification("Lịch hẹn của bạn đã được admin xác nhận!");
              } else if (latest.status === "rejected") {
                setNotification("Lịch hẹn của bạn đã bị từ chối.");
              } else {
                setNotification("Bạn có lịch hẹn mới được cập nhật.");
              }
            } else {
              setNotification("");
              setLatestKey("");
            }
          } else {
            setNotification("");
            setLatestKey("");
          }
        })
        .catch(() => { setNotification(""); setLatestKey(""); });
    };
    fetchAppointments();
    intervalId = setInterval(fetchAppointments, 10000);
    return () => clearInterval(intervalId);
  }, []);

  // Đóng popup khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Khi bấm vào chuông, đánh dấu đã đọc latestKey và lưu vào localStorage
  const handleBellClick = () => {
    setNotifOpen((v) => !v);
    setLastNotified(latestKey);
    localStorage.setItem("lastNotified", latestKey || "");
  };

  // Chỉ hiện dấu chấm đỏ nếu latestKey khác lastNotified
  const hasNew = latestKey && latestKey !== lastNotified;

  // DEBUG LOG
  console.log("latestKey:", latestKey, "lastNotified:", lastNotified, "notification:", notification);

  return (
    <div style={{ position: "relative" }} ref={notifRef}>
      <span
        className="material-icons"
        style={{ fontSize: 28, color: "#7c5fe6", position: "relative", cursor: "pointer" }}
        onClick={handleBellClick}
      >
        notifications
        {hasNew && (
          <span style={{
            position: "absolute",
            top: 2,
            right: 2,
            width: 12,
            height: 12,
            background: "#e53935",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: 10,
            fontWeight: "bold",
            boxShadow: "0 0 4px #e53935"
          }}>!</span>
        )}
      </span>
      {notifOpen && (
        <div
          style={{
            position: "absolute", right: 0, top: 36, background: "#fff", boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
            borderRadius: 8, minWidth: 220, zIndex: 10, padding: "16px 0",
            cursor: "pointer"
          }}
          onClick={() => setNotifOpen(false)}
        >
          <div style={{ color: notification.includes("xác nhận") ? "#43a047" : notification.includes("từ chối") ? "#e53935" : "#888", fontWeight: 600, fontSize: 20, padding: "8px 20px" }}>
            {notification || "Không có thông báo mới."}
          </div>
        </div>
      )}
    </div>
  );
}

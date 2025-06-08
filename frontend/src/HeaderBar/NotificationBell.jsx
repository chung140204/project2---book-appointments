import React, { useState, useEffect } from 'react';
import { FaBell, FaCheckCircle, FaClock, FaInfoCircle } from 'react-icons/fa';
import axios from 'axios';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

const notificationTypeIcon = (type) => {
  switch (type) {
    case 'confirmed': return <FaCheckCircle color="#43a047" style={{marginRight: 6}}/>;
    case 'reminder': return <FaClock color="#1976d2" style={{marginRight: 6}}/>;
    case 'info': return <FaInfoCircle color="#888" style={{marginRight: 6}}/>;
    default: return <FaBell color="#7c3aed" style={{marginRight: 6}}/>;
  }
};

const NotificationDropdown = ({ notifications, setNotifications, userId, type }) => {
  const [tab, setTab] = useState('all');
  const [anim, setAnim] = useState(true);

  useEffect(() => {
    setAnim(true);
    const timer = setTimeout(() => setAnim(false), 300);
    return () => clearTimeout(timer);
  }, [notifications]);

  const handleMarkRead = async (id) => {
    await axios.post('/api/notifications/mark-read', { notificationId: id });
    setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: 1 } : n));
  };
  const handleMarkAllRead = async () => {
    const unread = notifications.filter(n => !n.is_read);
    await Promise.all(unread.map(n => axios.post('/api/notifications/mark-read', { notificationId: n.id })));
    setNotifications(notifications.map(n => ({ ...n, is_read: 1 })));
  };

  const filtered = tab === 'all'
    ? notifications
    : notifications.filter(n => !n.is_read);

  const newNoti = filtered.filter(n => !n.is_read);
  const earlierNoti = filtered.filter(n => n.is_read);

  return (
    <div style={{
      position: 'absolute', right: 0, top: 36, background: '#18191a',
      color: '#fff', borderRadius: 12, minWidth: 350, zIndex: 100,
      boxShadow: '0 4px 24px rgba(0,0,0,0.25)', fontFamily: 'Segoe UI, Arial',
      animation: anim ? 'fadeIn .3s' : undefined
    }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px);} to { opacity: 1; transform: none; } }
      `}</style>
      <div style={{ padding: 16, borderBottom: '1px solid #333', fontWeight: 700, fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        Notifications
        <button onClick={handleMarkAllRead} style={{ background: 'none', border: 'none', color: '#2e89ff', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>Đánh dấu tất cả đã đọc</button>
      </div>
      <div style={{ display: 'flex', borderBottom: '1px solid #333' }}>
        <button
          onClick={() => setTab('all')}
          style={{
            flex: 1, background: tab === 'all' ? '#242526' : 'none',
            color: '#fff', border: 'none', padding: 12, fontWeight: 600, cursor: 'pointer'
          }}
        >All</button>
        <button
          onClick={() => setTab('unread')}
          style={{
            flex: 1, background: tab === 'unread' ? '#242526' : 'none',
            color: '#fff', border: 'none', padding: 12, fontWeight: 600, cursor: 'pointer'
          }}
        >Unread</button>
      </div>
      <div style={{ maxHeight: 400, overflowY: 'auto' }}>
        {newNoti.length > 0 && (
          <>
            <div style={{ padding: '8px 16px', color: '#aaa', fontSize: 13 }}>New</div>
            {newNoti.map(n => (
              <div key={n.id}
                style={{
                  display: 'flex', alignItems: 'center', padding: 12,
                  background: '#242526', borderBottom: '1px solid #222', cursor: 'pointer',
                  fontWeight: 600
                }}
                onClick={() => handleMarkRead(n.id)}
              >
                <div style={{
                  width: 38, height: 38, borderRadius: '50%',
                  background: '#3a3b3c', marginRight: 12, display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {notificationTypeIcon(n.type)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{n.title || 'Thông báo mới'}</div>
                  <div style={{ fontSize: 14 }}>{n.content}</div>
                  <div style={{ fontSize: 12, color: '#b0b3b8', marginTop: 2 }}>
                    {dayjs(n.created_at).fromNow()}
                  </div>
                </div>
                <div style={{
                  width: 10, height: 10, borderRadius: '50%',
                  background: '#2e89ff', marginLeft: 8
                }} />
              </div>
            ))}
          </>
        )}
        {earlierNoti.length > 0 && (
          <>
            <div style={{ padding: '8px 16px', color: '#aaa', fontSize: 13 }}>Earlier</div>
            {earlierNoti.map(n => (
              <div key={n.id}
                style={{
                  display: 'flex', alignItems: 'center', padding: 12,
                  background: '#18191a', borderBottom: '1px solid #222', cursor: 'pointer',
                  fontWeight: 500
                }}
              >
                <div style={{
                  width: 38, height: 38, borderRadius: '50%',
                  background: '#3a3b3c', marginRight: 12, display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {notificationTypeIcon(n.type)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500 }}>{n.title || 'Thông báo'}</div>
                  <div style={{ fontSize: 14 }}>{n.content}</div>
                  <div style={{ fontSize: 12, color: '#b0b3b8', marginTop: 2 }}>
                    {dayjs(n.created_at).fromNow()}
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
        {filtered.length === 0 && (
          <div style={{ padding: 32, color: '#888', textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🔕</div>
            {tab === 'all' ? 'Bạn đã xem hết thông báo rồi!' : 'Không có thông báo mới nào'}
            <div>
              <a href='/dat-lich' style={{ color: '#2e89ff', fontSize: 14 }}>Đặt lịch ngay</a>
            </div>
          </div>
        )}
      </div>
      <div style={{ padding: 12, textAlign: 'center', borderTop: '1px solid #222', color: '#2e89ff', cursor: 'pointer', fontWeight: 600 }}>
        See all
      </div>
    </div>
  );
};

const NotificationBell = ({ userId = 1, type = 'admin' }) => {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (showDropdown) {
      axios.get(`/api/notifications?user_id=${userId}&type=${type}`)
        .then(res => {
          if (res.data.success) setNotifications(res.data.notifications);
        });
    }
  }, [userId, type, showDropdown]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div style={{ position: 'relative' }}>
      <FaBell
        size={28}
        color="#7c3aed"
        style={{ cursor: 'pointer' }}
        onClick={() => setShowDropdown(!showDropdown)}
      />
      {unreadCount > 0 && (
        <span style={{
          position: 'absolute', top: -4, right: -4,
          background: '#ff5e9c', color: '#fff', borderRadius: '50%',
          padding: '3px 7px', fontSize: 13, fontWeight: 700
        }}>
          {unreadCount}
        </span>
      )}
      {showDropdown && (
        <NotificationDropdown
          notifications={notifications}
          setNotifications={setNotifications}
          userId={userId}
          type={type}
        />
      )}
    </div>
  );
};

export default NotificationBell;

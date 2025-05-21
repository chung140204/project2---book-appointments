import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment-timezone';
import 'moment/locale/vi';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './AdminCalendar.css';

moment.locale('vi');
const localizer = momentLocalizer(moment);

const STATUS_LABELS = {
  all: 'Tất cả',
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
};
const STATUS_COLORS = {
  pending: '#ffb300',
  confirmed: '#1976d2',
};

const mockEvents = [
  {
    id: 1,
    title: 'Khám răng - Nguyễn Văn A',
    start: new Date(2024, 3, 11, 17, 40),
    end: new Date(2024, 3, 11, 18, 10),
    status: 'pending',
    customer: 'KHÁCH VÃNG LAI',
  },
  {
    id: 2,
    title: 'Khám răng - Nguyễn Văn B',
    start: new Date(2024, 3, 11, 17, 35),
    end: new Date(2024, 3, 11, 19, 35),
    status: 'pending',
    customer: 'KHÁCH VÃNG LAI',
  },
  {
    id: 3,
    title: 'Khám răng - Nguyễn Văn C',
    start: new Date(2024, 3, 11, 17, 40),
    end: new Date(2024, 3, 11, 19, 40),
    status: 'done',
    customer: 'KHÁCH VÃNG LAI',
  },
  {
    id: 4,
    title: 'Tẩy trắng - Trần Thị B',
    start: new Date(2024, 3, 11, 17, 30),
    end: new Date(2024, 3, 11, 19, 30),
    status: 'doing',
    customer: 'Thái Mỹ Trinh',
  },
  {
    id: 5,
    title: 'Cạo vôi - Huỳnh Tiết Mạn',
    start: new Date(2024, 3, 11, 16, 55),
    end: new Date(2024, 3, 11, 19, 5),
    status: 'done',
    customer: 'Huỳnh Tiết Mạn',
  },
  {
    id: 6,
    title: 'Nhổ răng - Chị Mẫn',
    start: new Date(2024, 3, 11, 17, 10),
    end: new Date(2024, 3, 11, 19, 10),
    status: 'cancelled',
    customer: 'Chị Mẫn',
  },
];

function isSameDay(d1, d2) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

const WORK_START = 8; // 8:00
const WORK_END = 17;  // 17:00

const AdminCalendar = () => {
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentView, setCurrentView] = useState('month');

  useEffect(() => {
    fetch('http://localhost:5000/api/public-appointments')
      .then(res => res.json())
      .then(data => {
        console.log('API trả về:', data.appointments);
        if (data.success) {
          setEvents(data.appointments.map(ev => {
            const dateStr = ev.date ? ev.date.slice(0, 10) : '';
            const timeStr = ev.time ? ev.time : '08:00:00';
            // Parse local time tránh lệch múi giờ
            const [year, month, day] = dateStr.split('-').map(Number);
            const [h, m, s] = timeStr.split(':').map(Number);
            const start = moment.tz(`${dateStr} ${timeStr}`, 'YYYY-MM-DD HH:mm:ss', 'Asia/Ho_Chi_Minh').toDate();
            const blockEnd = `${String(h+1).padStart(2, '0')}:00:00`;
            const end = moment.tz(`${dateStr} ${blockEnd}`, 'YYYY-MM-DD HH:mm:ss', 'Asia/Ho_Chi_Minh').toDate();
            if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;
            return {
              ...ev,
              title: `${ev.service}${ev.name ? ' - ' + ev.name : ''}`,
              start,
              end,
              customer: ev.name,
              status: ev.status
            };
          }).filter(Boolean));
        }
      })
      .catch(err => console.error('Error fetching appointments:', err));
  }, []);

  // Danh sách lịch hẹn của ngày được chọn
  const dayEvents = useMemo(() => {
    return events.filter(ev => isSameDay(ev.start, selectedDate));
  }, [events, selectedDate]);

  // Đếm số lượng theo trạng thái
  const statusCount = useMemo(() => {
    const count = { all: dayEvents.length };
    Object.keys(STATUS_LABELS).forEach(st => {
      if (st !== 'all') count[st] = dayEvents.filter(ev => ev.status === st).length;
    });
    return count;
  }, [dayEvents]);

  // Danh sách hiển thị theo filter
  const filteredEvents = useMemo(() => {
    if (statusFilter === 'all') return dayEvents;
    return dayEvents.filter(ev => ev.status === statusFilter);
  }, [dayEvents, statusFilter]);

  // Tạo map ngày -> status
  const dayStatusMap = useMemo(() => {
    const map = {};
    events.forEach(ev => {
      const key = moment(ev.start).format('YYYY-MM-DD');
      // Ưu tiên pending > confirmed
      if (ev.status === 'pending') map[key] = 'pending';
      else if (ev.status === 'confirmed' && map[key] !== 'pending') map[key] = 'confirmed';
    });
    return map;
  }, [events]);

  // Custom màu cho từng ngày
  const dayPropGetter = date => {
    const key = moment(date).format('YYYY-MM-DD');
    if (dayStatusMap[key] === 'pending') {
      return { style: { backgroundColor: '#ffecb3' } }; // vàng nhạt
    }
    if (dayStatusMap[key] === 'confirmed') {
      return { style: { backgroundColor: '#bbdefb' } }; // xanh dương nhạt
    }
    return {}; // ngày trống
  };

  const eventStyleGetter = (event) => {
    let backgroundColor = '#3174ad';
    if (event.status === 'pending') backgroundColor = '#ffb300'; // vàng
    if (event.status === 'confirmed') backgroundColor = '#1976d2'; // xanh dương
    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block',
      },
    };
  };

  const EmptyEvent = () => <></>;

  return (
    <div className="admin-calendar-2col">
      {/* Cột trái: Lịch */}
      <div className="calendar-left">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          eventPropGetter={eventStyleGetter}
          dayPropGetter={dayPropGetter}
          views={['month', 'week', 'day']}
          defaultView="month"
          min={new Date(1970, 1, 1, WORK_START, 0)} // 8:00
          max={new Date(1970, 1, 1, WORK_END, 0)}   // 17:00
          messages={{
            next: "Tiếp",
            previous: "Trước",
            today: "Hôm nay",
            month: "Tháng",
            week: "Tuần",
            day: "Ngày"
          }}
          onSelectSlot={slot => setSelectedDate(slot.start)}
          selectable
          onSelectEvent={event => {
            setSelectedDate(event.start);
            setCurrentView('day');
          }}
          date={selectedDate}
          onNavigate={date => setSelectedDate(date)}
          onView={view => setCurrentView(view)}
          view={currentView}
          components={{
            event: currentView === 'week' ? EmptyEvent : undefined
          }}
        />
      </div>
      {/* Cột phải: Danh sách lịch hẹn */}
      <div className="calendar-right">
        <div className="calendar-right-header">
          <div className="calendar-right-title">
            LỊCH HẸN NGÀY {moment(selectedDate).format('DD-MM-YYYY')}
          </div>
          <div className="calendar-status-filter">
            {Object.keys(STATUS_LABELS).map(st => (
              <button
                key={st}
                className={`status-filter-btn${statusFilter === st ? ' active' : ''}`}
                style={st !== 'all' ? { background: STATUS_COLORS[st], color: '#fff' } : {}}
                onClick={() => setStatusFilter(st)}
              >
                {STATUS_LABELS[st]}: {statusCount[st] || 0}
              </button>
            ))}
          </div>
        </div>
        <div className="calendar-right-list">
          {/* Không hiển thị bảng slot nữa, chỉ hiển thị lịch react-big-calendar */}
          {/* Các event sẽ được tô màu theo trạng thái nhờ eventStyleGetter */}
        </div>
        <div style={{ marginTop: 8 }}>
          <span style={{ background: '#ffecb3', padding: '2px 8px', borderRadius: 4, marginRight: 8 }}>Chờ xác nhận</span>
          <span style={{ background: '#bbdefb', padding: '2px 8px', borderRadius: 4, marginRight: 8 }}>Đã xác nhận</span>
          <span style={{ border: '1px solid #ccc', padding: '2px 8px', borderRadius: 4 }}>Trống: Có thể đặt lịch</span>
          
        </div>
        <span style={{ float: 'right', marginTop: 8 }}>Thời gian làm việc: 8:00 - 17:00</span>
      </div>
    </div>
  );
};

export default AdminCalendar; 
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

console.log('App.js is running...');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Route test
app.get('/', (req, res) => {
  res.send('API is running!');
});

// Đăng ký
app.post('/api/register', (req, res) => {
  const { username, password, gmail, phone, name } = req.body;
  // Bỏ mã hóa, lưu password dạng plain text
  db.query(
    'INSERT INTO users (username, password, gmail, phone, name) VALUES (?, ?, ?, ?, ?)',
    [username, password, gmail, phone, name],
    (err, result) => {
      if (err) {
        console.log('Lỗi đăng ký:', err);
        return res.json({ success: false, message: 'Lỗi đăng ký!' });
      }
      res.json({ success: true });
    }
  );
});

// Đăng nhập
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  db.query(
    'SELECT * FROM users WHERE username = ?',
    [username],
    (err, results) => {
      if (err || results.length === 0) {
        console.log('Lỗi đăng nhập:', err);
        return res.json({ success: false, message: 'Sai tài khoản!' });
      }
      const user = results[0];
      // Kiểm tra trạng thái hoạt động
      if (user.is_active === 0 || user.is_active === false) {
        return res.json({ success: false, message: 'Tài khoản đã bị khóa!' });
      }
      // So sánh plain text
      if (password !== user.password) return res.json({ success: false, message: 'Sai mật khẩu!' });
      const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, 'secret', { expiresIn: '1d' });
      res.json({ success: true, token, user: { id: user.id, username: user.username, gmail: user.gmail, phone: user.phone, name: user.name, role: user.role } });
    }
  );
});

// Đặt lịch hẹn
app.post('/api/appointments', (req, res) => {
  const { user_id, name, phone, date, time, service, description } = req.body;
  // Validate dữ liệu đầu vào
  if (!name || name.length < 2) {
    return res.json({ success: false, message: 'Họ tên không hợp lệ!' });
  }
  if (!phone || !/^0[0-9]{9,10}$/.test(phone)) {
    return res.json({ success: false, message: 'Số điện thoại không hợp lệ!' });
  }
  // Kiểm tra ngày không phải quá khứ
  const today = new Date();
  today.setHours(0,0,0,0);
  const inputDate = new Date(date);
  if (!date || isNaN(inputDate.getTime()) || inputDate < today) {
    return res.json({ success: false, message: 'Ngày không hợp lệ hoặc đã qua!' });
  }
  if (!time) {
    return res.json({ success: false, message: 'Giờ không hợp lệ!' });
  }
  // === GIỚI HẠN THỜI GIAN ĐẶT LỊCH ===
  const now = new Date();
  const [h, m] = time.split(':').map(Number);
  const bookingDateTime = new Date(inputDate);
  bookingDateTime.setHours(h, m, 0, 0);
  // Chỉ cho phép đặt trong khung 8h00 đến trước 17h00
  if (h < 8 || h >= 17) {
    return res.json({ success: false, message: 'Chỉ được đặt lịch từ 08:00 đến 17:00 (block cuối cùng là 16:00–17:00)!' });
  }
  // Đặt trước ít nhất 1 giờ
  if (bookingDateTime - now < 60 * 60 * 1000) {
    return res.json({ success: false, message: 'Bạn phải đặt lịch trước ít nhất 1 giờ!' });
  }
  // Không cho đặt quá xa (sau 7 ngày)
  const maxAdvance = 7;
  const maxDate = new Date(now);
  maxDate.setDate(now.getDate() + maxAdvance);
  if (bookingDateTime > maxDate) {
    return res.json({ success: false, message: `Bạn chỉ có thể đặt lịch trong vòng ${maxAdvance} ngày tới!` });
  }
  // Kiểm tra mỗi user chỉ đặt 1 lịch mỗi ngày
  db.query(
    `SELECT COUNT(*) as count FROM appointments 
     WHERE DATE(date) = ? AND user_id = ? AND status IN ('pending', 'confirmed')`,
    [date.slice(0, 10), user_id],
    (err, results) => {
      if (err) return res.json({ success: false, message: 'Lỗi kiểm tra lịch!' });
      if (results[0].count >= 1) {
        return res.json({ success: false, message: 'Bạn chỉ có thể đặt 1 lịch mỗi ngày!' });
      }
      // Kiểm tra dịch vụ hợp lệ (lấy từ DB)
      db.query('SELECT name FROM services', (err, results) => {
        if (err) return res.json({ success: false, message: 'Lỗi kiểm tra dịch vụ!' });
        const validServices = results.map(s => s.name);
        if (!service || !validServices.includes(service)) {
          return res.json({ success: false, message: 'Dịch vụ không hợp lệ!' });
        }
        // Chia block 1 tiếng từ 8h đến 17h
        const blockStart = `${String(h).padStart(2, '0')}:00:00`;
        const blockEnd = `${String(h+1).padStart(2, '0')}:00:00`;
        db.query(
          `SELECT * FROM appointments 
           WHERE DATE(date) = ? AND status IN ('pending', 'confirmed')
           AND time >= ? AND time < ?`,
          [date.slice(0,10), blockStart, blockEnd],
          (err, results) => {
            if (err) return res.json({ success: false, message: 'Lỗi kiểm tra trùng lịch!' });
            if (results.length > 0) {
              return res.json({ success: false, message: `Khung giờ ${blockStart}–${blockEnd} đã có người đặt, vui lòng chọn thời gian khác!` });
            }
            // Insert lịch mới
            db.query(
              'INSERT INTO appointments (user_id, name, phone, date, time, service, description, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
              [user_id, name, phone, date, time, service, description || '', 'pending'],
              (err, result) => {
                if (err) {
                  console.log('Lỗi đặt lịch:', err);
                  return res.json({ success: false, message: 'Lỗi đặt lịch!' });
                }
                // Gửi thông báo cho admin (user_id=9) với format: '[Tên] vừa đặt lịch hẹn vào [dd/mm/yyyy] lúc [hh:mm]'
                const dateStr = new Date(date).toLocaleDateString('vi-VN');
                const timeStr = time.slice(0,5); // Lấy hh:mm
                const content = `${name} vừa đặt lịch hẹn vào ${dateStr} lúc ${timeStr}`;
                db.query(
                  'INSERT INTO notifications (user_id, type, content) VALUES (?, ?, ?)',
                  [9, 'admin', content]
                );
                res.json({ success: true });
              }
            );
          }
        );
      });
    }
  );
});

// Xem lịch hẹn của user
app.get('/api/appointments', (req, res) => {
  const { user_id, page = 1, limit = 5, search = '', status = '' } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  let where = 'WHERE user_id = ?';
  let params = [user_id];

  if (status) {
    where += ' AND status = ?';
    params.push(status);
  }
  if (search) {
    where += ' AND (name LIKE ? OR phone LIKE ? OR service LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  // Đếm tổng số lịch hẹn sau khi lọc
  const countQuery = `SELECT COUNT(*) as total FROM appointments ${where}`;
  db.query(countQuery, params, (err, countResult) => {
    if (err) {
      console.log('Lỗi truy vấn:', err);
      return res.json({ success: false, message: 'Lỗi truy vấn!' });
    }
    const total = countResult[0].total;

    // Lấy dữ liệu phân trang
    const dataQuery = `SELECT * FROM appointments ${where} ORDER BY updated_at DESC, id DESC LIMIT ? OFFSET ?`;
    db.query(dataQuery, [...params, parseInt(limit), offset], (err, results) => {
      if (err) {
        console.log('Lỗi truy vấn:', err);
        return res.json({ success: false, message: 'Lỗi truy vấn!' });
      }
      res.json({ success: true, appointments: results, total });
    });
  });
});

// Hủy lịch hẹn
app.delete('/api/appointments/:id', (req, res) => {
  const { id } = req.params;
  db.query(
    'DELETE FROM appointments WHERE id = ?',
    [id],
    (err, result) => {
      if (err) {
        console.log('Lỗi hủy lịch:', err);
        return res.json({ success: false, message: 'Lỗi hủy lịch!' });
      }
      res.json({ success: true });
    }
  );
});

// Lấy tất cả lịch hẹn (admin, hỗ trợ tìm kiếm & phân trang đúng)
app.get('/api/admin/appointments', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const status = req.query.status;
  const search = req.query.search;

  let where = 'WHERE 1=1';
  let params = [];

  if (status) {
    where += ' AND status = ?';
    params.push(status);
  }
  if (search) {
    where += ' AND (name LIKE ? OR phone LIKE ? OR service LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  // Đếm tổng số dòng sau khi lọc
  const countQuery = `SELECT COUNT(*) as total FROM appointments ${where}`;
  db.query(countQuery, params, (err, countResult) => {
    if (err) return res.json({ success: false });
    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);

    // Lấy dữ liệu phân trang
    const dataQuery = `SELECT * FROM appointments ${where} ORDER BY date DESC, time DESC LIMIT ? OFFSET ?`;
    db.query(dataQuery, [...params, limit, offset], (err, results) => {
      if (err) return res.json({ success: false });
      res.json({
        success: true,
        appointments: results,
        total,
        page,
        totalPages
      });
    });
  });
});

// Admin duyệt hoặc từ chối lịch hẹn
app.put('/api/admin/appointments/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // status: 'confirmed' hoặc 'rejected'
  if (!['confirmed', 'rejected'].includes(status)) {
    return res.json({ success: false, message: 'Trạng thái không hợp lệ!' });
  }
  db.query(
    'UPDATE appointments SET status = ?, updated_at = NOW() WHERE id = ?',
    [status, id],
    (err, result) => {
      if (err) {
        console.log('Lỗi cập nhật trạng thái:', err);
        return res.json({ success: false, message: 'Lỗi cập nhật!' });
      }
      // Lấy thông tin lịch hẹn để gửi thông báo cho user
      db.query('SELECT * FROM appointments WHERE id = ?', [id], (err2, results) => {
        if (!err2 && results.length > 0) {
          const appt = results[0];
          const dateStr = new Date(appt.date).toLocaleDateString('vi-VN');
          let content = '';
          if (status === 'confirmed') {
            content = `Lịch hẹn ngày ${dateStr} lúc ${appt.time} đã được xác nhận!`;
          } else {
            content = `Lịch hẹn ngày ${dateStr} lúc ${appt.time} đã bị từ chối.`;
          }
          db.query(
            'INSERT INTO notifications (user_id, type, content) VALUES (?, ?, ?)',
            [appt.user_id, 'user', content],
            (err3) => {
              if (err3) console.log('Lỗi insert notification:', err3);
              else console.log('Đã insert notification cho user:', appt.user_id);
            }
          );
        } else {
          console.log('Không tìm thấy lịch hẹn để gửi thông báo cho user');
        }
        res.json({ success: true });
      });
    }
  );
});

// Middleware xác thực JWT
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });
  jwt.verify(token, 'secret', (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
}

// Middleware kiểm tra quyền admin
function isAdmin(req, res, next) {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Not allowed' });
  next();
}

// ==== API QUẢN LÝ DỊCH VỤ ====
// Lấy danh sách dịch vụ (ai cũng xem được)
app.get('/api/services', (req, res) => {
  db.query('SELECT * FROM services', (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// Thêm dịch vụ (chỉ admin)
app.post('/api/services', verifyToken, isAdmin, (req, res) => {
  const { name, description, price } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Tên dịch vụ là bắt buộc' });
  }
  const finalPrice = price && !isNaN(price) && Number(price) > 0 ? price : 0;
  db.query('INSERT INTO services (name, description, price) VALUES (?, ?, ?)', [name, description, finalPrice], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ id: result.insertId, name, description, price: finalPrice });
  });
});

// Sửa dịch vụ (chỉ admin)
app.put('/api/services/:id', verifyToken, isAdmin, (req, res) => {
  const { id } = req.params;
  const { name, description, price } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Tên dịch vụ là bắt buộc' });
  }
  const finalPrice = price && !isNaN(price) && Number(price) > 0 ? price : 0;
  db.query('UPDATE services SET name=?, description=?, price=? WHERE id=?', [name, description, finalPrice, id], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ id, name, description, price: finalPrice });
  });
});

// Xóa dịch vụ (chỉ admin)
app.delete('/api/services/:id', verifyToken, isAdmin, (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM services WHERE id=?', [id], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ success: true });
  });
});

// Cập nhật thông tin cá nhân
app.put('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const { name, phone, gmail } = req.body;
  // Validate cơ bản
  if (!name || name.length < 2) return res.json({ success: false, message: 'Tên không hợp lệ!' });
  if (!phone || !/^0[0-9]{9,10}$/.test(phone)) return res.json({ success: false, message: 'Số điện thoại không hợp lệ!' });
  if (!gmail || !gmail.includes('@')) return res.json({ success: false, message: 'Email không hợp lệ!' });
  // Chỉ cho phép user tự sửa thông tin của mình (nếu có xác thực thì kiểm tra req.user.id === id)
  db.query('UPDATE users SET name=?, phone=?, gmail=? WHERE id=?', [name, phone, gmail, id], (err, result) => {
    if (err) return res.json({ success: false, message: 'Lỗi cập nhật!' });
    res.json({ success: true });
  });
});

// ==== API QUẢN LÝ USER (ADMIN) ====
// Lấy danh sách user (chỉ admin)
app.get('/api/admin/users', verifyToken, isAdmin, (req, res) => {
  const { page = 1, limit = 10, search = '' } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  let where = '';
  let params = [];

  if (search) {
    where = 'WHERE username LIKE ? OR name LIKE ? OR gmail LIKE ? OR phone LIKE ?';
    params = [`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`];
  }

  // Đếm tổng số user
  const countQuery = `SELECT COUNT(*) as total FROM users ${where}`;
  db.query(countQuery, params, (err, countResult) => {
    if (err) return res.status(500).json({ success: false, message: 'Lỗi truy vấn!' });
    const total = countResult[0].total;

    // Lấy danh sách user phân trang
    const dataQuery = `SELECT id, username, name, gmail, phone, role, is_active, created_at FROM users ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    db.query(dataQuery, [...params, parseInt(limit), offset], (err, results) => {
      if (err) return res.status(500).json({ success: false, message: 'Lỗi truy vấn!' });
      res.json({
        success: true,
        users: results,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit))
      });
    });
  });
});

// Cập nhật thông tin user (chỉ admin)
app.put('/api/admin/users/:id', verifyToken, isAdmin, (req, res) => {
  const { id } = req.params;
  const { name, gmail, phone, role } = req.body;

  // Validate dữ liệu
  if (!name || name.length < 2) return res.json({ success: false, message: 'Tên không hợp lệ!' });
  if (!gmail || !gmail.includes('@')) return res.json({ success: false, message: 'Email không hợp lệ!' });
  if (!phone || !/^0[0-9]{9,10}$/.test(phone)) return res.json({ success: false, message: 'Số điện thoại không hợp lệ!' });
  if (role && !['user', 'admin'].includes(role)) return res.json({ success: false, message: 'Role không hợp lệ!' });

  db.query(
    'UPDATE users SET name=?, gmail=?, phone=?, role=? WHERE id=?',
    [name, gmail, phone, role || 'user', id],
    (err, result) => {
      if (err) return res.json({ success: false, message: 'Lỗi cập nhật!' });
      res.json({ success: true });
    }
  );
});

// Reset mật khẩu user (chỉ admin)
app.put('/api/admin/users/:id/reset-password', verifyToken, isAdmin, (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    return res.json({ success: false, message: 'Mật khẩu phải có ít nhất 6 ký tự!' });
  }

  db.query(
    'UPDATE users SET password=? WHERE id=?',
    [newPassword, id],
    (err, result) => {
      if (err) return res.json({ success: false, message: 'Lỗi reset mật khẩu!' });
      res.json({ success: true });
    }
  );
});

// Khóa/Mở khóa user (chỉ admin)
app.put('/api/admin/users/:id/toggle-status', verifyToken, isAdmin, (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;

  if (typeof isActive !== 'boolean') {
    return res.json({ success: false, message: 'Trạng thái không hợp lệ!' });
  }

  db.query(
    'UPDATE users SET is_active=? WHERE id=?',
    [isActive, id],
    (err, result) => {
      if (err) return res.json({ success: false, message: 'Lỗi cập nhật trạng thái!' });
      res.json({ success: true });
    }
  );
});

// Xóa user (chỉ admin)
app.delete('/api/admin/users/:id', verifyToken, isAdmin, (req, res) => {
  const { id } = req.params;

  // Kiểm tra xem user có lịch hẹn không
  db.query('SELECT COUNT(*) as count FROM appointments WHERE user_id=?', [id], (err, result) => {
    if (err) return res.json({ success: false, message: 'Lỗi kiểm tra lịch hẹn!' });
    
    if (result[0].count > 0) {
      return res.json({ success: false, message: 'Không thể xóa user đã có lịch hẹn!' });
    }

    // Nếu không có lịch hẹn thì xóa user
    db.query('DELETE FROM users WHERE id=?', [id], (err, result) => {
      if (err) return res.json({ success: false, message: 'Lỗi xóa user!' });
      res.json({ success: true });
    });
  });
});

// API public: Lấy tất cả lịch hẹn admin cho user xem (chỉ lấy pending, confirmed, doing)
app.get('/api/public-appointments', (req, res) => {
  const query = `SELECT id, name, phone, service, date, time, status FROM appointments WHERE status IN ('pending', 'confirmed', 'doing')`;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ success: false, message: 'Lỗi truy vấn!' });
    res.json({ success: true, appointments: results });
  });
});

// ==== API NOTIFICATIONS ====
// Tạo thông báo (dùng cho cả user và admin)
app.post('/api/notifications', (req, res) => {
  const { user_id, type, content, title } = req.body;
  if (!user_id || !type || !content) return res.json({ success: false, message: 'Thiếu thông tin!' });
  db.query(
    'INSERT INTO notifications (user_id, type, content, title) VALUES (?, ?, ?, ?)',
    [user_id, type, content, title || null],
    (err, result) => {
      if (err) return res.json({ success: false, message: 'Lỗi tạo thông báo!' });
      res.json({ success: true, id: result.insertId });
    }
  );
});

// Lấy danh sách thông báo theo user_id và type, mới nhất trước
app.get('/api/notifications', (req, res) => {
  const { user_id, type } = req.query;
  if (!user_id || !type) return res.json({ success: false, message: 'Thiếu thông tin!' });
  db.query(
    'SELECT * FROM notifications WHERE user_id = ? AND type = ? ORDER BY created_at DESC',
    [user_id, type],
    (err, results) => {
      if (err) return res.json({ success: false, message: 'Lỗi truy vấn!' });
      res.json({ success: true, notifications: results });
    }
  );
});

// Đánh dấu đã đọc
app.post('/api/notifications/mark-read', (req, res) => {
  const { notificationId } = req.body;
  if (!notificationId) return res.json({ success: false, message: 'Thiếu notificationId!' });
  db.query(
    'UPDATE notifications SET is_read = 1 WHERE id = ?',
    [notificationId],
    (err, result) => {
      if (err) return res.json({ success: false, message: 'Lỗi cập nhật!' });
      res.json({ success: true });
    }
  );
});

// Đánh dấu tất cả đã đọc
app.post('/api/notifications/mark-all-read', (req, res) => {
  const { user_id, type } = req.body;
  if (!user_id || !type) return res.json({ success: false, message: 'Thiếu thông tin!' });
  db.query(
    'UPDATE notifications SET is_read = 1 WHERE user_id = ? AND type = ?',
    [user_id, type],
    (err, result) => {
      if (err) return res.json({ success: false, message: 'Lỗi cập nhật!' });
      res.json({ success: true });
    }
  );
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
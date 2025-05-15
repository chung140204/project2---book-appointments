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
      // So sánh plain text
      if (password !== user.password) return res.json({ success: false, message: 'Sai mật khẩu!' });
      const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, 'secret', { expiresIn: '1d' });
      res.json({ success: true, token, user: { id: user.id, username: user.username, gmail: user.gmail, phone: user.phone, name: user.name, role: user.role } });
    }
  );
});

// Đặt lịch hẹn
app.post('/api/appointments', (req, res) => {
  const { user_id, name, phone, date, time, service } = req.body;
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
  // Kiểm tra dịch vụ hợp lệ (lấy từ DB)
  db.query('SELECT name FROM services', (err, results) => {
    if (err) return res.json({ success: false, message: 'Lỗi kiểm tra dịch vụ!' });
    const validServices = results.map(s => s.name);
    if (!service || !validServices.includes(service)) {
      return res.json({ success: false, message: 'Dịch vụ không hợp lệ!' });
    }
    // Kiểm tra trùng lịch
    db.query(
      'SELECT * FROM appointments WHERE user_id = ? AND DATE(date) = ? AND time = ? AND service = ? AND status NOT IN (?, ?)',
      [user_id, date.slice(0, 10), time, service, 'cancelled', 'rejected'],
      (err, results) => {
        if (err) return res.json({ success: false, message: 'Lỗi kiểm tra trùng lịch!' });
        if (results.length > 0) {
          return res.json({ success: false, message: 'Bạn đã đặt lịch trùng ngày, giờ và dịch vụ này!' });
        }
        // Nếu không trùng, lưu lịch hẹn
        db.query(
          'INSERT INTO appointments (user_id, name, phone, date, time, service, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [user_id, name, phone, date, time, service, 'pending'],
          (err, result) => {
            if (err) {
              console.log('Lỗi đặt lịch:', err);
              return res.json({ success: false, message: 'Lỗi đặt lịch!' });
            }
            res.json({ success: true });
          }
        );
      }
    );
  });
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
      res.json({ success: true });
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

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
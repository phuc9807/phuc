const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Đăng ký
const register = async (req, res) => {
  const { full_name, email, password, phone } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) return res.status(400).json({ message: 'Email đã tồn tại' });

  const hashedPassword = await bcrypt.hash(password, 10);
  const user_id = Math.floor(Math.random() * 900000) + 100000;

  const user = await User.create({
    user_id,
    full_name,
    email,
    password: hashedPassword,
    phone,
    role: 'customer',
  });

  const token = jwt.sign({ user_id: user.user_id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30d' });

  res.status(201).json({ token, user_id: user.user_id, full_name: user.full_name, role: user.role });
};

// Đăng nhập
const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: 'Email không tồn tại' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: 'Sai mật khẩu' });

  const token = jwt.sign({ user_id: user.user_id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30d' });

  res.json({ token, user_id: user.user_id, full_name: user.full_name, role: user.role });
};

// GET /api/auth/users — Lấy tất cả users (admin)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ created_at: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

module.exports = { register, login, getAllUsers };
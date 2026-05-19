const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const bcrypt = require('bcryptjs');
const User = require('../models/User')
const { getAllUsers } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', async (req, res) => {
  const { email, new_password } = req.body
  const user = await User.findOne({ email })
  if (!user) return res.status(404).json({ message: 'Email không tồn tại' })
  user.password = await bcrypt.hash(new_password, 10)
  await user.save()
  res.json({ message: 'Đổi mật khẩu thành công' })
})

// Lấy thông tin profile
router.get('/profile/:user_id', async (req, res) => {
  const user = await User.findOne({ user_id: Number(req.params.user_id) })
  if (!user) return res.status(404).json({ message: 'Không tìm thấy user' })
  res.json({ full_name: user.full_name, email: user.email, phone: user.phone })
})

// Cập nhật profile
router.put('/profile/:user_id', async (req, res) => {
  const { full_name, phone } = req.body
  await User.findOneAndUpdate({ user_id: Number(req.params.user_id) }, { full_name, phone })
  res.json({ message: 'Cập nhật thành công' })
})

// Đổi mật khẩu
router.put('/change-password/:user_id', async (req, res) => {
  const { old_password, new_password } = req.body
  const user = await User.findOne({ user_id: Number(req.params.user_id) })
  if (!user) return res.status(404).json({ message: 'Không tìm thấy user' })
  const isMatch = await bcrypt.compare(old_password, user.password)
  if (!isMatch) return res.status(400).json({ message: 'Mật khẩu hiện tại không đúng' })
  user.password = await bcrypt.hash(new_password, 10)
  await user.save()
  res.json({ message: 'Đổi mật khẩu thành công' })
})

// Xóa tài khoản
router.delete('/delete/:user_id', async (req, res) => {
  const { password } = req.body
  const user = await User.findOne({ user_id: Number(req.params.user_id) })
  if (!user) return res.status(404).json({ message: 'Không tìm thấy user' })
  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) return res.status(400).json({ message: 'Mật khẩu không đúng' })
  await User.findOneAndDelete({ user_id: Number(req.params.user_id) })
  res.json({ message: 'Xóa tài khoản thành công' })
})

router.get('/users', getAllUsers);

module.exports = router;
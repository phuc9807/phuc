import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useAuthStore } from '../store/authStore'

interface Address {
  _id: string
  address_id: number
  user_id: number
  receiver_name: string
  phone: number
  address_detail: string
}

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user, setUser, logout } = useAuthStore()

  // Thông tin cá nhân
  const [profile, setProfile] = useState({ full_name: '', email: '', phone: '' })
  const [profileMsg, setProfileMsg] = useState('')
  const [profileLoading, setProfileLoading] = useState(false)

  // Địa chỉ
  const [address, setAddress] = useState<Address | null>(null)
  const [addressForm, setAddressForm] = useState({ receiver_name: '', phone: '', address_detail: '' })
  const [addressMsg, setAddressMsg] = useState('')
  const [addressLoading, setAddressLoading] = useState(false)
  const [hasAddress, setHasAddress] = useState(false)

  // Đổi mật khẩu
  const [passForm, setPassForm] = useState({ old_password: '', new_password: '', confirm_password: '' })
  const [passMsg, setPassMsg] = useState('')
  const [passMsgType, setPassMsgType] = useState<'success' | 'error'>('success')
  const [passLoading, setPassLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  // Xóa tài khoản
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteMsg, setDeleteMsg] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Tab
  const [activeTab, setActiveTab] = useState<'profile' | 'address' | 'password' | 'delete'>('profile')

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    fetchProfile()
    fetchAddress()
  }, [])

  const fetchProfile = async () => {
    const res = await api.get(`/auth/profile/${user!.user_id}`)
    setProfile({
      full_name: res.data.full_name,
      email: res.data.email,
      phone: res.data.phone ? '0' + res.data.phone.toString().replace(/^0+/, '') : '',
    })
  }

  const fetchAddress = async () => {
    const res = await api.get(`/addresses/${user!.user_id}`)
    if (res.data) {
      setAddress(res.data)
      setAddressForm({
        receiver_name: res.data.receiver_name,
        phone: res.data.phone ? '0' + res.data.phone.toString().replace(/^0+/, '') : '',
        address_detail: res.data.address_detail,
      })
      setHasAddress(true)
    }
  }

  const handleSaveProfile = async () => {
    if (!profile.full_name.trim()) return setProfileMsg('Vui lòng nhập họ và tên')
    setProfileLoading(true)
    setProfileMsg('')
    try {
      await api.put(`/auth/profile/${user!.user_id}`, profile)
      const updated = { ...user!, full_name: profile.full_name }
      setUser(updated)
      const storage = localStorage.getItem('user') ? localStorage : sessionStorage
      storage.setItem('user', JSON.stringify(updated))
      setProfileMsg('✅ Cập nhật thành công!')
    } catch {
      setProfileMsg('❌ Có lỗi xảy ra!')
    }
    setProfileLoading(false)
  }

  const handleSaveAddress = async () => {
    if (!addressForm.receiver_name.trim()) return setAddressMsg('Vui lòng nhập tên người nhận')
    if (!addressForm.phone.toString().trim()) return setAddressMsg('Vui lòng nhập số điện thoại')
    if (!addressForm.address_detail.trim()) return setAddressMsg('Vui lòng nhập địa chỉ')
    setAddressLoading(true)
    setAddressMsg('')
    try {
      if (hasAddress && address) {
        await api.put(`/addresses/${address.address_id}`, addressForm)
      } else {
        await api.post(`/addresses`, { ...addressForm, user_id: user!.user_id })
      }
      setAddressMsg('✅ Cập nhật địa chỉ thành công!')
      fetchAddress()
    } catch {
      setAddressMsg('❌ Có lỗi xảy ra!')
    }
    setAddressLoading(false)
  }

  const handleChangePassword = async () => {
    setPassMsg('')
    if (!passForm.old_password) return (setPassMsg('Vui lòng nhập mật khẩu hiện tại'), setPassMsgType('error'))
    if (passForm.new_password.length < 6) return (setPassMsg('Mật khẩu mới phải có ít nhất 6 ký tự'), setPassMsgType('error'))
    if (passForm.new_password !== passForm.confirm_password) return (setPassMsg('Mật khẩu xác nhận không khớp'), setPassMsgType('error'))
    setPassLoading(true)
    try {
      await api.put(`/auth/change-password/${user!.user_id}`, {
        old_password: passForm.old_password,
        new_password: passForm.new_password,
      })
      setPassMsgType('success')
      setPassMsg('✅ Đổi mật khẩu thành công!')
      setPassForm({ old_password: '', new_password: '', confirm_password: '' })
    } catch (err: any) {
      setPassMsgType('error')
      setPassMsg(err.response?.data?.message || '❌ Có lỗi xảy ra!')
    }
    setPassLoading(false)
  }

  const handleDeleteAccount = async () => {
    if (!deletePassword) return setDeleteMsg('Vui lòng nhập mật khẩu để xác nhận')
    setDeleteLoading(true)
    try {
      await api.delete(`/auth/delete/${user!.user_id}`, {
        data: { password: deletePassword }
      })
      logout()
      navigate('/')
    } catch (err: any) {
      setDeleteMsg(err.response?.data?.message || '❌ Mật khẩu không đúng!')
    }
    setDeleteLoading(false)
  }

  const tabs = [
    { key: 'profile', label: 'Thông tin cá nhân' },
    { key: 'address', label: 'Địa chỉ giao hàng' },
    { key: 'password', label: 'Đổi mật khẩu' },
    { key: 'delete', label: 'Xóa tài khoản' },
  ]

  const inputClass = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1a2f6e] transition-colors"

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Tài khoản của tôi</h1>

      <div className="flex gap-6">

        {/* Sidebar tabs */}
        <aside className="w-52 shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`w-full text-left px-5 py-3.5 text-sm font-medium transition-colors border-b border-gray-50 last:border-0 ${
                  activeTab === tab.key
                    ? tab.key === 'delete'
                      ? 'bg-red-50 text-red-500'
                      : 'bg-[#1a2f6e] text-white'
                    : tab.key === 'delete'
                      ? 'text-red-400 hover:bg-red-50'
                      : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </aside>

        {/* Nội dung */}
        <div className="flex-1 bg-white rounded-2xl border border-gray-100 p-6">

          {/* Tab thông tin cá nhân */}
          {activeTab === 'profile' && (
            <div>
              <h2 className="text-lg font-bold text-gray-800 mb-5">Thông tin cá nhân</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Họ và tên</label>
                  <input
                    type="text"
                    value={profile.full_name}
                    onChange={e => setProfile({ ...profile, full_name: e.target.value })}
                    className={`${inputClass} mt-1`}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Email</label>
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className={`${inputClass} mt-1 bg-gray-50 text-gray-400 cursor-not-allowed`}
                  />
                  <p className="text-xs text-gray-400 mt-1">Email không thể thay đổi</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Số điện thoại</label>
                  <input
                    type="text"
                    value={profile.phone}
                    onChange={e => setProfile({ ...profile, phone: e.target.value })}
                    className={`${inputClass} mt-1`}
                  />
                </div>
                {profileMsg && <p className="text-sm font-medium text-green-500">{profileMsg}</p>}
                <button
                  onClick={handleSaveProfile}
                  disabled={profileLoading}
                  className="bg-[#1a2f6e] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#152558] transition-colors disabled:opacity-50"
                >
                  {profileLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </div>
          )}

          {/* Tab địa chỉ */}
          {activeTab === 'address' && (
            <div>
              <h2 className="text-lg font-bold text-gray-800 mb-5">Địa chỉ giao hàng</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Tên người nhận</label>
                  <input
                    type="text"
                    value={addressForm.receiver_name}
                    onChange={e => setAddressForm({ ...addressForm, receiver_name: e.target.value })}
                    placeholder="Nguyễn Văn A"
                    className={`${inputClass} mt-1`}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Số điện thoại</label>
                  <input
                    type="text"
                    value={addressForm.phone}
                    onChange={e => setAddressForm({ ...addressForm, phone: e.target.value })}
                    placeholder="0901234567"
                    className={`${inputClass} mt-1`}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Địa chỉ chi tiết</label>
                  <textarea
                    value={addressForm.address_detail}
                    onChange={e => setAddressForm({ ...addressForm, address_detail: e.target.value })}
                    placeholder="123 Đường ABC, Phường XYZ, Quận 1, TP.HCM"
                    rows={3}
                    className={`${inputClass} mt-1 resize-none`}
                  />
                </div>
                {addressMsg && <p className="text-sm font-medium text-green-500">{addressMsg}</p>}
                <button
                  onClick={handleSaveAddress}
                  disabled={addressLoading}
                  className="bg-[#1a2f6e] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#152558] transition-colors disabled:opacity-50"
                >
                  {addressLoading ? 'Đang lưu...' : hasAddress ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ'}
                </button>
              </div>
            </div>
          )}

          {/* Tab đổi mật khẩu */}
          {activeTab === 'password' && (
            <div>
              <h2 className="text-lg font-bold text-gray-800 mb-5">Đổi mật khẩu</h2>
              <div className="space-y-4">
                {[
                  { label: 'Mật khẩu hiện tại', key: 'old_password' },
                  { label: 'Mật khẩu mới', key: 'new_password' },
                  { label: 'Xác nhận mật khẩu mới', key: 'confirm_password' },
                ].map(field => (
                  <div key={field.key}>
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{field.label}</label>
                    <div className="flex items-center border border-gray-200 rounded-xl px-4 mt-1 focus-within:border-[#1a2f6e] transition-colors">
                      <input
                        type={showPass ? 'text' : 'password'}
                        value={passForm[field.key as keyof typeof passForm]}
                        onChange={e => setPassForm({ ...passForm, [field.key]: e.target.value })}
                        placeholder="••••••••"
                        className="flex-1 py-3 text-sm outline-none"
                      />
                      {field.key === 'old_password' && (
                        <button type="button" onClick={() => setShowPass(p => !p)} className="text-gray-400 hover:text-gray-600">
                          {showPass
                            ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" /></svg>
                            : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                          }
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {passMsg && (
                  <p className={`text-sm font-medium ${passMsgType === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                    {passMsg}
                  </p>
                )}
                <button
                  onClick={handleChangePassword}
                  disabled={passLoading}
                  className="bg-[#1a2f6e] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#152558] transition-colors disabled:opacity-50"
                >
                  {passLoading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                </button>
              </div>
            </div>
          )}

          {/* Tab xóa tài khoản */}
          {activeTab === 'delete' && (
            <div>
              <h2 className="text-lg font-bold text-red-500 mb-2">Xóa tài khoản</h2>
              <p className="text-sm text-gray-500 mb-5">
                Hành động này không thể hoàn tác. Tất cả dữ liệu của bạn sẽ bị xóa vĩnh viễn.
              </p>

              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="bg-red-500 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-600 transition-colors"
                >
                  Xóa tài khoản của tôi
                </button>
              ) : (
                <div className="space-y-4 border border-red-100 rounded-2xl p-5 bg-red-50">
                  <p className="text-sm font-medium text-red-600">Nhập mật khẩu để xác nhận xóa tài khoản:</p>
                  <input
                    type="password"
                    value={deletePassword}
                    onChange={e => setDeletePassword(e.target.value)}
                    placeholder="Mật khẩu của bạn"
                    className="w-full border border-red-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-red-400 bg-white"
                  />
                  {deleteMsg && <p className="text-sm text-red-500">{deleteMsg}</p>}
                  <div className="flex gap-3">
                    <button
                      onClick={handleDeleteAccount}
                      disabled={deleteLoading}
                      className="bg-red-500 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-50"
                    >
                      {deleteLoading ? 'Đang xử lý...' : 'Xác nhận xóa'}
                    </button>
                    <button
                      onClick={() => { setShowDeleteConfirm(false); setDeletePassword(''); setDeleteMsg('') }}
                      className="border border-gray-200 text-gray-600 px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
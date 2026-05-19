import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function ForgotPasswordPage() {
    const navigate = useNavigate()
    const [form, setForm] = useState({ email: '', password: '', confirm_password: '' })
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [loading, setLoading] = useState(false)
    const [showPass, setShowPass] = useState(false)

    const handleSubmit = async () => {
        setError('')
        setSuccess('')
        if (form.password !== form.confirm_password)
            return setError('Mật khẩu xác nhận không khớp')
        if (form.password.length < 6)
            return setError('Mật khẩu phải có ít nhất 6 ký tự')

        setLoading(true)
        try {
            await api.post('/auth/forgot-password', {
                email: form.email,
                new_password: form.password,
            })
            
            // Hiển thị thông báo ở giữa màn hình
            setSuccess('Đổi mật khẩu thành công!')
            
            setTimeout(() => {
                navigate('/login')
            }, 2000)
        } catch {
            setError('Email không tồn tại trong hệ thống')
        }
        setLoading(false)
    }

    const EyeIcon = () => (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
    )

    const EyeOffIcon = () => (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
        </svg>
    )

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 relative">
            
            {/* THẺ THÔNG BÁO Ở GIỮA MÀN HÌNH */}
            {success && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/20 backdrop-blur-[2px] transition-all">
                    <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full mx-4 flex flex-col items-center text-center animate-in fade-in zoom-in duration-300">
                        <div className="bg-green-100 p-4 rounded-full mb-4">
                            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{success}</h3>
                        <p className="text-gray-500 text-sm">
                            Hệ thống sẽ tự động quay lại trang đăng nhập trong giây lát.
                        </p>
                        <div className="mt-6 w-full bg-gray-100 h-1 rounded-full overflow-hidden">
                            <div className="bg-green-500 h-full animate-progress-bar"></div>
                        </div>
                    </div>
                </div>
            )}

            <Link to="/" className="text-3xl font-bold text-[#1a2f6e] mb-10">TuSigma</Link>

            <div className="bg-white rounded-3xl shadow-lg p-10 w-full max-w-md">
                <h2 className="text-2xl font-bold text-[#1a2f6e] mb-2">Quên Mật Khẩu</h2>
                <p className="text-gray-500 text-sm mb-8">Nhập email và mật khẩu mới của bạn.</p>

                <div className="space-y-4">
                    {/* Email */}
                    <div>
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Email</label>
                        <div className="flex items-center border border-gray-200 rounded-xl px-4 py-3 mt-1 focus-within:border-[#1a2f6e] transition-colors">
                            <svg className="w-4 h-4 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <input
                                type="email"
                                placeholder="email@vi-du.vn"
                                value={form.email}
                                onChange={e => setForm({ ...form, email: e.target.value })}
                                className="flex-1 outline-none text-sm text-gray-700"
                            />
                        </div>
                    </div>

                    {/* Mật khẩu mới */}
                    <div>
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Mật khẩu mới</label>
                        <div className="flex items-center border border-gray-200 rounded-xl px-4 py-3 mt-1 focus-within:border-[#1a2f6e] transition-colors">
                            <svg className="w-4 h-4 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            <input
                                type={showPass ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={form.password}
                                onChange={e => setForm({ ...form, password: e.target.value })}
                                className="flex-1 outline-none text-sm text-gray-700"
                            />
                            <button type="button" onClick={() => setShowPass(p => !p)} className="text-gray-400 hover:text-gray-600 ml-2">
                                {showPass ? <EyeOffIcon /> : <EyeIcon />}
                            </button>
                        </div>
                    </div>

                    {/* Xác nhận mật khẩu mới */}
                    <div>
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Xác nhận mật khẩu mới</label>
                        <div className="flex items-center border border-gray-200 rounded-xl px-4 py-3 mt-1 focus-within:border-[#1a2f6e] transition-colors">
                            <svg className="w-4 h-4 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            <input
                                type={showPass ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={form.confirm_password}
                                onChange={e => setForm({ ...form, confirm_password: e.target.value })}
                                className="flex-1 outline-none text-sm text-gray-700"
                            />
                        </div>
                    </div>

                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    <button
                        onClick={handleSubmit}
                        disabled={loading || success !== ''}
                        className="w-full bg-[#1a2f6e] text-white py-3 rounded-xl font-semibold hover:bg-[#152558] transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Đang xử lý...' : 'Đổi Mật Khẩu'}
                    </button>

                    <Link to="/login" className="block text-center text-sm text-[#1a2f6e] hover:underline">
                        Quay lại đăng nhập
                    </Link>
                </div>
            </div>
        </div>
    )
}
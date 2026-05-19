import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../services/api'
import { useAuthStore } from '../store/authStore'

export default function LoginPage() {
    const navigate = useNavigate()
    const setUser = useAuthStore(s => s.setUser)

    // Form đăng nhập
    const [loginData, setLoginData] = useState({ email: '', password: '' })
    const [rememberMe, setRememberMe] = useState(false)
    const [loginError, setLoginError] = useState('')
    const [loginLoading, setLoginLoading] = useState(false)
    const [showLoginPass, setShowLoginPass] = useState(false)
    const [showRegisterPass, setShowRegisterPass] = useState(false)

    // Form đăng ký
    const [registerData, setRegisterData] = useState({
        full_name: '', email: '', password: '', confirm_password: ''
    })
    const [agreeTerms, setAgreeTerms] = useState(false)
    const [registerError, setRegisterError] = useState('')
    const [registerSuccess, setRegisterSuccess] = useState('')
    const [registerLoading, setRegisterLoading] = useState(false)

    const handleLogin = async (isAdmin: boolean) => {
        setLoginError('')
        setLoginLoading(true)
        try {
            const res = await api.post('/auth/login', loginData)
            const user = res.data

            if (isAdmin && user.role !== 'admin') {
                setLoginError('Tài khoản này không có quyền quản trị viên')
                setLoginLoading(false)
                return
            }

            // Lưu token
            const storage = rememberMe ? localStorage : sessionStorage
            storage.setItem('user', JSON.stringify(user))
            localStorage.setItem('token', user.token)
            setUser(user)

            if (user.role === 'admin') navigate('/admin/dashboard')
            else navigate('/')
        } catch {
            setLoginError('Email hoặc mật khẩu không đúng')
        }
        setLoginLoading(false)
    }

    const handleRegister = async () => {
        setRegisterError('')
        setRegisterSuccess('')

        if (!registerData.full_name.trim()) return setRegisterError('Vui lòng nhập họ và tên')
        if (!registerData.email.trim()) return setRegisterError('Vui lòng nhập email')
        if (!/^[a-zA-Z0-9]([a-zA-Z0-9._]*[a-zA-Z0-9])?@gmail\.com$/.test(registerData.email.trim()))
            return setRegisterError('Email phải là địa chỉ Gmail (example@gmail.com)')
        if (!registerData.password) return setRegisterError('Vui lòng nhập mật khẩu')
        if (!agreeTerms) return setRegisterError('Vui lòng đồng ý với điều khoản dịch vụ')
        if (registerData.password !== registerData.confirm_password)
            return setRegisterError('Mật khẩu xác nhận không khớp')
        if (registerData.password.length < 6)
            return setRegisterError('Mật khẩu phải có ít nhất 6 ký tự')

        setRegisterLoading(true)
        try {
            await api.post('/auth/register', {
                full_name: registerData.full_name,
                email: registerData.email,
                password: registerData.password,
            })
            setRegisterSuccess('Đăng ký thành công! Bạn có thể đăng nhập ngay.')
            setRegisterData({ full_name: '', email: '', password: '', confirm_password: '' })
            setAgreeTerms(false)
        } catch (err: any) {
            setRegisterError(err.response?.data?.message || 'Đăng ký thất bại')
        }
        setRegisterLoading(false)
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Logo */}
            <div className="text-center py-8">
                <Link to="/" className="text-3xl font-bold text-[#1a2f6e]">TuSigma</Link>
            </div>

            {/* Form container */}
            <div className="flex-1 flex items-start justify-center px-4 pb-12">
                <div className="w-full max-w-4xl flex rounded-3xl overflow-hidden shadow-lg">

                    {/* Cột trái — Đăng nhập */}
                    <div className="flex-1 bg-white p-10">
                        <h2 className="text-3xl font-bold text-[#1a2f6e] mb-2">Đăng Nhập</h2>
                        <p className="text-gray-500 text-sm mb-8">Chào mừng bạn quay trở lại với TuSigma.</p>

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
                                        placeholder="ten@gmail.com"
                                        onChange={e => setLoginData({ ...loginData, email: e.target.value })}
                                        className="flex-1 outline-none text-sm text-gray-700"
                                    />
                                </div>
                            </div>

                            {/* Mật khẩu */}
                            <div>
                                <div className="flex justify-between items-center">
                                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Mật khẩu</label>
                                    <Link to="/forgot-password" className="text-xs text-[#1a2f6e] hover:underline">Quên mật khẩu?</Link>
                                </div>
                                <div className="flex items-center border border-gray-200 rounded-xl px-4 py-3 mt-1 focus-within:border-[#1a2f6e] transition-colors">
                                    <svg className="w-4 h-4 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    <input
                                        type={showLoginPass ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        value={loginData.password}
                                        onChange={e => setLoginData({ ...loginData, password: e.target.value })}
                                        className="flex-1 outline-none text-sm text-gray-700"
                                    />
                                    <button type="button" onClick={() => setShowLoginPass(p => !p)} className="text-gray-400 hover:text-gray-600 ml-2">
                                        {showLoginPass
                                            ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" /></svg>
                                            : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                        }
                                    </button>
                                </div>
                            </div>

                            {/* Ghi nhớ */}
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={e => setRememberMe(e.target.checked)}
                                    className="w-4 h-4 accent-[#1a2f6e]"
                                />
                                <span className="text-sm text-gray-500">Ghi nhớ đăng nhập</span>
                            </label>

                            {loginError && <p className="text-red-500 text-sm">{loginError}</p>}

                            {/* Nút đăng nhập */}
                            <button
                                onClick={() => handleLogin(false)}
                                disabled={loginLoading}
                                className="w-full bg-[#1a2f6e] text-white py-3 rounded-xl font-semibold hover:bg-[#152558] transition-colors disabled:opacity-50"
                            >
                                {loginLoading ? 'Đang xử lý...' : 'Đăng Nhập'}
                            </button>

                            {/* Nút admin */}
                            <button
                                onClick={() => handleLogin(true)}
                                disabled={loginLoading}
                                className="w-full border-2 border-[#1a2f6e] text-[#1a2f6e] py-3 rounded-xl font-semibold hover:bg-[#1a2f6e] hover:text-white transition-colors text-sm tracking-wide disabled:opacity-50"
                            >
                                ĐĂNG NHẬP QUẢN TRỊ VIÊN
                            </button>
                        </div>
                    </div>

                    {/* Cột phải — Đăng ký */}
                    <div className="flex-1 bg-[#1a2f6e] p-10 text-white">
                        <h2 className="text-3xl font-bold mb-2">Đăng Ký</h2>
                        <p className="text-blue-200 text-sm mb-8">Trở thành thành viên của TuSigma ngay hôm nay.</p>

                        <div className="space-y-4">
                            {/* Họ tên */}
                            <div>
                                <label className="text-xs font-semibold text-blue-300 uppercase tracking-wide">Họ và tên</label>
                                <div className="flex items-center border border-blue-400 rounded-xl px-4 py-3 mt-1 focus-within:border-white transition-colors bg-[#152558]">
                                    <svg className="w-4 h-4 text-blue-300 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <input
                                        type="text"
                                        placeholder="Nguyễn Văn A"
                                        value={registerData.full_name}
                                        onChange={e => setRegisterData({ ...registerData, full_name: e.target.value })}
                                        className="flex-1 outline-none text-sm bg-transparent text-white placeholder-blue-300"
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="text-xs font-semibold text-blue-300 uppercase tracking-wide">Email</label>
                                <div className="flex items-center border border-blue-400 rounded-xl px-4 py-3 mt-1 focus-within:border-white transition-colors bg-[#152558]">
                                    <svg className="w-4 h-4 text-blue-300 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    <input
                                        type="email"
                                        placeholder="ten@gmail.com"
                                        value={registerData.email}
                                        onChange={e => setRegisterData({ ...registerData, email: e.target.value })}
                                        className="flex-1 outline-none text-sm bg-transparent text-white placeholder-blue-300"
                                    />
                                </div>
                            </div>

                            {/* Mật khẩu + Xác nhận */}
                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <label className="text-xs font-semibold text-blue-300 uppercase tracking-wide">Mật khẩu</label>
                                    <div className="flex items-center border border-blue-400 rounded-xl px-3 py-3 mt-1 focus-within:border-white transition-colors bg-[#152558]">
                                        <svg className="w-4 h-4 text-blue-300 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                        <input
                                            type={showRegisterPass ? 'text' : 'password'}
                                            placeholder="••••••••"
                                            value={registerData.password}
                                            onChange={e => setRegisterData({ ...registerData, password: e.target.value })}
                                            className="flex-1 outline-none text-sm bg-transparent text-white placeholder-blue-300 w-0"
                                        />
                                        <button type="button" onClick={() => setShowRegisterPass(p => !p)} className="text-blue-300 hover:text-white ml-1">
                                            {showRegisterPass
                                                ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" /></svg>
                                                : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                            }
                                        </button>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <label className="text-xs font-semibold text-blue-300 uppercase tracking-wide">Xác nhận</label>
                                    <div className="flex items-center border border-blue-400 rounded-xl px-3 py-3 mt-1 focus-within:border-white transition-colors bg-[#152558]">
                                        <svg className="w-4 h-4 text-blue-300 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                        <input
                                            type={showRegisterPass ? 'text' : 'password'}
                                            placeholder="••••••••"
                                            value={registerData.confirm_password}
                                            onChange={e => setRegisterData({ ...registerData, confirm_password: e.target.value })}
                                            className="flex-1 outline-none text-sm bg-transparent text-white placeholder-blue-300 w-0"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Đồng ý điều khoản */}
                            <label className="flex items-start gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={agreeTerms}
                                    onChange={e => setAgreeTerms(e.target.checked)}
                                    className="w-4 h-4 accent-white mt-0.5"
                                />
                                <span className="text-sm text-blue-200">
                                    Tôi đồng ý với các <span className="text-white underline cursor-pointer">Điều khoản dịch vụ</span> và <span className="text-white underline cursor-pointer">Chính sách bảo mật</span>.
                                </span>
                            </label>

                            {registerError && <p className="text-red-300 text-sm">{registerError}</p>}
                            {registerSuccess && <p className="text-green-300 text-sm">{registerSuccess}</p>}

                            {/* Nút tạo tài khoản */}
                            <button
                                onClick={handleRegister}
                                disabled={registerLoading}
                                className="w-full bg-white text-[#1a2f6e] py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors disabled:opacity-50"
                            >
                                {registerLoading ? 'Đang xử lý...' : 'Tạo Tài Khoản'}
                            </button>
                        </div>
                    </div>

                </div>
            </div>

            {/* Footer nhỏ */}
            <div className="text-center text-sm text-gray-400 pb-6">
                © 1911 TuSigma. Hỗ trợ · Bảo mật · Ngôn ngữ: Tiếng Việt
            </div>
        </div>
    )
}
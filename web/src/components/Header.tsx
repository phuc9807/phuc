import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useCartStore } from '../store/cartStore'

export default function Header() {
  const [search, setSearch] = useState('')
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [showDropdown, setShowDropdown] = useState(false)
  const { items, fetchCart } = useCartStore()

  useEffect(() => {
    if (user) fetchCart(user.user_id)
  }, [user])

  const cartCount = items.reduce((s, i) => s + i.quantity, 0)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (search.trim()) navigate(`/products?search=${encodeURIComponent(search.trim())}`)
  }

  const handleLogout = () => {
    logout()
    setShowDropdown(false)
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16 gap-4">

        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-[#1a2f6e] shrink-0">
          TuSigma
        </Link>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
          <Link to="/products" className="hover:text-[#1a2f6e] transition-colors">Sản phẩm</Link>
          <Link to="/products?sale=true" className="hover:text-[#1a2f6e] transition-colors">Khuyến mãi</Link>
          <Link to="/news" className="hover:text-[#1a2f6e] transition-colors">Tin tức</Link>
          <Link to="/contact" className="hover:text-[#1a2f6e] transition-colors">Liên hệ</Link>
        </nav>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-md">
          <div className="flex items-center border border-gray-200 rounded-full px-4 py-2 bg-gray-50 focus-within:border-[#1a2f6e] transition-colors">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-sm outline-none text-gray-700"
            />
            <button type="submit" className="text-gray-400 hover:text-[#1a2f6e] transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </form>

        {/* Icons */}
        <div className="flex items-center gap-3">

          {/* Giỏ hàng */}
          <Link to="/cart" className="relative p-2 text-gray-600 hover:text-[#1a2f6e] transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#1a2f6e] text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </Link>

          {/* User */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowDropdown(p => !p)}
                className="flex items-center gap-2 text-sm font-medium text-[#1a2f6e] hover:opacity-80 transition-opacity"
              >
                <div className="w-8 h-8 bg-[#1a2f6e] text-white rounded-full flex items-center justify-center text-xs font-bold">
                  {user.full_name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden md:block">Xin chào, {user.full_name.split(' ').pop()}</span>
              </button>

              {/* Dropdown */}
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-xs text-gray-400">Đăng nhập với</p>
                    <p className="text-sm font-semibold text-gray-700 truncate">{user.full_name}</p>
                  </div>
                  <Link
                    to="/orders"
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Đơn hàng của tôi
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Thông tin
                  </Link>
                  {user.role === 'admin' && (
                    <Link
                      to="/admin/dashboard"
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#1a2f6e] font-medium hover:bg-blue-50 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <rect x="3" y="3" width="7" height="7" rx="1" strokeWidth={2}/>
                        <rect x="14" y="3" width="7" height="7" rx="1" strokeWidth={2}/>
                        <rect x="3" y="14" width="7" height="7" rx="1" strokeWidth={2}/>
                        <rect x="14" y="14" width="7" height="7" rx="1" strokeWidth={2}/>
                      </svg>
                      Dashboard
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="p-2 text-gray-600 hover:text-[#1a2f6e] transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>
          )}

        </div>
      </div>
    </header>
  )
}
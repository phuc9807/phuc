import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCartStore } from '../store/cartStore'
import { useAuthStore } from '../store/authStore'

const VALID_COUPONS: Record<string, number> = {
  GIAM10: 0.1,
  GIAM20: 0.2,
  FREESHIP: 0,
}

export default function CartPage() {
  const navigate = useNavigate()
  const user = useAuthStore(s => s.user)
  const { items, loading, fetchCart, removeFromCart, updateQuantity } = useCartStore()

  const [coupon, setCoupon] = useState('')
  const [couponApplied, setCouponApplied] = useState('')
  const [couponError, setCouponError] = useState('')
  const [discount, setDiscount] = useState(0)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    fetchCart(user.user_id)
  }, [user])

  const formatPrice = (p: number) =>
    p.toLocaleString('vi-VN') + '₫'

  const subtotal = items.reduce((s, i) => s + (i.price || 0) * i.quantity, 0)
  const discountAmount = Math.round(subtotal * discount)
  const total = subtotal - discountAmount

  const handleApplyCoupon = () => {
    const code = coupon.trim().toUpperCase()
    if (VALID_COUPONS[code] !== undefined) {
      setDiscount(VALID_COUPONS[code])
      setCouponApplied(code)
      setCouponError('')
    } else {
      setCouponError('Mã giảm giá không hợp lệ')
      setCouponApplied('')
      setDiscount(0)
    }
  }

  const handleRemoveCoupon = () => {
    setCoupon('')
    setCouponApplied('')
    setCouponError('')
    setDiscount(0)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#1a2f6e] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Đang tải giỏ hàng...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-10">

        {/* Tiêu đề */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1a2f6e]">GIỎ HÀNG</h1>
          {items.length > 0 && (
            <p className="text-gray-500 mt-1">
              Bạn đang có <span className="font-semibold text-gray-800">{items.length} sản phẩm</span> trong giỏ hàng
            </p>
          )}
        </div>

        {items.length === 0 ? (
          /* Giỏ hàng trống */
          <div className="bg-white rounded-2xl shadow-sm p-16 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Giỏ hàng trống</h2>
            <p className="text-gray-400 mb-6">Hãy khám phá các sản phẩm và thêm vào giỏ hàng nhé!</p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-[#1a2f6e] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#152558] transition-colors"
            >
              Khám phá sản phẩm
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">

            {/* Danh sách sản phẩm */}
            <div className="flex-1">
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {/* Header bảng */}
                <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  <div className="col-span-4">Sản phẩm</div>
                  <div className="col-span-2 text-center">Đơn giá</div>
                  <div className="col-span-3 text-center">Số lượng</div>
                  <div className="col-span-2 text-right">Thành tiền</div>
                  <div className="col-span-1 text-center">Xóa</div>
                </div>

                {/* Danh sách */}
                <div className="divide-y divide-gray-50">
                  {items.map(item => (
                    <div key={item.cart_item_id} className="grid grid-cols-12 gap-4 items-center px-6 py-5">
                      {/* Ảnh + tên */}
                      <div className="col-span-12 md:col-span-4 flex items-center gap-4">
                        <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                          {item.image_url ? (
                            <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-800 text-sm leading-snug line-clamp-2">{item.name}</p>
                          {item.variant && <p className="text-xs text-gray-400 mt-0.5">{item.variant}</p>}
                        </div>
                      </div>

                      {/* Đơn giá */}
                      <div className="col-span-4 md:col-span-2 text-center">
                        <span className="text-sm text-gray-600">{formatPrice(item.price || 0)}</span>
                      </div>

                      {/* Số lượng */}
                      <div className="col-span-5 md:col-span-3 flex items-center justify-center">
                        <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item.cart_item_id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </button>
                          <span className="w-10 text-center text-sm font-semibold text-gray-800">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.cart_item_id, item.quantity + 1)}
                            disabled={false}
                            className="w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* Thành tiền */}
                      <div className="col-span-2 md:col-span-2 text-right">
                        <span className="text-sm font-bold text-[#1a2f6e]">
                          {formatPrice((item.price || 0) * item.quantity)}
                        </span>
                      </div>

                      {/* Nút xóa */}
                      <div className="col-span-1 flex justify-center">
                        <button
                          onClick={() => removeFromCart(item.cart_item_id)}
                          className="w-8 h-8 flex items-center justify-center text-red-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Link tiếp tục mua */}
              <div className="mt-4">
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 text-[#1a2f6e] text-sm font-medium hover:underline"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Tiếp tục mua sắm
                </Link>
              </div>
            </div>

            {/* Sidebar tóm tắt */}
            <div className="lg:w-80 flex-shrink-0 space-y-4">
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-5">Tóm tắt đơn hàng</h2>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Tạm tính</span>
                    <span className="font-medium text-gray-800">{formatPrice(subtotal)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Giảm giá ({couponApplied})</span>
                      <span className="font-medium">-{formatPrice(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600">
                    <span>Phí vận chuyển</span>
                    <span className="font-semibold text-[#1a2f6e]">Miễn phí</span>
                  </div>
                </div>

                <div className="border-t border-gray-100 mt-4 pt-4 flex justify-between items-end">
                  <span className="font-bold text-gray-800">Tổng cộng</span>
                  <div className="text-right">
                    <div className="text-xl font-bold text-[#1a2f6e]">{formatPrice(total)}</div>
                    <div className="text-xs text-gray-400 mt-0.5">Đã bao gồm VAT</div>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full mt-5 bg-[#1a2f6e] text-white py-3.5 rounded-xl font-semibold tracking-wide hover:bg-[#152558] transition-colors flex items-center justify-center gap-2"
                >
                  TIẾN HÀNH THANH TOÁN
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {/* Bảo mật */}
                <div className="mt-4 flex items-start gap-2 bg-gray-50 rounded-xl p-3">
                  <svg className="w-4 h-4 text-[#1a2f6e] mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7L12 2zm-1 13l-3-3 1.41-1.41L11 12.17l4.59-4.58L17 9l-6 6z" />
                  </svg>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    <span className="font-semibold text-gray-700">Bảo mật thanh toán:</span> Chúng tôi cam kết bảo vệ thông tin thanh toán và quyền riêng tư của khách hàng 100%.
                  </p>
                </div>
              </div>

              {/* Mã giảm giá */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Mã giảm giá</p>

                {couponApplied ? (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm font-semibold text-green-700">{couponApplied}</span>
                    </div>
                    <button onClick={handleRemoveCoupon} className="text-gray-400 hover:text-red-400 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Nhập mã ưu đãi"
                      value={coupon}
                      onChange={e => { setCoupon(e.target.value); setCouponError('') }}
                      onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                      className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1a2f6e] transition-colors"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      className="bg-gray-800 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-700 transition-colors whitespace-nowrap"
                    >
                      Áp dụng
                    </button>
                  </div>
                )}
                {couponError && <p className="text-red-400 text-xs mt-2">{couponError}</p>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
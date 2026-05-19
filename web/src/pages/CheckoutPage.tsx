import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useCartStore } from '../store/cartStore'
import { useAuthStore } from '../store/authStore'

const PROVINCES = [
  'Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ',
  'An Giang', 'Bà Rịa - Vũng Tàu', 'Bắc Giang', 'Bắc Kạn', 'Bạc Liêu',
  'Bắc Ninh', 'Bến Tre', 'Bình Định', 'Bình Dương', 'Bình Phước',
  'Bình Thuận', 'Cà Mau', 'Cao Bằng', 'Đắk Lắk', 'Đắk Nông',
  'Điện Biên', 'Đồng Nai', 'Đồng Tháp', 'Gia Lai', 'Hà Giang',
  'Hà Nam', 'Hà Tĩnh', 'Hải Dương', 'Hậu Giang', 'Hòa Bình',
  'Hưng Yên', 'Khánh Hòa', 'Kiên Giang', 'Kon Tum', 'Lai Châu',
  'Lâm Đồng', 'Lạng Sơn', 'Lào Cai', 'Long An', 'Nam Định',
  'Nghệ An', 'Ninh Bình', 'Ninh Thuận', 'Phú Thọ', 'Phú Yên',
  'Quảng Bình', 'Quảng Nam', 'Quảng Ngãi', 'Quảng Ninh', 'Quảng Trị',
  'Sóc Trăng', 'Sơn La', 'Tây Ninh', 'Thái Bình', 'Thái Nguyên',
  'Thanh Hóa', 'Thừa Thiên Huế', 'Tiền Giang', 'Trà Vinh', 'Tuyên Quang',
  'Vĩnh Long', 'Vĩnh Phúc', 'Yên Bái',
]

export default function CheckoutPage() {
  const navigate = useNavigate()
  const user = useAuthStore(s => s.user)
  const { items, clearCart } = useCartStore()

  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    province: 'Hồ Chí Minh',
    address_detail: '',
  })
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bank'>('cod')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(false)
  const [orderId, setOrderId] = useState<number | null>(null)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    if (items.length === 0) { navigate('/cart'); return }

    // Pre-fill họ tên từ user
    setForm(f => ({ ...f, full_name: user.full_name || '' }))

    // Tự động điền SĐT và địa chỉ nếu đã lưu
    const fetchSavedAddress = async () => {
      try {
        const res = await api.get(`/addresses/${user.user_id}`)
        const addr = Array.isArray(res.data) ? res.data[0] : res.data
        if (addr?.phone) {
          // phone lưu dạng INT trong DB → mất số 0 đầu, thêm lại
          const digits = addr.phone.toString().replace(/^0+/, '')
          setForm(f => ({
            ...f,
            phone: '0' + digits,
            address_detail: addr.address_detail || '',
          }))
        }
      } catch {
        // Chưa có địa chỉ, để trống
      }
    }
    fetchSavedAddress()
  }, [user, items])

  const formatPrice = (p: number) => p.toLocaleString('vi-VN') + '₫'

  const subtotal = items.reduce((s, i) => s + (i.price || 0) * i.quantity, 0)

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.full_name.trim()) e.full_name = 'Vui lòng nhập họ tên'
    if (!form.phone.trim()) e.phone = 'Vui lòng nhập số điện thoại'
    else if (!/^0[0-9]{9}$/.test(form.phone.replace(/\s/g, '')))
      e.phone = 'Số điện thoại phải có 10 chữ số và bắt đầu bằng 0'
    if (!form.address_detail.trim()) e.address_detail = 'Vui lòng nhập địa chỉ'
    return e
  }

  const handleOrder = async () => {
    const e = validate()
    if (Object.keys(e).length > 0) { setErrors(e); return }

    setLoading(true)
    try {
      // Tạo address trước
      const addrRes = await api.post('/addresses', {
        address_id: Math.floor(Math.random() * 900000) + 100000,
        user_id: user!.user_id,
        receiver_name: form.full_name,
        phone: Number(form.phone.replace(/\D/g, '').replace(/^0+/, '')),
        address_detail: `${form.address_detail}, ${form.province}`,
      })
      const address_id = addrRes.data.address_id

      // Đặt hàng
      const orderItems = items.map(i => ({
        product_id: i.product_id,
        quantity: i.quantity,
        price: i.price || 0,
      }))

      const orderRes = await api.post('/orders', {
        user_id: user!.user_id,
        address_id,
        items: orderItems,
        total_amount: subtotal,
        payment_method: paymentMethod,
      })

      setOrderId(orderRes.data.order_id)
      clearCart()
      setOrderSuccess(true)
    } catch {
      setErrors({ submit: 'Đặt hàng thất bại, vui lòng thử lại.' })
    }
    setLoading(false)
  }

  // Màn hình thành công
  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center max-w-md w-full">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Đặt hàng thành công!</h2>
          <p className="text-gray-500 mb-1">Mã đơn hàng: <span className="font-semibold text-[#1a2f6e]">#{orderId}</span></p>
          <p className="text-gray-400 text-sm mb-8">Chúng tôi sẽ liên hệ xác nhận đơn hàng trong thời gian sớm nhất.</p>
          <div className="flex gap-3">
            <Link
              to="/products"
              className="flex-1 border border-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors text-sm"
            >
              Tiếp tục mua sắm
            </Link>
            <Link
              to="/profile"
              className="flex-1 bg-[#1a2f6e] text-white py-3 rounded-xl font-semibold hover:bg-[#152558] transition-colors text-sm"
            >
              Xem đơn hàng
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header riêng cho checkout */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <Link
          to="/cart"
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#1a2f6e] transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Quay lại giỏ hàng
        </Link>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Cột trái: Form */}
          <div className="flex-1 space-y-6">

            {/* Thông tin giao hàng */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-[#1a2f6e] mb-6">Thông tin giao hàng</h2>

              <div className="space-y-4">
                {/* Họ tên */}
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Họ tên</label>
                  <input
                    type="text"
                    placeholder="Nguyễn Văn A"
                    value={form.full_name}
                    onChange={e => { setForm(f => ({ ...f, full_name: e.target.value })); setErrors(v => ({ ...v, full_name: '' })) }}
                    className={`w-full mt-1 border rounded-xl px-4 py-3 text-sm outline-none transition-colors ${errors.full_name ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-[#1a2f6e]'}`}
                  />
                  {errors.full_name && <p className="text-red-400 text-xs mt-1">{errors.full_name}</p>}
                </div>

                {/* SĐT + Tỉnh/TP */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Số điện thoại</label>
                    <input
                      type="tel"
                      placeholder="0901 234 567"
                      value={form.phone}
                      onChange={e => { setForm(f => ({ ...f, phone: e.target.value })); setErrors(v => ({ ...v, phone: '' })) }}
                      className={`w-full mt-1 border rounded-xl px-4 py-3 text-sm outline-none transition-colors ${errors.phone ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-[#1a2f6e]'}`}
                    />
                    {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Tỉnh/Thành phố</label>
                    <div className="relative mt-1">
                      <select
                        value={form.province}
                        onChange={e => setForm(f => ({ ...f, province: e.target.value }))}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1a2f6e] transition-colors appearance-none bg-white pr-8"
                      >
                        {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                      <svg className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Địa chỉ */}
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Địa chỉ</label>
                  <input
                    type="text"
                    placeholder="Số nhà, tên đường, phường/xã..."
                    value={form.address_detail}
                    onChange={e => { setForm(f => ({ ...f, address_detail: e.target.value })); setErrors(v => ({ ...v, address_detail: '' })) }}
                    className={`w-full mt-1 border rounded-xl px-4 py-3 text-sm outline-none transition-colors ${errors.address_detail ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-[#1a2f6e]'}`}
                  />
                  {errors.address_detail && <p className="text-red-400 text-xs mt-1">{errors.address_detail}</p>}
                </div>
              </div>
            </div>

            {/* Phương thức thanh toán */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-[#1a2f6e] mb-5">Phương thức thanh toán</h2>

              <div className="space-y-3">
                {/* COD */}
                <label
                  className={`flex items-center justify-between border rounded-xl px-5 py-4 cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'border-[#1a2f6e] bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${paymentMethod === 'cod' ? 'border-[#1a2f6e]' : 'border-gray-300'}`}>
                      {paymentMethod === 'cod' && <div className="w-2.5 h-2.5 rounded-full bg-[#1a2f6e]" />}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">Thanh toán khi nhận hàng (COD)</p>
                      <p className="text-xs text-gray-400 mt-0.5">Thanh toán bằng tiền mặt khi shipper giao hàng tận nơi</p>
                    </div>
                  </div>
                  {paymentMethod === 'cod' && (
                    <svg className="w-5 h-5 text-[#1a2f6e]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5l-4.5-4.5 1.41-1.41L10 13.67l7.09-7.09 1.41 1.41L10 16.5z" />
                    </svg>
                  )}
                  <input type="radio" className="sr-only" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
                </label>

                {/* Bank transfer */}
                <label
                  className={`flex items-center justify-between border rounded-xl px-5 py-4 cursor-pointer transition-colors ${paymentMethod === 'bank' ? 'border-[#1a2f6e] bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${paymentMethod === 'bank' ? 'border-[#1a2f6e]' : 'border-gray-300'}`}>
                      {paymentMethod === 'bank' && <div className="w-2.5 h-2.5 rounded-full bg-[#1a2f6e]" />}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">Chuyển khoản ngân hàng</p>
                      <p className="text-xs text-gray-400 mt-0.5">Chuyển khoản trực tiếp qua ứng dụng ngân hàng hoặc ATM</p>
                    </div>
                  </div>
                  {paymentMethod === 'bank' && (
                    <svg className="w-5 h-5 text-[#1a2f6e]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5l-4.5-4.5 1.41-1.41L10 13.67l7.09-7.09 1.41 1.41L10 16.5z" />
                    </svg>
                  )}
                  <input type="radio" className="sr-only" checked={paymentMethod === 'bank'} onChange={() => setPaymentMethod('bank')} />
                </label>

                {/* Thông tin chuyển khoản */}
                {paymentMethod === 'bank' && (
                  <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-2 border border-gray-100">
                    <p className="font-semibold text-gray-700">Thông tin chuyển khoản:</p>
                    <p className="text-gray-600">Ngân hàng: <span className="font-medium">Vietcombank</span></p>
                    <p className="text-gray-600">Số tài khoản: <span className="font-medium">1234 5678 9012</span></p>
                    <p className="text-gray-600">Chủ tài khoản: <span className="font-medium">CÔNG TY TECHATRIUM</span></p>
                    <p className="text-gray-500 text-xs mt-1">Nội dung CK: [Họ tên] - [SĐT]</p>
                  </div>
                )}
              </div>
            </div>

            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
                {errors.submit}
              </div>
            )}
          </div>

          {/* Cột phải: Đơn hàng */}
          <div className="lg:w-96 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-6">
              <h2 className="text-lg font-bold text-gray-800 mb-5">Đơn hàng của bạn</h2>

              {/* Danh sách sản phẩm */}
              <div className="space-y-4 mb-5">
                {items.map(item => (
                  <div key={item.cart_item_id} className="flex items-center gap-3">
                    {/* Ảnh + badge */}
                    <div className="relative flex-shrink-0">
                      <div className="w-14 h-14 rounded-xl bg-gray-100 overflow-hidden">
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#1a2f6e] text-white text-xs rounded-full flex items-center justify-center font-semibold">
                        {item.quantity}
                      </span>
                    </div>
                    {/* Tên + variant */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 line-clamp-1">{item.name}</p>
                      {item.variant && <p className="text-xs text-gray-400">{item.variant}</p>}
                    </div>
                    {/* Giá */}
                    <p className="text-sm font-semibold text-[#1a2f6e] flex-shrink-0">
                      {formatPrice((item.price || 0) * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Tổng tiền */}
              <div className="border-t border-gray-100 pt-4 space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Phí vận chuyển</span>
                  <span className="font-semibold text-[#1a2f6e]">Miễn phí</span>
                </div>
                <div className="flex justify-between items-end pt-2 border-t border-gray-100">
                  <span className="font-bold text-gray-800">Tổng cộng</span>
                  <span className="text-xl font-bold text-[#1a2f6e]">{formatPrice(subtotal)}</span>
                </div>
              </div>

              {/* Nút đặt hàng */}
              <button
                onClick={handleOrder}
                disabled={loading}
                className="w-full mt-5 bg-[#1a2f6e] text-white py-4 rounded-xl font-semibold text-base hover:bg-[#152558] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    Đặt hàng
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>

              <p className="text-center text-xs text-gray-400 mt-3 leading-relaxed">
                Bằng cách đặt hàng, bạn đồng ý với các{' '}
                <span className="text-[#1a2f6e] underline cursor-pointer">Điều khoản dịch vụ</span>{' '}
                của TuSigma.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
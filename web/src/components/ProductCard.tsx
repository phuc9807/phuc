import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useCartStore } from '../store/cartStore'
import api from '../services/api'

interface Props {
  product_id: number
  product_name: string
  price: number
  sale_price?: number
  on_sale?: boolean
  image: string
  slug: string
  stock: number
  onAddToCart?: () => void
}

export default function ProductCard({ product_id, product_name, price, sale_price, on_sale, image, slug, stock: initialStock }: Props) {
  const { user } = useAuthStore()
  const { fetchCart } = useCartStore()
  const [showLoginAlert, setShowLoginAlert] = useState(false)
  const [adding, setAdding] = useState(false)
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null)
  const [stock, setStock] = useState(initialStock)

  const isOnSale = on_sale && sale_price && sale_price < price
  const displayPrice = isOnSale ? sale_price! : price
  const discount = isOnSale ? Math.round((1 - sale_price! / price) * 100) : 0

  const handleAction = async () => {
    if (!user) {
      setShowLoginAlert(true)
      setTimeout(() => setShowLoginAlert(false), 2500)
      return
    }
    setAdding(true)
    setMsg(null)
    try {
      await api.post('/cart', {
        user_id: user.user_id,
        product_id,
        quantity: 1,
      })
      await fetchCart(user.user_id)
      setStock(s => s - 1)
      setMsg({ text: 'Đã thêm vào giỏ!', type: 'success' })
    } catch {
      setMsg({ text: 'Đã hết hàng!', type: 'error' })
    } finally {
      setAdding(false)
      setTimeout(() => setMsg(null), 2000)
    }
  }

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow border border-gray-100 relative">

      {/* Badge sale */}
      {isOnSale && (
        <div className="absolute top-3 left-3 z-10 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
          -{discount}%
        </div>
      )}

      {/* Thông báo yêu cầu đăng nhập */}
      {showLoginAlert && (
        <div className="absolute inset-0 z-20 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center animate-in fade-in duration-300">
          <div className="bg-orange-100 p-2 rounded-full mb-2">
            <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-[#1a2f6e] font-bold text-sm">Vui lòng đăng nhập</p>
          <p className="text-gray-500 text-xs mt-1">Để thực hiện chức năng này</p>
          <Link
            to="/login"
            className="mt-3 text-xs font-semibold text-white bg-[#1a2f6e] px-4 py-1.5 rounded-full hover:bg-[#152558]"
          >
            Đăng nhập ngay
          </Link>
        </div>
      )}

      <Link to={`/products/${slug}`}>
        <div className="bg-gray-50 flex items-center justify-center h-52 p-4">
          <img
            src={image}
            alt={product_name}
            className="h-full object-contain hover:scale-105 transition-transform"
          />
        </div>
      </Link>

      <div className="p-4">
        <Link to={`/products/${slug}`}>
          <h3 className="font-semibold text-gray-800 hover:text-[#1a2f6e] transition-colors line-clamp-2 text-sm">
            {product_name}
          </h3>
        </Link>

        <p className={`text-xs mt-1 font-medium ${stock > 0 ? 'text-green-500' : 'text-red-400'}`}>
          {stock > 0 ? `Còn ${stock} sản phẩm` : 'Hết hàng'}
        </p>

        {msg && (
          <p className={`text-xs font-medium mt-1 ${msg.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
            {msg.text}
          </p>
        )}

        <div className="flex items-center justify-between mt-3">
          <div>
            <span className="text-[#1a2f6e] font-bold text-sm">
              {displayPrice.toLocaleString('vi-VN')}đ
            </span>
            {isOnSale && (
              <span className="ml-1.5 text-xs text-gray-400 line-through">
                {price.toLocaleString('vi-VN')}đ
              </span>
            )}
          </div>
          <button
            onClick={handleAction}
            disabled={adding || stock === 0}
            className="bg-[#1a2f6e] text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-[#152558] transition-colors flex items-center gap-1 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {adding ? 'Đang thêm...' : 'Thêm vào giỏ'}
          </button>
        </div>
      </div>
    </div>
  )
}
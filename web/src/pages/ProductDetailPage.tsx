import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'
import ProductCard from '../components/ProductCard'
import { useAuthStore } from '../store/authStore'
import { useCartStore } from '../store/cartStore'

interface Product {
  product_id: number
  product_name: string
  price: number
  sale_price?: number
  on_sale?: boolean
  image: string
  slug: string
  description: string
  stock: number
  category_id: number
}

export default function ProductDetailPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { fetchCart } = useCartStore()

  const [product, setProduct] = useState<Product | null>(null)
  const [related, setRelated] = useState<Product[]>([])
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [cartMsg, setCartMsg] = useState('')
  const [cartMsgType, setCartMsgType] = useState<'success' | 'error'>('success')
  const [addingToCart, setAddingToCart] = useState(false)

  useEffect(() => {
    setLoading(true)
    api.get(`/products/${slug}`).then(res => {
      setProduct(res.data)
      setQuantity(1)
      setCartMsg('')
      setLoading(false)
    }).catch(() => navigate('/products'))
  }, [slug])

  useEffect(() => {
    if (!product) return
    api.get('/products').then(res => {
      const all: Product[] = res.data
      const others = all.filter(p => p.product_id !== product.product_id)
      const shuffled = others.sort(() => Math.random() - 0.5).slice(0, 4)
      setRelated(shuffled)
    })
  }, [product])

  const isOnSale = product?.on_sale && product?.sale_price && product.sale_price < product.price
  const displayPrice = isOnSale ? product!.sale_price! : product?.price || 0
  const discount = isOnSale ? Math.round((1 - product!.sale_price! / product!.price) * 100) : 0

  const handleAddToCart = async () => {
    if (!user) {
      setCartMsgType('error')
      setCartMsg('Vui lòng đăng nhập để thêm vào giỏ hàng!')
      return
    }
    setAddingToCart(true)
    try {
      await api.post('/cart', {
        user_id: user.user_id,
        product_id: product!.product_id,
        quantity,
      })
      await fetchCart(user.user_id) // Cập nhật icon giỏ hàng trên Header ngay lập tức
      setCartMsgType('success')
      setCartMsg('Đã thêm vào giỏ hàng!')
    } catch {
      setCartMsgType('error')
      setCartMsg('Có lỗi xảy ra, vui lòng thử lại!')
    }
    setAddingToCart(false)
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-96">
      <div className="w-8 h-8 border-4 border-[#1a2f6e] border-t-transparent rounded-full animate-spin"></div>
    </div>
  )

  if (!product) return null

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* Chi tiết sản phẩm */}
      <div className="flex flex-col md:flex-row gap-10 bg-white rounded-3xl p-8 shadow-sm border border-gray-100">

        {/* Ảnh */}
        <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-2xl p-8 min-h-80">
          <img
            src={product.image}
            alt={product.product_name}
            className="max-h-80 object-contain"
          />
        </div>

        {/* Thông tin */}
        <div className="flex-1 flex flex-col gap-4">
          <h1 className="text-2xl font-bold text-gray-800">{product.product_name}</h1>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-[#1a2f6e]">
              {displayPrice.toLocaleString('vi-VN')}đ
            </span>
            {isOnSale && (
              <>
                <span className="text-lg text-gray-400 line-through">
                  {product.price.toLocaleString('vi-VN')}đ
                </span>
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  -{discount}%
                </span>
              </>
            )}
          </div>

          <p className="text-sm text-gray-500">
            Tình trạng:{' '}
            <span className={product.stock > 0 ? 'text-green-500 font-medium' : 'text-red-500 font-medium'}>
              {product.stock > 0 ? `Còn hàng (${product.stock})` : 'Hết hàng'}
            </span>
          </p>

          {/* Tăng giảm số lượng */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-600">Số lượng:</span>
            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors text-lg"
              >−</button>
              <span className="w-12 text-center text-sm font-semibold">{quantity}</span>
              <button
                onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors text-lg"
              >+</button>
            </div>
          </div>

          {/* Thông báo giỏ hàng */}
          {cartMsg && (
            <p className={`text-sm font-medium ${cartMsgType === 'success' ? 'text-green-500' : 'text-red-500'}`}>
              {cartMsg}
            </p>
          )}

          {/* Nút thêm giỏ */}
          <div className="flex gap-3 mt-2">
            <button
              onClick={handleAddToCart}
              disabled={addingToCart || product.stock === 0}
              className="flex-1 flex items-center justify-center gap-2 bg-[#1a2f6e] text-white py-3 rounded-xl font-semibold hover:bg-[#152558] transition-colors disabled:opacity-50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {addingToCart ? 'Đang thêm...' : 'Thêm vào giỏ hàng'}
            </button>
          </div>

          {/* Tiện ích */}
          <div className="flex gap-6 mt-2 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <svg className="w-5 h-5 text-[#1a2f6e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8l1 12a2 2 0 002 2h8a2 2 0 002-2L19 8" />
              </svg>
              Giao hàng miễn phí
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <svg className="w-5 h-5 text-[#1a2f6e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Bảo hành 12 tháng
            </div>
          </div>
        </div>
      </div>

      {/* Tab mô tả */}
      <div className="mt-8 bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
        <div className="border-b border-gray-100 mb-6">
          <span className="inline-block pb-3 text-sm font-semibold text-[#1a2f6e] border-b-2 border-[#1a2f6e]">
            Mô tả
          </span>
        </div>
        <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
          {product.description || 'Chưa có mô tả cho sản phẩm này.'}
        </p>
      </div>

      {/* Có thể bạn sẽ thích */}
      {related.length > 0 && (
        <div className="mt-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-7 bg-[#1a2f6e] rounded-full"></div>
            <h2 className="text-xl font-bold text-gray-800">Có Thể Bạn Sẽ Thích</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {related.map(p => (
              <ProductCard key={p.product_id} {...p} />
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
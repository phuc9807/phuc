import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useAuthStore } from '../store/authStore'

interface OrderDetail {
  order_detail_id: number
  order_id: number
  product_id: number
  quantity: number
  price: number
  // enriched
  product_name?: string
  product_image?: string
}

interface Order {
  _id: string
  order_id: number
  order_date: string
  total_amount: number
  status: string
  details: OrderDetail[]
}

const statusConfig: Record<string, { label: string; className: string; dot: string }> = {
  pending:   { label: 'Chờ xác nhận', className: 'bg-yellow-50 text-yellow-700 border border-yellow-200',  dot: 'bg-yellow-500' },
  confirmed: { label: 'Đã xác nhận',  className: 'bg-blue-50 text-blue-700 border border-blue-200',        dot: 'bg-blue-500' },
  shipping:  { label: 'Đang giao',    className: 'bg-purple-50 text-purple-700 border border-purple-200',  dot: 'bg-purple-500' },
  delivered: { label: 'Hoàn thành',   className: 'bg-green-50 text-green-700 border border-green-200',     dot: 'bg-green-500' },
  cancelled: { label: 'Đã hủy',       className: 'bg-red-50 text-red-600 border border-red-200',           dot: 'bg-red-500' },
}

const tabs = [
  { key: '',          label: 'Tất cả' },
  { key: 'pending',   label: 'Chờ xác nhận' },
  { key: 'confirmed', label: 'Đã xác nhận' },
  { key: 'shipping',  label: 'Đang giao' },
  { key: 'delivered', label: 'Hoàn thành' },
  { key: 'cancelled', label: 'Đã hủy' },
]

export default function OrdersPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('')
  const [cancelling, setCancelling] = useState<number | null>(null)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    fetchOrders()
  }, [user])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const [ordersRes, detailsRes, productsRes] = await Promise.all([
        api.get(`/orders/${user!.user_id}`),
        api.get('/orders/details/all'),
        api.get('/products'),
      ])
      const rawOrders: any[] = ordersRes.data || []
      const allDetails: any[] = detailsRes.data || []
      const products: any[] = productsRes.data || []

      const productMap = Object.fromEntries(
        products.map((p: any) => [p.product_id, { name: p.product_name, image: p.image }])
      )

      const enriched: Order[] = rawOrders
        .sort((a, b) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime())
        .map((o: any) => ({
          _id: o._id,
          order_id: o.order_id,
          order_date: o.order_date,
          total_amount: o.total_amount,
          status: o.status,
          details: allDetails
            .filter(d => d.order_id === o.order_id)
            .map(d => ({
              order_detail_id: d.order_detail_id,
              order_id: d.order_id,
              product_id: d.product_id,
              quantity: d.quantity,
              price: d.price,
              product_name: productMap[d.product_id]?.name || 'Sản phẩm',
              product_image: productMap[d.product_id]?.image || '',
            })),
        }))

      setOrders(enriched)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (order_id: number) => {
    setCancelling(order_id)
    try {
      await api.put(`/orders/${order_id}/status`, { status: 'cancelled' })
      setOrders(prev => prev.map(o => o.order_id === order_id ? { ...o, status: 'cancelled' } : o))
    } finally {
      setCancelling(null)
    }
  }

  const filtered = activeTab ? orders.filter(o => o.status === activeTab) : orders

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Lịch sử đơn hàng</h1>
        <p className="text-sm text-gray-400 mt-0.5">Quản lý và theo dõi các đơn hàng gần đây của bạn.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 mb-6 scrollbar-none">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
              activeTab === tab.key
                ? 'bg-[#1a2f6e] text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-[#1a2f6e] hover:text-[#1a2f6e]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
              <div className="h-4 bg-gray-100 rounded w-1/3 mb-4"/>
              <div className="h-16 bg-gray-100 rounded mb-4"/>
              <div className="h-4 bg-gray-100 rounded w-1/4"/>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <svg className="w-12 h-12 text-gray-200 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
          </svg>
          <p className="text-gray-400 font-medium">Chưa có đơn hàng nào</p>
          <button
            onClick={() => navigate('/products')}
            className="mt-4 px-5 py-2 bg-[#1a2f6e] text-white text-sm font-semibold rounded-xl hover:bg-[#152558] transition-colors"
          >
            Mua sắm ngay
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(order => {
            const sc = statusConfig[order.status] || { label: order.status, className: 'bg-gray-50 text-gray-600 border border-gray-200', dot: 'bg-gray-400' }
            const dateStr = new Date(order.order_date).toLocaleDateString('vi-VN', {
              day: '2-digit', month: 'long', year: 'numeric',
            })
            const firstProduct = order.details[0]
            const extraCount = order.details.length - 1

            return (
              <div key={order._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Order header */}
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-gray-50/60">
                  <div>
                    <span className="text-xs text-gray-400 font-medium">MÃ ĐƠN: </span>
                    <span className="text-xs font-bold text-gray-700">#{String(order.order_id).padStart(6, '0')}</span>
                    <span className="text-gray-300 mx-2">·</span>
                    <span className="text-xs text-gray-400">{dateStr}</span>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${sc.className}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`}/>
                    {sc.label}
                  </span>
                </div>

                {/* Product preview */}
                <div className="px-5 py-4">
                  {firstProduct && (
                    <div className="flex items-center gap-4">
                      {/* Stacked images */}
                      <div className="relative flex-shrink-0 h-14" style={{ width: order.details.length > 1 ? '64px' : '56px' }}>
                        {order.details.slice(0, 2).map((d, i) => (
                          <img
                            key={d.order_detail_id}
                            src={d.product_image || 'https://placehold.co/56x56?text=?'}
                            alt={d.product_name}
                            className="absolute w-14 h-14 object-cover rounded-xl border-2 border-white shadow-sm"
                            style={{ left: i * 10, zIndex: 2 - i }}
                            onError={e => { e.currentTarget.src = 'https://placehold.co/56x56?text=?' }}
                          />
                        ))}
                        {extraCount > 1 && (
                          <div className="absolute w-14 h-14 rounded-xl bg-gray-800/60 flex items-center justify-center text-white text-xs font-bold" style={{ left: 10, zIndex: 3 }}>
                            +{extraCount}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 truncate">
                          {firstProduct.product_name}
                          {extraCount > 0 && <span className="text-gray-400 font-normal"> & {extraCount} sản phẩm khác</span>}
                        </p>
                        <p className="text-sm text-gray-400 mt-0.5">Số lượng: {firstProduct.quantity}</p>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <p className="text-xs text-gray-400">Tổng thanh toán</p>
                        <p className="text-lg font-bold text-[#1a2f6e]">{order.total_amount.toLocaleString('vi-VN')}đ</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-gray-100">
                  {order.status === 'pending' && (
                    <button
                      onClick={() => handleCancel(order.order_id)}
                      disabled={cancelling === order.order_id}
                      className="px-4 py-2 text-sm font-medium text-red-500 border border-red-200 rounded-xl hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      {cancelling === order.order_id ? 'Đang hủy...' : 'Hủy đơn'}
                    </button>
                  )}
                  {order.status === 'delivered' && (
                    <button
                      onClick={() => navigate('/products')}
                      className="px-4 py-2 text-sm font-medium text-[#1a2f6e] border border-[#1a2f6e]/20 rounded-xl hover:bg-blue-50 transition-colors"
                    >
                      Mua lại
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
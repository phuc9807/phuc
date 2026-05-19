import { useEffect, useState } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import Header from '../components/Header';
import api from '../services/api';

interface Order {
  _id: string;
  order_id: number;
  user_id: number;
  address_id: number;
  order_date: string;
  total_amount: number;
  status: string;
  // enriched
  buyer_name?: string;
  buyer_email?: string;
}

interface OrderDetail {
  order_detail_id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
  // enriched
  product_name?: string;
  product_image?: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  pending:   { label: 'Đang chờ xác nhận', className: 'bg-yellow-100 text-yellow-700' },
  confirmed: { label: 'Đã xác nhận',       className: 'bg-blue-100 text-blue-700' },
  shipping:  { label: 'Đang giao',         className: 'bg-purple-100 text-purple-700' },
  delivered: { label: 'Hoàn thành',        className: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Đã hủy',            className: 'bg-red-100 text-red-700' },
};

const statusOptions = [
  { value: 'pending',   label: 'Đang chờ xác nhận', className: 'bg-yellow-100 text-yellow-700' },
  { value: 'confirmed', label: 'Đã xác nhận',        className: 'bg-blue-100 text-blue-700' },
  { value: 'shipping',  label: 'Đang giao',          className: 'bg-purple-100 text-purple-700' },
  { value: 'delivered', label: 'Hoàn thành',         className: 'bg-green-100 text-green-700' },
  { value: 'cancelled', label: 'Đã hủy',             className: 'bg-red-100 text-red-700' },
];

function initials(name?: string) {
  if (!name) return '??';
  return name.split(' ').slice(-2).map(w => w[0]).join('').toUpperCase();
}

const avatarColors = [
  'bg-blue-500', 'bg-purple-500', 'bg-teal-500',
  'bg-orange-500', 'bg-pink-500', 'bg-indigo-500',
];

// ── Modal sửa trạng thái ──────────────────────────────────────────────────────
function EditStatusModal({
  orderId,
  currentStatus,
  onClose,
  onSaved,
}: {
  orderId: number;
  currentStatus: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [selected, setSelected] = useState(currentStatus);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await api.put(`/orders/${orderId}/status`, { status: selected });
      onSaved();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Lỗi khi cập nhật trạng thái');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-bold text-gray-900">Cập nhật trạng thái</h3>
            <p className="text-xs text-gray-400 mt-0.5">Đơn hàng #{String(orderId).slice(-6)}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className="space-y-2 mb-5">
          {statusOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => setSelected(opt.value)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all ${
                selected === opt.value ? 'border-[#1a2f6e] bg-blue-50' : 'border-gray-100 hover:border-gray-200 bg-white'
              }`}
            >
              <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-semibold ${opt.className}`}>
                {opt.label}
              </span>
              {selected === opt.value && (
                <svg width="16" height="16" fill="none" stroke="#1a2f6e" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M20 6 9 17l-5-5"/>
                </svg>
              )}
            </button>
          ))}
        </div>

        {error && <p className="text-red-500 text-xs mb-3">{error}</p>}

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm font-medium border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={saving || selected === currentStatus}
            className="flex-1 py-2.5 text-sm font-semibold text-white bg-[#1a2f6e] hover:bg-[#152558] rounded-xl transition-colors disabled:opacity-50"
          >
            {saving ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Trang chính ───────────────────────────────────────────────────────────────
const ITEMS_PER_PAGE = 10;

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);

  const [editModal, setEditModal] = useState<{ orderId: number; status: string } | null>(null);
  const [detailModal, setDetailModal] = useState<{ orderId: number; buyerName: string } | null>(null);
  const [orderDetails, setOrderDetails] = useState<OrderDetail[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const [ordersRes, usersRes] = await Promise.all([
        api.get('/orders/all'),
        api.get('/auth/users'),
      ]);
      const rawOrders: any[] = ordersRes.data || [];
      const users: any[] = usersRes.data || [];
      const userMap = Object.fromEntries(
        users.map((u: any) => [u.user_id || u._id, { name: u.full_name, email: u.email }])
      );
      const enriched: Order[] = rawOrders.map((o: any) => ({
        _id: o._id,
        order_id: o.order_id,
        user_id: o.user_id,
        address_id: o.address_id,
        order_date: o.order_date,
        total_amount: o.total_amount,
        status: o.status,
        buyer_name: userMap[o.user_id]?.name || 'Khách',
        buyer_email: userMap[o.user_id]?.email || '',
      }));
      setOrders(enriched);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  // Stats
  const totalOrders = orders.length;
  const pendingCount = orders.filter(o => o.status === 'pending').length;
  const confirmedCount = orders.filter(o => o.status === 'confirmed').length;
  const shippingCount = orders.filter(o => o.status === 'shipping').length;
  const deliveredCount = orders.filter(o => o.status === 'delivered').length;
  const cancelledCount = orders.filter(o => o.status === 'cancelled').length;

  // Filter
  const filtered = orders.filter(o => {
    const matchSearch =
      String(o.order_id).includes(search) ||
      (o.buyer_name || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus ? o.status === filterStatus : true;
    const oDate = o.order_date ? new Date(o.order_date) : null;
    const matchFrom = dateFrom ? (oDate ? oDate >= new Date(dateFrom) : false) : true;
    const matchTo = dateTo ? (oDate ? oDate <= new Date(dateTo + 'T23:59:59') : false) : true;
    return matchSearch && matchStatus && matchFrom && matchTo;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  // Page numbers to show
  const getPageNumbers = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 3) return [1, 2, 3, '...', totalPages];
    if (page >= totalPages - 2) return [1, '...', totalPages - 2, totalPages - 1, totalPages];
    return [1, '...', page - 1, page, page + 1, '...', totalPages];
  };

  const statCards = [
    {
      label: 'TỔNG ĐƠN HÀNG',
      value: totalOrders,
      badge: null,
      icon: (
        <svg width="22" height="22" fill="none" stroke="#1a2f6e" strokeWidth="1.8" viewBox="0 0 24 24">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
          <rect x="9" y="3" width="6" height="4" rx="1"/>
          <path d="M9 12h6M9 16h4"/>
        </svg>
      ),
    },
    {
      label: 'ĐANG CHỜ XÁC NHẬN',
      value: pendingCount,
      badge: { text: 'CẦN XỬ LÝ', className: 'bg-yellow-100 text-yellow-700' },
      icon: (
        <svg width="22" height="22" fill="none" stroke="#1a2f6e" strokeWidth="1.8" viewBox="0 0 24 24">
          <path d="M12 8v4l3 3"/>
          <circle cx="12" cy="12" r="9"/>
        </svg>
      ),
    },
    {
      label: 'ĐÃ XÁC NHẬN',
      value: confirmedCount,
      badge: { text: 'ĐÃ DUYỆT', className: 'bg-blue-100 text-blue-700' },
      icon: (
        <svg width="22" height="22" fill="none" stroke="#1a2f6e" strokeWidth="1.8" viewBox="0 0 24 24">
          <path d="M9 12l2 2 4-4"/>
          <circle cx="12" cy="12" r="9"/>
        </svg>
      ),
    },
    {
      label: 'ĐANG GIAO',
      value: shippingCount,
      badge: { text: 'TRÊN ĐƯỜNG', className: 'bg-purple-100 text-purple-700' },
      icon: (
        <svg width="22" height="22" fill="none" stroke="#1a2f6e" strokeWidth="1.8" viewBox="0 0 24 24">
          <rect x="1" y="3" width="15" height="13" rx="1"/>
          <path d="M16 8h4l3 3v5h-7V8z"/>
          <circle cx="5.5" cy="18.5" r="2.5"/>
          <circle cx="18.5" cy="18.5" r="2.5"/>
        </svg>
      ),
    },
    {
      label: 'HOÀN THÀNH',
      value: deliveredCount,
      badge: { text: 'THÀNH CÔNG', className: 'bg-green-100 text-green-700' },
      icon: (
        <svg width="22" height="22" fill="none" stroke="#1a2f6e" strokeWidth="1.8" viewBox="0 0 24 24">
          <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
          <path d="M22 4 12 14.01l-3-3"/>
        </svg>
      ),
    },
    {
      label: 'ĐÃ HỦY',
      value: cancelledCount,
      badge: { text: 'ĐÃ HỦY', className: 'bg-red-100 text-red-600' },
      icon: (
        <svg width="22" height="22" fill="none" stroke="#1a2f6e" strokeWidth="1.8" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9"/>
          <path d="M15 9l-6 6M9 9l6 6"/>
        </svg>
      ),
    },
  ];

  const fetchOrderDetails = async (orderId: number) => {
    setDetailLoading(true);
    try {
      const [detailsRes, productsRes] = await Promise.all([
        api.get(`/orders/${orderId}/details`),
        api.get('/products'),
      ]);
      const details: OrderDetail[] = detailsRes.data || [];
      const allProducts: any[] = productsRes.data || [];
      const enriched = details.map(d => {
        const p = allProducts.find((p: any) => p.product_id === d.product_id);
        return {
          ...d,
          product_name: p?.product_name || 'Sản phẩm',
          product_image: p?.image || '',
        };
      });
      setOrderDetails(enriched);
    } catch {
      setOrderDetails([]);
    }
    setDetailLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />

      {detailModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[80vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 className="text-base font-bold text-gray-900">Chi tiết đơn hàng</h3>
                <p className="text-xs text-gray-400 mt-0.5">{detailModal.buyerName} · #{String(detailModal.orderId).padStart(6, '0')}</p>
              </div>
              <button onClick={() => setDetailModal(null)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
            {/* Body */}
            <div className="overflow-y-auto flex-1 px-6 py-4">
              {detailLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse"/>)}
                </div>
              ) : orderDetails.length === 0 ? (
                <p className="text-center text-gray-400 py-8">Không có sản phẩm nào</p>
              ) : (
                <div className="space-y-3">
                  {orderDetails.map(d => (
                    <div key={d.order_detail_id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                      <div className="w-14 h-14 rounded-xl bg-gray-200 overflow-hidden flex-shrink-0">
                        {d.product_image
                          ? <img src={d.product_image} alt={d.product_name} className="w-full h-full object-cover"/>
                          : <div className="w-full h-full flex items-center justify-center">
                              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                              </svg>
                            </div>
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 text-sm line-clamp-1">{d.product_name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">x{d.quantity}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-[#1a2f6e]">{(d.price * d.quantity).toLocaleString('vi-VN')}đ</p>
                        <p className="text-xs text-gray-400">{d.price.toLocaleString('vi-VN')}đ / cái</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Footer tổng */}
            {!detailLoading && orderDetails.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center">
                <span className="text-sm text-gray-500">{orderDetails.length} sản phẩm</span>
                <span className="font-bold text-[#1a2f6e]">
                  {orderDetails.reduce((s, d) => s + d.price * d.quantity, 0).toLocaleString('vi-VN')}đ
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {editModal && (
        <EditStatusModal
          orderId={editModal.orderId}
          currentStatus={editModal.status}
          onClose={() => setEditModal(null)}
          onSaved={() => { setEditModal(null); fetchOrders(); }}
        />
      )}

      <div className="ml-56 flex-1 flex flex-col">
        <Header />

        <main className="flex-1 px-8 py-8">
          {/* Page header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#1a2f6e]">Quản lý Đơn Hàng</h1>
            <p className="text-sm text-gray-400 mt-0.5">Theo dõi và xử lý toàn bộ đơn hàng của hệ thống</p>
          </div>

          {/* Stat cards */}
          {loading ? (
            <div className="grid grid-cols-6 gap-4 mb-6">
              {[...Array(6)].map((_, i) => <div key={i} className="h-28 bg-white rounded-2xl animate-pulse border border-gray-100"/>)}
            </div>
          ) : (
            <div className="grid grid-cols-6 gap-4 mb-6">
              {statCards.map(card => (
                <div key={card.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                      {card.icon}
                    </div>
                    {card.badge && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${card.badge.className}`}>
                        {card.badge.text}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">{card.label}</p>
                  <p className="text-2xl font-bold text-[#1a2f6e]">{card.value.toLocaleString('vi-VN')}</p>
                </div>
              ))}
            </div>
          )}

          {/* Filter bar */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5 flex items-center gap-3">
            <div className="relative flex-1 max-w-xs">
              <svg className="absolute left-3 top-2.5 text-gray-400" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text"
                placeholder="Tìm theo mã đơn, khách hàng..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2f6e]/20"
              />
            </div>

            <select
              value={filterStatus}
              onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
              className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2f6e]/20 bg-white"
            >
              <option value="">Tất cả trạng thái</option>
              {statusOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 border border-gray-200 rounded-xl px-3 py-2">
                <svg width="14" height="14" fill="none" stroke="#9ca3af" strokeWidth="1.8" viewBox="0 0 24 24">
                  <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
                </svg>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={e => { setDateFrom(e.target.value); setPage(1); }}
                  className="text-sm focus:outline-none bg-transparent"
                />
              </div>
              <span className="text-gray-400 text-sm">→</span>
              <div className="flex items-center gap-1.5 border border-gray-200 rounded-xl px-3 py-2">
                <svg width="14" height="14" fill="none" stroke="#9ca3af" strokeWidth="1.8" viewBox="0 0 24 24">
                  <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
                </svg>
                <input
                  type="date"
                  value={dateTo}
                  onChange={e => { setDateTo(e.target.value); setPage(1); }}
                  className="text-sm focus:outline-none bg-transparent"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-6 space-y-3">
                {[...Array(6)].map((_, i) => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse"/>)}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-3">ID Đơn Hàng</th>
                        <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 py-3">Khách Hàng</th>
                        <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 py-3">Ngày Đặt</th>
                        <th className="text-right text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 py-3">Tổng Tiền</th>
                        <th className="text-center text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 py-3">Trạng Thái</th>
                        <th className="text-center text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 py-3">Chi Tiết</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {paginated.length === 0 && (
                        <tr>
                          <td colSpan={6} className="text-center py-12 text-gray-400">Không tìm thấy đơn hàng nào</td>
                        </tr>
                      )}
                      {paginated.map((order, idx) => {
                        const sc = statusConfig[order.status] || { label: order.status, className: 'bg-gray-100 text-gray-600' };
                        const avatarBg = avatarColors[idx % avatarColors.length];
                        const dateStr = order.order_date
                          ? new Date(order.order_date).toLocaleDateString('vi-VN')
                          : '—';
                        return (
                          <tr key={order._id} className="hover:bg-gray-50/60 transition-colors">
                            <td className="px-6 py-4">
                              <span className="font-mono font-semibold text-[#1a2f6e]">
                                #{String(order.order_id).padStart(6, '0')}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${avatarBg}`}>
                                  {initials(order.buyer_name)}
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-800">{order.buyer_name}</p>
                                  {order.buyer_email && (
                                    <p className="text-xs text-gray-400">{order.buyer_email}</p>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-gray-500">{dateStr}</td>
                            <td className="px-4 py-4 text-right font-bold text-gray-800">
                              {order.total_amount.toLocaleString('vi-VN')} VNĐ
                            </td>
                            <td className="px-4 py-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-semibold ${sc.className}`}>
                                  {sc.label}
                                </span>
                                <button
                                  onClick={() => setEditModal({ orderId: order.order_id, status: order.status })}
                                  className="text-gray-400 hover:text-[#1a2f6e] p-1 rounded-lg hover:bg-blue-50 transition-colors flex-shrink-0"
                                  title="Sửa trạng thái"
                                >
                                  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                  </svg>
                                </button>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-center">
                              <button
                                onClick={() => {
                                  setDetailModal({ orderId: order.order_id, buyerName: order.buyer_name || 'Khách' });
                                  fetchOrderDetails(order.order_id);
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#1a2f6e] bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                              >
                                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                  <circle cx="12" cy="12" r="3"/>
                                </svg>
                                Xem
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                  <p className="text-sm text-gray-400">
                    Hiển thị <span className="font-medium text-gray-600">{Math.min((page - 1) * ITEMS_PER_PAGE + 1, filtered.length)}–{Math.min(page * ITEMS_PER_PAGE, filtered.length)}</span> trên <span className="font-medium text-gray-600">{filtered.length.toLocaleString('vi-VN')}</span> đơn hàng
                  </p>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg>
                    </button>
                    {getPageNumbers().map((n, i) =>
                      n === '...'
                        ? <span key={`ellipsis-${i}`} className="w-8 text-center text-gray-400">…</span>
                        : (
                          <button
                            key={n}
                            onClick={() => setPage(Number(n))}
                            className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                              n === page ? 'bg-[#1a2f6e] text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            {n}
                          </button>
                        )
                    )}
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
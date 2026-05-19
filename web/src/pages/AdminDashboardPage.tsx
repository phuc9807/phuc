import { useEffect, useState } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import Header from '../components/Header';
import api from '../services/api';

interface StatCard {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}

interface RecentOrder {
  order_detail_id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  product_name?: string;
  buyer_name?: string;
  order_date?: string;
  status?: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  delivered: { label: 'Đã giao',       className: 'bg-green-100 text-green-700' },
  confirmed: { label: 'Đã xác nhận',   className: 'bg-blue-100 text-blue-700' },
  shipping:  { label: 'Đang giao',     className: 'bg-purple-100 text-purple-700' },
  pending:   { label: 'Chờ xác nhận', className: 'bg-yellow-100 text-yellow-700' },
  cancelled: { label: 'Đã hủy',        className: 'bg-red-100 text-red-700' },
};

function initials(name?: string) {
  if (!name) return '??';
  return name.split(' ').slice(-2).map((w) => w[0]).join('').toUpperCase();
}

const avatarColors = [
  'bg-blue-100 text-blue-700',
  'bg-purple-100 text-purple-700',
  'bg-teal-100 text-teal-700',
  'bg-orange-100 text-orange-700',
];

const statusOptions = [
  { value: 'pending',   label: 'Chờ xác nhận', className: 'bg-yellow-100 text-yellow-700' },
  { value: 'confirmed', label: 'Đã xác nhận',  className: 'bg-blue-100 text-blue-700' },
  { value: 'shipping',  label: 'Đang giao',    className: 'bg-purple-100 text-purple-700' },
  { value: 'delivered', label: 'Đã giao',      className: 'bg-green-100 text-green-700' },
  { value: 'cancelled', label: 'Đã hủy',       className: 'bg-red-100 text-red-700' },
];

function EditStatusModal({
  orderId,
  currentStatus,
  onClose,
  onSaved,
}: {
  orderId: string;
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
            <p className="text-xs text-gray-400 mt-0.5">Đơn hàng #{String(orderId).slice(-6).toUpperCase()}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="space-y-2 mb-5">
          {statusOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => setSelected(opt.value)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all text-sm font-medium ${
                selected === opt.value
                  ? 'border-[#1a2f6e] bg-blue-50'
                  : 'border-gray-100 hover:border-gray-200 bg-white'
              }`}
            >
              <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-semibold ${opt.className}`}>
                {opt.label}
              </span>
              {selected === opt.value && (
                <svg width="16" height="16" fill="none" stroke="#1a2f6e" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg>
              )}
            </button>
          ))}
        </div>

        {error && <p className="text-red-500 text-xs mb-3">{error}</p>}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-sm font-medium border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
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

export default function AdminDashboardPage() {
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [totalStock, setTotalStock] = useState<number>(0);
  const [totalCustomers, setTotalCustomers] = useState<number>(0);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [allOrderDetails, setAllOrderDetails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState<{ orderId: string; status: string } | null>(null);

  // Tính lại doanh thu ngay khi recentOrders đổi trạng thái
  useEffect(() => {
    if (allOrderDetails.length === 0) return;
    const statusMap = Object.fromEntries(recentOrders.map(o => [o.order_id, o.status]));
    const revenue = allOrderDetails.reduce((sum: number, d: any) => {
      const status = statusMap[d.order_id] ?? d._status;
      return status === 'delivered' ? sum + d.price * d.quantity : sum;
    }, 0);
    setTotalRevenue(revenue);
  }, [recentOrders, allOrderDetails]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Revenue = sum of price*quantity for order_details of delivered orders
        const [ordersRes, orderDetailsRes, productsRes, usersRes] = await Promise.all([
          api.get('/orders/all'),           // GET /api/orders/all — returns all orders
          api.get('/orders/details/all'),    // GET /api/orders/details/all — returns all order_details
          api.get('/products'),
          api.get('/auth/users'),
        ]);

        const orders: any[] = ordersRes.data || [];
        const details: any[] = orderDetailsRes.data || [];
        const products: any[] = productsRes.data || [];
        const users: any[] = usersRes.data || [];

        // Maps để enrich data
        const productMap = Object.fromEntries(products.map((p: any) => [p.product_id || p._id, p.product_name]));
        const orderMap = Object.fromEntries(
          orders.map((o: any) => [
            o.order_id || o._id,
            { status: o.status, order_date: o.order_date, user_id: o.user_id },
          ])
        );
        const userMap = Object.fromEntries(users.map((u: any) => [u.user_id || u._id, u.full_name]));

        // Lưu details kèm status để useEffect tính doanh thu
        const detailsWithStatus = details.map((d: any) => ({
          ...d,
          _status: (orderMap[d.order_id] || {}).status,
        }));
        setAllOrderDetails(detailsWithStatus);

        // Total stock
        const stock = products.reduce((sum: number, p: any) => sum + (p.stock || 0), 0);
        setTotalStock(stock);

        // Total customers
        const customers = users.filter((u: any) => u.role === 'customer').length;
        setTotalCustomers(customers);

        // Recent order_details enriched with product name, buyer, date, status

        const enriched = details.slice(0, 8).map((d: any) => {
          const orderInfo = orderMap[d.order_id] || {};
          return {
            order_detail_id: d.order_detail_id || d._id,
            order_id: d.order_id,
            product_id: d.product_id,
            quantity: d.quantity,
            price: d.price,
            product_name: productMap[d.product_id] || '—',
            buyer_name: userMap[orderInfo.user_id] || 'Khách',
            order_date: orderInfo.order_date,
            status: orderInfo.status,
          };
        });
        setRecentOrders(enriched);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats: StatCard[] = [
    {
      label: 'Tổng doanh thu',
      value: totalRevenue.toLocaleString('vi-VN') + 'đ',
      icon: (
        <svg width="22" height="22" fill="none" stroke="#1a2f6e" strokeWidth="1.8" viewBox="0 0 24 24">
          <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
          <circle cx="12" cy="12" r="4"/>
        </svg>
      ),
    },
    {
      label: 'Sản phẩm tồn kho',
      value: totalStock.toLocaleString('vi-VN') + ' Item',
      icon: (
        <svg width="22" height="22" fill="none" stroke="#1a2f6e" strokeWidth="1.8" viewBox="0 0 24 24">
          <path d="M20 7H4a1 1 0 00-1 1v11a1 1 0 001 1h16a1 1 0 001-1V8a1 1 0 00-1-1z"/>
          <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
        </svg>
      ),
    },
    {
      label: 'Tổng khách hàng',
      value: totalCustomers.toLocaleString('vi-VN') + ' Thành viên',
      icon: (
        <svg width="22" height="22" fill="none" stroke="#1a2f6e" strokeWidth="1.8" viewBox="0 0 24 24">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />

      {editModal && (
        <EditStatusModal
          orderId={editModal.orderId}
          currentStatus={editModal.status}
          onClose={() => setEditModal(null)}
          onSaved={() => {
            setEditModal(null);
            setLoading(true);
            Promise.all([
              api.get('/orders/all'),
              api.get('/orders/details/all'),
              api.get('/products'),
              api.get('/auth/users'),
            ]).then(([ordersRes, detailsRes, productsRes, usersRes]) => {
              const orders: any[] = ordersRes.data || [];
              const details: any[] = detailsRes.data || [];
              const products: any[] = productsRes.data || [];
              const users: any[] = usersRes.data || [];
              const productMap = Object.fromEntries(products.map((p: any) => [p.product_id || p._id, p.product_name]));
              const orderMap = Object.fromEntries(orders.map((o: any) => [o.order_id || o._id, { status: o.status, order_date: o.order_date, user_id: o.user_id }]));
              const userMap = Object.fromEntries(users.map((u: any) => [u.user_id || u._id, u.full_name]));
              // Cập nhật allOrderDetails với status mới để tính lại doanh thu
              setAllOrderDetails(details.map((d: any) => ({ ...d, _status: (orderMap[d.order_id] || {}).status })));
              const enriched = details.slice(0, 8).map((d: any) => {
                const orderInfo = orderMap[d.order_id] || {};
                return {
                  order_detail_id: d.order_detail_id || d._id,
                  order_id: d.order_id,
                  product_id: d.product_id,
                  quantity: d.quantity,
                  price: d.price,
                  product_name: productMap[d.product_id] || '—',
                  buyer_name: userMap[orderInfo.user_id] || 'Khách',
                  order_date: orderInfo.order_date,
                  status: orderInfo.status,
                };
              });
              setRecentOrders(enriched);
              setLoading(false);
            }).catch(() => setLoading(false));
          }}
        />
      )}

      <div className="ml-56 flex-1 flex flex-col">
        <Header />

        <main className="flex-1 px-8 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[#1a2f6e]">Tổng quan hệ thống</h1>
            <p className="text-sm text-gray-400 mt-0.5">Chào mừng trở lại, Admin</p>
          </div>

          {/* Stat cards */}
          {loading ? (
            <div className="grid grid-cols-3 gap-5 mb-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-white rounded-2xl border border-gray-100 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-5 mb-8">
              {stats.map((s) => (
                <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-start gap-4 shadow-sm">
                  <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                    {s.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400 font-medium mb-1">{s.label}</p>
                    <p className="text-lg font-bold text-[#1a2f6e] truncate">{s.value}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Recent order details */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-800">Đơn hàng gần đây</h2>
          </div>

          {loading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left text-xs text-gray-400 font-semibold uppercase tracking-wider px-6 py-3">ID Đơn Hàng</th>
                    <th className="text-left text-xs text-gray-400 font-semibold uppercase tracking-wider px-4 py-3">Sản Phẩm</th>
                    <th className="text-left text-xs text-gray-400 font-semibold uppercase tracking-wider px-4 py-3">Khách Hàng</th>
                    <th className="text-left text-xs text-gray-400 font-semibold uppercase tracking-wider px-4 py-3">Ngày Đặt</th>
                    <th className="text-right text-xs text-gray-400 font-semibold uppercase tracking-wider px-4 py-3">Tổng Tiền</th>
                    <th className="text-center text-xs text-gray-400 font-semibold uppercase tracking-wider px-4 py-3">Trạng Thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentOrders.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-gray-400">Chưa có đơn hàng nào</td>
                    </tr>
                  )}
                  {recentOrders.map((row, idx) => {
                    const sc = statusConfig[row.status || ''] || { label: row.status || '—', className: 'bg-gray-100 text-gray-600' };
                    const avatarClass = avatarColors[idx % avatarColors.length];
                    const dateStr = row.order_date
                      ? new Date(row.order_date).toLocaleDateString('vi-VN')
                      : '—';
                    return (
                      <tr key={row.order_detail_id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-6 py-4 font-mono font-semibold text-gray-700">
                          #{String(row.order_id).slice(-6).toUpperCase()}
                        </td>
                        <td className="px-4 py-4 text-gray-700 max-w-[180px] truncate">
                          {row.product_name}
                          <span className="text-gray-400 ml-1">×{row.quantity}</span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${avatarClass}`}>
                              {initials(row.buyer_name)}
                            </div>
                            <span className="text-gray-700">{row.buyer_name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-gray-500">{dateStr}</td>
                        <td className="px-4 py-4 text-right font-semibold text-gray-800">
                          {(row.price * row.quantity).toLocaleString('vi-VN')}đ
                        </td>
                        <td className="px-4 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-semibold ${sc.className}`}>
                              {sc.label}
                            </span>
                            <button
                              onClick={() => setEditModal({ orderId: row.order_id, status: row.status || 'pending' })}
                              className="text-gray-400 hover:text-[#1a2f6e] transition-colors p-1 rounded-lg hover:bg-blue-50 flex-shrink-0"
                              title="Sửa trạng thái"
                            >
                              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
        </main>
      </div>
    </div>
  );
}
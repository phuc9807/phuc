import { useEffect, useState } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import Header from '../components/Header';
import api from '../services/api';

interface Customer {
  _id: string;
  user_id: number;
  full_name: string;
  email: string;
  phone?: string;
  created_at?: string;
  // enriched
  order_count: number;
  total_spent: number;
}

const ITEMS_PER_PAGE = 10;

function initials(name?: string) {
  if (!name) return '??';
  return name.split(' ').slice(-2).map(w => w[0]).join('').toUpperCase();
}

const avatarColors = [
  'bg-blue-500', 'bg-purple-500', 'bg-teal-500',
  'bg-orange-500', 'bg-pink-500', 'bg-indigo-500',
  'bg-rose-500', 'bg-cyan-500',
];

// ── Modal xem chi tiết ────────────────────────────────────────────────────────
function CustomerDetailModal({
  customer,
  onClose,
}: {
  customer: Customer;
  onClose: () => void;
}) {
  const avatarBg = avatarColors[customer.user_id % avatarColors.length];
  const joinDate = customer.created_at
    ? new Date(customer.created_at).toLocaleDateString('vi-VN')
    : '—';

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header banner */}
        <div className="bg-[#1a2f6e] px-6 py-5 flex items-center gap-4">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold text-white flex-shrink-0 ${avatarBg}`}>
            {initials(customer.full_name)}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-bold text-lg leading-tight">{customer.full_name}</h3>
            <p className="text-white/60 text-sm mt-0.5">{customer.email}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/70 hover:text-white">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Info rows */}
          <div className="space-y-3">
            <InfoRow
              icon={<svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>}
              label="Email"
              value={customer.email}
            />
            <InfoRow
              icon={<svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/></svg>}
              label="Số điện thoại"
              value={customer.phone ? String(customer.phone) : '—'}
            />
            <InfoRow
              icon={<svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>}
              label="Ngày tham gia"
              value={joinDate}
            />
            <InfoRow
              icon={<svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M20 7H4a1 1 0 00-1 1v11a1 1 0 001 1h16a1 1 0 001-1V8a1 1 0 00-1-1z"/><path d="M1 3h22"/></svg>}
              label="Mã khách hàng"
              value={`#${String(customer.user_id).padStart(6, '0')}`}
            />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <p className="text-xs text-gray-400 font-medium mb-1">Tổng đơn hàng</p>
              <p className="text-2xl font-bold text-[#1a2f6e]">{customer.order_count}</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <p className="text-xs text-gray-400 font-medium mb-1">Tổng chi tiêu</p>
              <p className="text-lg font-bold text-green-700">{customer.total_spent.toLocaleString('vi-VN')}đ</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-medium text-gray-800 truncate">{value}</p>
      </div>
    </div>
  );
}

// ── Trang chính ───────────────────────────────────────────────────────────────
export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [viewCustomer, setViewCustomer] = useState<Customer | null>(null);

  // Stats
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [purchaseRate, setPurchaseRate] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [usersRes, ordersRes] = await Promise.all([
          api.get('/auth/users'),
          api.get('/orders/all'),
        ]);
        const users: any[] = usersRes.data || [];
        const orders: any[] = ordersRes.data || [];

        // Chỉ lấy customer
        const customerUsers = users.filter(u => u.role === 'customer');
        setTotalCustomers(customerUsers.length);

        // Tỷ lệ mua hàng: delivered / tổng tất cả đơn
        const totalOrders = orders.length;
        const deliveredOrders = orders.filter(o => o.status === 'delivered').length;
        setPurchaseRate(totalOrders > 0 ? Math.round((deliveredOrders / totalOrders) * 100) : 0);

        // Tính order_count và total_spent cho từng user
        const ordersByUser: Record<number, { count: number; spent: number }> = {};
        orders.forEach((o: any) => {
          const uid = o.user_id;
          if (!ordersByUser[uid]) ordersByUser[uid] = { count: 0, spent: 0 };
          ordersByUser[uid].count += 1;
          ordersByUser[uid].spent += o.total_amount || 0;
        });

        const enriched: Customer[] = customerUsers.map((u: any) => ({
          _id: u._id,
          user_id: u.user_id,
          full_name: u.full_name,
          email: u.email,
          phone: u.phone,
          created_at: u.created_at,
          order_count: ordersByUser[u.user_id]?.count || 0,
          total_spent: ordersByUser[u.user_id]?.spent || 0,
        }));

        setCustomers(enriched);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = customers.filter(c =>
    c.full_name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const getPageNumbers = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 3) return [1, 2, 3, '...', totalPages];
    if (page >= totalPages - 2) return [1, '...', totalPages - 2, totalPages - 1, totalPages];
    return [1, '...', page - 1, page, page + 1, '...', totalPages];
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />

      {viewCustomer && (
        <CustomerDetailModal customer={viewCustomer} onClose={() => setViewCustomer(null)} />
      )}

      <div className="ml-56 flex-1 flex flex-col">
        <Header />

        <main className="flex-1 px-8 py-8">
          {/* Page header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#1a2f6e]">Danh sách Khách Hàng</h1>
            <p className="text-sm text-gray-400 mt-0.5">Quản lý thông tin và hoạt động của người dùng hệ thống</p>
          </div>

          {/* Stat cards — chỉ 2 thẻ */}
          {loading ? (
            <div className="grid grid-cols-2 gap-4 mb-6">
              {[1, 2].map(i => <div key={i} className="h-28 bg-white rounded-2xl animate-pulse border border-gray-100"/>)}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <svg width="24" height="24" fill="none" stroke="#1a2f6e" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Tổng khách hàng</p>
                  <p className="text-2xl font-bold text-[#1a2f6e] mt-0.5">{totalCustomers.toLocaleString('vi-VN')} <span className="text-sm font-medium text-gray-400">thành viên</span></p>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                  <svg width="24" height="24" fill="none" stroke="#16a34a" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path d="M20 7H4a1 1 0 00-1 1v11a1 1 0 001 1h16a1 1 0 001-1V8a1 1 0 00-1-1z"/>
                    <path d="M9 12l2 2 4-4"/>
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Tỷ lệ hoàn thành đơn</p>
                  <p className="text-2xl font-bold text-green-600 mt-0.5">{purchaseRate}% <span className="text-sm font-medium text-gray-400">đơn delivered</span></p>
                </div>
              </div>
            </div>
          )}

          {/* Search */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5">
            <div className="relative max-w-sm">
              <svg className="absolute left-3 top-2.5 text-gray-400" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text"
                placeholder="Tìm theo tên hoặc email..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2f6e]/20"
              />
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
                        <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-3">Khách hàng</th>
                        <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 py-3">Liên hệ</th>
                        <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 py-3">Ngày đăng ký</th>
                        <th className="text-center text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 py-3">Đơn hàng</th>
                        <th className="text-right text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 py-3">Tổng chi tiêu</th>
                        <th className="text-center text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-3">Chi tiết</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {paginated.length === 0 && (
                        <tr>
                          <td colSpan={6} className="text-center py-12 text-gray-400">Không tìm thấy khách hàng nào</td>
                        </tr>
                      )}
                      {paginated.map((c, idx) => {
                        const avatarBg = avatarColors[idx % avatarColors.length];
                        const joinDate = c.created_at
                          ? new Date(c.created_at).toLocaleDateString('vi-VN')
                          : '—';
                        return (
                          <tr key={c._id} className="hover:bg-gray-50/60 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${avatarBg}`}>
                                  {initials(c.full_name)}
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-800">{c.full_name}</p>
                                  <p className="text-xs text-gray-400">#{String(c.user_id).padStart(6, '0')}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <p className="text-gray-700">{c.email}</p>
                              {c.phone && <p className="text-xs text-gray-400 mt-0.5">{c.phone}</p>}
                            </td>
                            <td className="px-4 py-4 text-gray-500">{joinDate}</td>
                            <td className="px-4 py-4 text-center font-semibold text-gray-700">{c.order_count}</td>
                            <td className="px-4 py-4 text-right font-bold text-[#1a2f6e]">
                              {c.total_spent.toLocaleString('vi-VN')}đ
                            </td>
                            <td className="px-6 py-4 text-center">
                              <button
                                onClick={() => setViewCustomer(c)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#1a2f6e]/20 bg-blue-50 text-[#1a2f6e] text-xs font-semibold hover:bg-[#1a2f6e] hover:text-white transition-colors"
                              >
                                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
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
                    Hiển thị <span className="font-medium text-gray-600">{Math.min((page - 1) * ITEMS_PER_PAGE + 1, filtered.length)}–{Math.min(page * ITEMS_PER_PAGE, filtered.length)}</span> trong <span className="font-medium text-gray-600">{filtered.length.toLocaleString('vi-VN')}</span> khách hàng
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
                        ? <span key={`e-${i}`} className="w-8 text-center text-gray-400">…</span>
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
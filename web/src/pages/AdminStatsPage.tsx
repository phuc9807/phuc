import { useEffect, useState } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import Header from '../components/Header';
import api from '../services/api';

interface TopProduct {
  product_id: number;
  product_name: string;
  category_name: string;
  image: string;
  qty_sold: number;
  revenue: number;
}

interface CategoryShare {
  category_name: string;
  revenue: number;
  percent: number;
}

const categoryColors = [
  'bg-blue-500', 'bg-indigo-500', 'bg-purple-500',
  'bg-teal-500', 'bg-orange-500', 'bg-pink-500', 'bg-cyan-500',
];

export default function AdminStatsPage() {
  const [loading, setLoading] = useState(true);

  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [categoryShares, setCategoryShares] = useState<CategoryShare[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [ordersRes, detailsRes, productsRes, categoriesRes, usersRes] = await Promise.all([
          api.get('/orders/all'),
          api.get('/orders/details/all'),
          api.get('/products'),
          api.get('/categories'),
          api.get('/auth/users'),
        ]);

        const orders: any[] = ordersRes.data || [];
        const details: any[] = detailsRes.data || [];
        const products: any[] = productsRes.data || [];
        const categories: any[] = categoriesRes.data || [];
        const users: any[] = usersRes.data || [];

        // Maps
        const productMap = Object.fromEntries(products.map((p: any) => [p.product_id, p]));
        const categoryMap = Object.fromEntries(categories.map((c: any) => [c.category_id, c.category_name]));

        // Tổng doanh thu — chỉ đơn delivered
        const deliveredIds = new Set(
          orders.filter(o => o.status === 'delivered').map(o => o.order_id)
        );
        const revenue = details
          .filter(d => deliveredIds.has(d.order_id))
          .reduce((sum, d) => sum + d.price * d.quantity, 0);
        setTotalRevenue(revenue);

        // Tổng đơn hàng
        setTotalOrders(orders.length);

        // Tổng khách hàng
        setTotalCustomers(users.filter(u => u.role === 'customer').length);

        // Top 5 sản phẩm — tính theo tất cả order_details (không lọc status)
        const productStats: Record<number, { qty: number; revenue: number }> = {};
        details.forEach(d => {
          if (!productStats[d.product_id]) productStats[d.product_id] = { qty: 0, revenue: 0 };
          productStats[d.product_id].qty += d.quantity;
          productStats[d.product_id].revenue += d.price * d.quantity;
        });

        const top5: TopProduct[] = Object.entries(productStats)
          .map(([pid, stats]) => {
            const p = productMap[Number(pid)];
            return {
              product_id: Number(pid),
              product_name: p?.product_name || '—',
              category_name: categoryMap[p?.category_id] || '—',
              image: p?.image || '',
              qty_sold: stats.qty,
              revenue: stats.revenue,
            };
          })
          .sort((a, b) => b.qty_sold - a.qty_sold)
          .slice(0, 5);
        setTopProducts(top5);

        // Cơ cấu doanh thu theo danh mục — từ delivered orders
        const catRevenue: Record<string, number> = {};
        details
          .filter(d => deliveredIds.has(d.order_id))
          .forEach(d => {
            const p = productMap[d.product_id];
            const catName = categoryMap[p?.category_id] || 'Khác';
            catRevenue[catName] = (catRevenue[catName] || 0) + d.price * d.quantity;
          });

        const totalCatRevenue = Object.values(catRevenue).reduce((s, v) => s + v, 0);
        const shares: CategoryShare[] = Object.entries(catRevenue)
          .map(([name, rev]) => ({
            category_name: name,
            revenue: rev,
            percent: totalCatRevenue > 0 ? Math.round((rev / totalCatRevenue) * 100) : 0,
          }))
          .sort((a, b) => b.percent - a.percent);
        setCategoryShares(shares);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statCards = [
    {
      label: 'Tổng Doanh Thu',
      value: totalRevenue.toLocaleString('vi-VN') + 'đ',
      icon: (
        <svg width="22" height="22" fill="none" stroke="#1a2f6e" strokeWidth="1.8" viewBox="0 0 24 24">
          <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
        </svg>
      ),
      sub: 'từ đơn hoàn thành',
    },
    {
      label: 'Tổng Đơn Hàng',
      value: totalOrders.toLocaleString('vi-VN'),
      icon: (
        <svg width="22" height="22" fill="none" stroke="#1a2f6e" strokeWidth="1.8" viewBox="0 0 24 24">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
          <rect x="9" y="3" width="6" height="4" rx="1"/>
          <path d="M9 12h6M9 16h4"/>
        </svg>
      ),
      sub: 'tất cả trạng thái',
    },
    {
      label: 'Tổng Khách Hàng',
      value: totalCustomers.toLocaleString('vi-VN') + ' thành viên',
      icon: (
        <svg width="22" height="22" fill="none" stroke="#1a2f6e" strokeWidth="1.8" viewBox="0 0 24 24">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
        </svg>
      ),
      sub: 'đã đăng ký',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />

      <div className="ml-56 flex-1 flex flex-col">
        <Header />

        <main className="flex-1 px-8 py-8">
          {/* Page header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#1a2f6e]">Thống Kê Hiệu Năng</h1>
            <p className="text-sm text-gray-400 mt-0.5">Theo dõi dữ liệu kinh doanh và xu hướng tăng trưởng</p>
          </div>

          {/* Stat cards */}
          {loading ? (
            <div className="grid grid-cols-3 gap-5 mb-6">
              {[1, 2, 3].map(i => <div key={i} className="h-28 bg-white rounded-2xl animate-pulse border border-gray-100"/>)}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-5 mb-6">
              {statCards.map(s => (
                <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                    {s.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-0.5">{s.label}</p>
                    <p className="text-xl font-bold text-[#1a2f6e] truncate">{s.value}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-3 gap-5 mb-6">
            {/* Cơ cấu doanh thu — chiếm 1 cột */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-bold text-gray-800 mb-4">Cơ Cấu Doanh Thu</h2>
              {loading ? (
                <div className="space-y-3">
                  {[1,2,3].map(i => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse"/>)}
                </div>
              ) : categoryShares.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">Chưa có dữ liệu</p>
              ) : (
                <div className="space-y-3">
                  {categoryShares.map((cat, idx) => (
                    <div key={cat.category_name} className="bg-gray-50 rounded-xl p-3.5">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${categoryColors[idx % categoryColors.length]}`}/>
                          <span className="text-sm font-medium text-gray-700">{cat.category_name}</span>
                        </div>
                        <span className="text-lg font-bold text-[#1a2f6e]">{cat.percent}%</span>
                      </div>
                      {/* Progress bar */}
                      <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${categoryColors[idx % categoryColors.length]}`}
                          style={{ width: `${cat.percent}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1.5">{cat.revenue.toLocaleString('vi-VN')}đ</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Top 5 sản phẩm — chiếm 2 cột */}
            <div className="col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-800">Top 5 Sản Phẩm Bán Chạy</h2>
                <p className="text-xs text-gray-400 mt-0.5">Tính theo tổng số lượng đã bán</p>
              </div>
              {loading ? (
                <div className="p-6 space-y-3">
                  {[1,2,3,4,5].map(i => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse"/>)}
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-3 w-12">Hạng</th>
                      <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 py-3">Tên sản phẩm</th>
                      <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 py-3">Danh mục</th>
                      <th className="text-center text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 py-3">Số lượng bán</th>
                      <th className="text-right text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-3">Doanh thu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {topProducts.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center py-10 text-gray-400">Chưa có dữ liệu</td>
                      </tr>
                    )}
                    {topProducts.map((p, idx) => (
                      <tr key={p.product_id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-6 py-4">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                            idx === 0 ? 'bg-yellow-100 text-yellow-700' :
                            idx === 1 ? 'bg-gray-100 text-gray-600' :
                            idx === 2 ? 'bg-orange-100 text-orange-600' :
                            'bg-gray-50 text-gray-500'
                          }`}>
                            {idx + 1}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={p.image || 'https://placehold.co/40x40?text=?'}
                              alt={p.product_name}
                              className="w-10 h-10 rounded-xl object-cover border border-gray-100 flex-shrink-0"
                              onError={e => { e.currentTarget.src = 'https://placehold.co/40x40?text=?'; }}
                            />
                            <span className="font-semibold text-gray-800">{p.product_name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="inline-block px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold">
                            {p.category_name}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center font-semibold text-gray-700">{p.qty_sold.toLocaleString('vi-VN')}</td>
                        <td className="px-6 py-4 text-right font-bold text-[#1a2f6e]">
                          {p.revenue.toLocaleString('vi-VN')}đ
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
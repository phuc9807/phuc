import { useEffect, useState } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import Header from '../components/Header';
import api from '../services/api';

interface Product {
  _id: string;
  product_id: number;
  product_name: string;
  category_id: number;
  price: number;
  stock: number;
  description: string;
  image: string;
  slug: string;
  on_sale?: boolean;
  sale_price?: number;
}

interface Category {
  _id: string;
  category_id: number;
  category_name: string;
}

const ITEMS_PER_PAGE = 6;

// ── Modal Thêm ────────────────────────────────────────────────────────────────
function AddModal({
  categories,
  onClose,
  onSaved,
}: {
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    product_name: '',
    category_id: '',
    price: '',
    stock: '',
    image: '',
    description: '',
    on_sale: false,
    sale_price: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!form.product_name.trim()) return setError('Vui lòng nhập tên sản phẩm');
    if (!form.category_id) return setError('Vui lòng chọn danh mục');
    if (!form.price) return setError('Vui lòng nhập giá');
    if (form.on_sale && (!form.sale_price || Number(form.sale_price) <= 0)) return setError('Vui lòng nhập giá khuyến mãi');
    if (form.on_sale && Number(form.sale_price) >= Number(form.price)) return setError('Giá khuyến mãi phải thấp hơn giá gốc');
    setSaving(true);
    setError('');
    try {
      await api.post('/products', {
        product_name: form.product_name,
        category_id: Number(form.category_id),
        price: Number(form.price),
        stock: Number(form.stock) || 0,
        image: form.image,
        description: form.description,
        on_sale: form.on_sale,
        sale_price: form.on_sale && form.sale_price ? Number(form.sale_price) : null,
      });
      onSaved();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Lỗi khi thêm sản phẩm');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Thêm sản phẩm mới</h2>
            <p className="text-sm text-gray-400 mt-0.5">Điền đầy đủ thông tin để niêm yết sản phẩm mới trên hệ thống.</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="px-6 pb-6 space-y-4">
          {/* Tên */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Tên sản phẩm</label>
            <input
              type="text"
              placeholder="VD: Laptop Gaming Asus ROG Strix G16"
              value={form.product_name}
              onChange={e => setForm({ ...form, product_name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2f6e]/20 focus:border-[#1a2f6e]"
            />
          </div>

          {/* Danh mục + Giá */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Danh mục</label>
              <select
                value={form.category_id}
                onChange={e => setForm({ ...form, category_id: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2f6e]/20 focus:border-[#1a2f6e] bg-white"
              >
                <option value="">Chọn danh mục</option>
                {categories.map(c => (
                  <option key={c.category_id} value={c.category_id}>{c.category_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Giá bán (VNĐ)</label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="0"
                  value={form.price}
                  min="0"
                  onChange={e => setForm({ ...form, price: String(Math.max(0, Number(e.target.value))) })}
                  className="w-full pl-3.5 pr-8 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2f6e]/20 focus:border-[#1a2f6e]"
                />
                <span className="absolute right-3.5 top-2.5 text-gray-400 text-sm">đ</span>
              </div>
            </div>
          </div>

          {/* Số lượng */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Số lượng tồn kho</label>
            <input
              type="number"
              placeholder="Nhập số lượng"
              value={form.stock}
              min="0"
              onChange={e => setForm({ ...form, stock: String(Math.max(0, Number(e.target.value))) })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2f6e]/20 focus:border-[#1a2f6e]"
            />
          </div>

          {/* Link ảnh */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Link hình ảnh sản phẩm</label>
            <input
              type="text"
              placeholder="https://example.com/image.jpg"
              value={form.image}
              onChange={e => setForm({ ...form, image: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2f6e]/20 focus:border-[#1a2f6e]"
            />
            {form.image && (
              <img src={form.image} alt="preview" className="mt-2 h-24 w-24 object-cover rounded-xl border border-gray-100" onError={e => (e.currentTarget.style.display = 'none')} />
            )}
          </div>

          {/* Mô tả */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Mô tả chi tiết</label>
            <textarea
              rows={3}
              placeholder="Nhập đặc điểm nổi bật, thông số kỹ thuật..."
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2f6e]/20 focus:border-[#1a2f6e] resize-none"
            />
          </div>

          {/* Khuyến mãi */}
          <div className="border border-dashed border-orange-200 rounded-xl p-4 bg-orange-50/50">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-semibold text-gray-700">Khuyến mãi</p>
                <p className="text-xs text-gray-400 mt-0.5">Bật để thiết lập giá sale cho sản phẩm</p>
              </div>
              <button
                onClick={() => setForm({ ...form, on_sale: !form.on_sale, sale_price: '' })}
                className={`relative w-11 h-6 rounded-full transition-colors ${form.on_sale ? 'bg-[#1a2f6e]' : 'bg-gray-200'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.on_sale ? 'translate-x-5' : ''}`} />
              </button>
            </div>
            {form.on_sale && (
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Giá sau khuyến mãi (VNĐ)</label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="0"
                    value={form.sale_price}
                    min="0"
                    onChange={e => setForm({ ...form, sale_price: String(Math.max(0, Number(e.target.value))) })}
                    className="w-full pl-3.5 pr-8 py-2.5 rounded-xl border border-orange-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 bg-white"
                  />
                  <span className="absolute right-3.5 top-2.5 text-gray-400 text-sm">đ</span>
                </div>
                {form.sale_price && Number(form.sale_price) >= Number(form.price) && (
                  <p className="text-xs text-red-500 mt-1">Giá sale phải thấp hơn giá gốc</p>
                )}
              </div>
            )}
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 rounded-b-2xl border-t border-gray-100">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors">
            HỦY BỎ
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#1a2f6e] hover:bg-[#152558] rounded-xl transition-colors disabled:opacity-60"
          >
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
            {saving ? 'ĐANG LƯU...' : 'LƯU SẢN PHẨM'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Modal Sửa ─────────────────────────────────────────────────────────────────
function EditModal({
  product,
  categories,
  onClose,
  onSaved,
}: {
  product: Product;
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    product_name: product.product_name,
    category_id: String(product.category_id),
    price: String(product.price),
    stock: String(product.stock),
    image: product.image || '',
    description: product.description || '',
    on_sale: product.on_sale || false,
    sale_price: product.sale_price ? String(product.sale_price) : '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!form.product_name.trim()) return setError('Vui lòng nhập tên sản phẩm');
    if (form.on_sale && (!form.sale_price || Number(form.sale_price) <= 0)) return setError('Vui lòng nhập giá khuyến mãi');
    if (form.on_sale && Number(form.sale_price) >= Number(form.price)) return setError('Giá khuyến mãi phải thấp hơn giá gốc');
    setSaving(true);
    setError('');
    try {
      await api.put(`/products/${product.product_id}`, {
        product_name: form.product_name,
        category_id: Number(form.category_id),
        price: Number(form.price),
        stock: Number(form.stock),
        image: form.image,
        description: form.description,
        on_sale: form.on_sale,
        sale_price: form.on_sale && form.sale_price ? Number(form.sale_price) : null,
      });
      onSaved();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Lỗi khi cập nhật sản phẩm');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4">
          <div>
            <h2 className="text-lg font-bold text-[#1a2f6e]">Chỉnh sửa sản phẩm</h2>
            <p className="text-sm text-gray-400 mt-0.5">Cập nhật thông tin chi tiết cho thiết bị công nghệ của bạn.</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="px-6 pb-6 space-y-4">
          {/* Ảnh + Tên (layout 2 cột như ảnh mẫu) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Hình ảnh sản phẩm</label>
              <img
                src={form.image || 'https://placehold.co/200x200?text=No+Image'}
                alt={form.product_name}
                className="w-full h-36 object-cover rounded-xl border border-gray-100"
                onError={e => { e.currentTarget.src = 'https://placehold.co/200x200?text=No+Image'; }}
              />
              <input
                type="text"
                placeholder="Link ảnh mới..."
                value={form.image}
                onChange={e => setForm({ ...form, image: e.target.value })}
                className="mt-2 w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#1a2f6e]/20 focus:border-[#1a2f6e]"
              />
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Tên sản phẩm</label>
                <input
                  type="text"
                  value={form.product_name}
                  onChange={e => setForm({ ...form, product_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2f6e]/20 focus:border-[#1a2f6e]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Danh mục</label>
                <select
                  value={form.category_id}
                  onChange={e => setForm({ ...form, category_id: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2f6e]/20 focus:border-[#1a2f6e] bg-white"
                >
                  {categories.map(c => (
                    <option key={c.category_id} value={c.category_id}>{c.category_name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Giá + Tồn kho */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Giá bán (VNĐ)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-[#1a2f6e] text-sm font-medium">đ</span>
                <input
                  type="number"
                  value={form.price}
                  min="0"
                  onChange={e => setForm({ ...form, price: String(Math.max(0, Number(e.target.value))) })}
                  className="w-full pl-7 pr-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-[#1a2f6e] font-medium focus:outline-none focus:ring-2 focus:ring-[#1a2f6e]/20 focus:border-[#1a2f6e]"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Số lượng tồn kho</label>
              <input
                type="number"
                value={form.stock}
                min="0"
                onChange={e => setForm({ ...form, stock: String(Math.max(0, Number(e.target.value))) })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1a2f6e]/20 focus:border-[#1a2f6e]"
              />
            </div>
          </div>

          {/* Mô tả */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Mô tả</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2f6e]/20 focus:border-[#1a2f6e] resize-none"
            />
          </div>

          {/* Khuyến mãi */}
          <div className="border border-dashed border-orange-200 rounded-xl p-4 bg-orange-50/50">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-semibold text-gray-700">Khuyến mãi</p>
                <p className="text-xs text-gray-400 mt-0.5">Bật để thiết lập giá sale cho sản phẩm</p>
              </div>
              <button
                onClick={() => setForm({ ...form, on_sale: !form.on_sale, sale_price: '' })}
                className={`relative w-11 h-6 rounded-full transition-colors ${form.on_sale ? 'bg-[#1a2f6e]' : 'bg-gray-200'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.on_sale ? 'translate-x-5' : ''}`} />
              </button>
            </div>
            {form.on_sale && (
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Giá sau khuyến mãi (VNĐ)</label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="0"
                    value={form.sale_price}
                    min="0"
                    onChange={e => setForm({ ...form, sale_price: String(Math.max(0, Number(e.target.value))) })}
                    className="w-full pl-3.5 pr-8 py-2.5 rounded-xl border border-orange-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 bg-white"
                  />
                  <span className="absolute right-3.5 top-2.5 text-gray-400 text-sm">đ</span>
                </div>
                {form.sale_price && Number(form.sale_price) >= Number(form.price) && (
                  <p className="text-xs text-red-500 mt-1">Giá sale phải thấp hơn giá gốc</p>
                )}
              </div>
            )}
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors">
            Hủy bỏ
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#1a2f6e] hover:bg-[#152558] rounded-xl transition-colors disabled:opacity-60"
          >
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
            {saving ? 'Đang lưu...' : 'Cập nhật'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Modal Xóa ─────────────────────────────────────────────────────────────────
function DeleteModal({
  product,
  onClose,
  onDeleted,
}: {
  product: Product;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/products/${product.product_id}`);
      onDeleted();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-8 text-center">
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path d="M10.29 3.86 1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" fill="#fee2e2" stroke="#ef4444" strokeWidth="1.5"/>
            <line x1="12" y1="9" x2="12" y2="13" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="12" cy="17" r="1" fill="#ef4444"/>
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">Xác nhận xóa sản phẩm</h3>
        <p className="text-sm text-gray-500 mb-6">
          Bạn có chắc muốn xóa <strong className="text-gray-800">{product.product_name}</strong>? Hành động này không thể hoàn tác.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-sm font-medium border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 py-2.5 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors disabled:opacity-60"
          >
            {deleting ? 'Đang xóa...' : 'Xóa sản phẩm'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Trang chính ───────────────────────────────────────────────────────────────
export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);

  const [showAdd, setShowAdd] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        api.get('/products'),
        api.get('/categories'),
      ]);
      setProducts(prodRes.data || []);
      setCategories(catRes.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  // Filter
  const filtered = products.filter(p => {
    const matchSearch = p.product_name.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCategory ? String(p.category_id) === filterCategory : true;
    const matchStatus = filterStatus === 'in_stock' ? p.stock > 0 : filterStatus === 'out_stock' ? p.stock === 0 : true;
    return matchSearch && matchCat && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const getCategoryName = (id: number) => categories.find(c => c.category_id === id)?.category_name || '—';

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />

      <div className="ml-56 flex-1 flex flex-col">
        <Header />

        <main className="flex-1 px-8 py-8">
          {/* Page header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-[#1a2f6e]">Quản lý Sản Phẩm</h1>
              <p className="text-sm text-gray-400 mt-0.5">Cập nhật và điều chỉnh danh mục hàng hóa điện tử TUSIGMA</p>
            </div>
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#1a2f6e] hover:bg-[#152558] text-white text-sm font-semibold rounded-xl transition-colors"
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
              Thêm sản phẩm
            </button>
          </div>

          {/* Filter bar */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-xs">
                <svg className="absolute left-3 top-2.5 text-gray-400" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <input
                  type="text"
                  placeholder="Tìm tên sản phẩm..."
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1); }}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2f6e]/20"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 font-medium">Danh mục:</span>
                <select
                  value={filterCategory}
                  onChange={e => { setFilterCategory(e.target.value); setPage(1); }}
                  className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2f6e]/20 bg-white"
                >
                  <option value="">Tất cả</option>
                  {categories.map(c => (
                    <option key={c.category_id} value={String(c.category_id)}>{c.category_name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 font-medium">Trạng thái:</span>
                <select
                  value={filterStatus}
                  onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
                  className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2f6e]/20 bg-white"
                >
                  <option value="">Tất cả</option>
                  <option value="in_stock">Còn hàng</option>
                  <option value="out_stock">Hết hàng</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-8 space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-3 w-16">Ảnh</th>
                        <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 py-3">Tên sản phẩm</th>
                        <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 py-3">Danh mục</th>
                        <th className="text-right text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 py-3">Giá bán</th>
                        <th className="text-center text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 py-3">Tồn kho</th>
                        <th className="text-center text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 py-3">Trạng thái</th>
                        <th className="text-center text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-3">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {paginated.length === 0 && (
                        <tr>
                          <td colSpan={7} className="text-center py-12 text-gray-400">Không tìm thấy sản phẩm nào</td>
                        </tr>
                      )}
                      {paginated.map(p => (
                        <tr key={p.product_id} className="hover:bg-gray-50/60 transition-colors">
                          <td className="px-6 py-3">
                            <img
                              src={p.image || 'https://placehold.co/48x48?text=?'}
                              alt={p.product_name}
                              className="w-12 h-12 object-cover rounded-xl border border-gray-100"
                              onError={e => { e.currentTarget.src = 'https://placehold.co/48x48?text=?'; }}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-semibold text-gray-800">{p.product_name}</p>
                            <p className="text-xs text-gray-400 mt-0.5">ID: {p.product_id}</p>
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-block px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold">
                              {getCategoryName(p.category_id)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            {p.on_sale && p.sale_price ? (
                              <div>
                                <p className="font-bold text-red-500">{p.sale_price.toLocaleString('vi-VN')}đ</p>
                                <p className="text-xs text-gray-400 line-through">{p.price.toLocaleString('vi-VN')}đ</p>
                              </div>
                            ) : (
                              <p className="font-bold text-[#1a2f6e]">{p.price.toLocaleString('vi-VN')}đ</p>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center font-medium text-gray-700">
                            <span className={p.stock === 0 ? 'text-red-500 font-bold' : ''}>{p.stock}</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {p.stock > 0 ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-green-50 text-green-700 text-xs font-semibold">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"/>Còn hàng
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-50 text-red-600 text-xs font-semibold">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500"/>Hết hàng
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-3 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => setEditProduct(p)}
                                className="p-2 rounded-lg border border-blue-100 bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                              >
                                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                </svg>
                              </button>
                              <button
                                onClick={() => setDeleteProduct(p)}
                                className="p-2 rounded-lg border border-red-100 bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                              >
                                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                  <polyline points="3 6 5 6 21 6"/>
                                  <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                                  <path d="M10 11v6M14 11v6"/>
                                  <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                  <p className="text-sm text-gray-400">
                    Hiển thị <span className="font-medium text-gray-600">{Math.min((page - 1) * ITEMS_PER_PAGE + 1, filtered.length)}–{Math.min(page * ITEMS_PER_PAGE, filtered.length)}</span> trong <span className="font-medium text-gray-600">{filtered.length}</span> sản phẩm
                  </p>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg>
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                      <button
                        key={n}
                        onClick={() => setPage(n)}
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                          n === page
                            ? 'bg-[#1a2f6e] text-white'
                            : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages || totalPages === 0}
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

      {/* Modals */}
      {showAdd && (
        <AddModal
          categories={categories}
          onClose={() => setShowAdd(false)}
          onSaved={() => { setShowAdd(false); fetchProducts(); }}
        />
      )}
      {editProduct && (
        <EditModal
          product={editProduct}
          categories={categories}
          onClose={() => setEditProduct(null)}
          onSaved={() => { setEditProduct(null); fetchProducts(); }}
        />
      )}
      {deleteProduct && (
        <DeleteModal
          product={deleteProduct}
          onClose={() => setDeleteProduct(null)}
          onDeleted={() => { setDeleteProduct(null); fetchProducts(); }}
        />
      )}
    </div>
  );
}
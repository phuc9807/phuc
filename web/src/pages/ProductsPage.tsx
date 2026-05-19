import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../services/api'
import ProductCard from '../components/ProductCard'

interface Product {
    product_id: number
    product_name: string
    price: number
    image: string
    slug: string
    category_id: number
    on_sale?: boolean
    sale_price?: number
}

interface Category {
    category_id: number
    category_name: string
}

export default function ProductsPage() {
    const [searchParams] = useSearchParams()
    const [products, setProducts] = useState<Product[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [currentPage, setCurrentPage] = useState(1)
    const ITEMS_PER_PAGE = 9

    // Bộ lọc tạm (chưa áp dụng)
    const [tempCategories, setTempCategories] = useState<number[]>([])
    const [tempMaxPrice, setTempMaxPrice] = useState(100000000)
    const [tempSort, setTempSort] = useState('newest')

    // Bộ lọc đã áp dụng
    const [filterCategories, setFilterCategories] = useState<number[]>([])
    const [filterMaxPrice, setFilterMaxPrice] = useState(100000000)
    const [filterSort, setFilterSort] = useState('newest')

    useEffect(() => {
        api.get('/categories').then(res => setCategories(res.data))
    }, [])

    useEffect(() => {
        const catId = searchParams.get('category_id')
        const search = searchParams.get('search')

        let url = '/products?'
        if (search) url += `search=${search}&`

        api.get(url).then(res => {
            let data: Product[] = res.data

            if (filterCategories.length > 0) {
                data = data.filter(p => filterCategories.includes(p.category_id))
            } else if (catId) {
                data = data.filter(p => p.category_id === Number(catId))
            }

            if (filterMaxPrice < 100000000) {
                data = data.filter(p => p.price <= filterMaxPrice)
            }

            if (filterSort === 'price_asc') data.sort((a, b) => a.price - b.price)
            else if (filterSort === 'price_desc') data.sort((a, b) => b.price - a.price)
            else data.sort((a, b) => b.product_id - a.product_id)

            // Nếu đang ở trang Khuyến mãi, đẩy sản phẩm sale lên đầu
            if (searchParams.get('sale') === 'true') {
                data = [...data].sort((a, b) => (b.on_sale ? 1 : 0) - (a.on_sale ? 1 : 0))
            }

            setProducts(data)
            setCurrentPage(1)
        })
    }, [filterCategories, filterMaxPrice, filterSort, searchParams])

    useEffect(() => {
        const catId = searchParams.get('category_id')
        if (catId) setTempCategories([Number(catId)])
    }, [searchParams])

    const handleToggleCategory = (id: number) => {
        setTempCategories(prev =>
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        )
    }

    const handleApply = () => {
        setFilterCategories(tempCategories)
        setFilterMaxPrice(tempMaxPrice)
        setFilterSort(tempSort)
    }

    const getTitle = () => {
        if (searchParams.get('sale') === 'true') return 'Khuyến Mãi'
        if (filterCategories.length === 0 || filterCategories.length === categories.length) {
            return 'Tất Cả Sản Phẩm'
        }
        return filterCategories
            .map(id => categories.find(c => c.category_id === id)?.category_name)
            .filter(Boolean)
            .join(' + ')
    }

    const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE)
    const paginatedProducts = products.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    )

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex gap-6">

                {/* Sidebar bộ lọc */}
                <aside className="w-52 shrink-0">
                    <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-20">

                        <div className="flex items-center gap-2 mb-5">
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
                            </svg>
                            <span className="font-semibold text-gray-700">Bộ lọc</span>
                        </div>

                        <div className="mb-5">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Danh mục</p>
                            <div className="space-y-2">
                                {categories.map(cat => (
                                    <label key={cat.category_id} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={tempCategories.includes(cat.category_id)}
                                            onChange={() => handleToggleCategory(cat.category_id)}
                                            className="w-4 h-4 accent-[#1a2f6e]"
                                        />
                                        <span className="text-sm text-gray-600">{cat.category_name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="mb-5">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Khoảng giá</p>
                            <input
                                type="range"
                                min={0}
                                max={100000000}
                                step={500000}
                                value={tempMaxPrice}
                                onChange={e => setTempMaxPrice(Number(e.target.value))}
                                className="w-full accent-[#1a2f6e]"
                            />
                            <div className="flex justify-between text-xs text-gray-400 mt-1">
                                <span>0đ</span>
                                <span>{tempMaxPrice === 100000000 ? '100tr+' : (tempMaxPrice / 1000000).toFixed(0) + 'tr'}</span>
                            </div>
                        </div>

                        <div className="mb-6">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Sắp xếp theo</p>
                            <select
                                value={tempSort}
                                onChange={e => setTempSort(e.target.value)}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 outline-none focus:border-[#1a2f6e]"
                            >
                                <option value="newest">Mới nhất</option>
                                <option value="price_asc">Giá tăng dần</option>
                                <option value="price_desc">Giá giảm dần</option>
                            </select>
                        </div>

                        <button
                            onClick={handleApply}
                            className="w-full bg-[#1a2f6e] text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-[#152558] transition-colors"
                        >
                            Áp dụng
                        </button>
                    </div>
                </aside>

                {/* Danh sách sản phẩm */}
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-bold text-gray-800">{getTitle()}</h1>
                        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                            Hiển thị {paginatedProducts.length} trên {products.length} sản phẩm
                        </span>
                    </div>

                    {paginatedProducts.length === 0 ? (
                        <div className="text-center py-20 text-gray-400">Không tìm thấy sản phẩm nào</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            {paginatedProducts.map(product => (
                                <ProductCard key={product.product_id} {...product} />
                            ))}
                        </div>
                    )}

                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-10">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-[#1a2f6e] hover:text-[#1a2f6e] disabled:opacity-30 transition-colors"
                            >‹</button>

                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                                .reduce<(number | string)[]>((acc, p, idx, arr) => {
                                    if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('...')
                                    acc.push(p)
                                    return acc
                                }, [])
                                .map((p, idx) =>
                                    p === '...' ? (
                                        <span key={`dot-${idx}`} className="w-9 h-9 flex items-center justify-center text-gray-400">...</span>
                                    ) : (
                                        <button
                                            key={p}
                                            onClick={() => setCurrentPage(Number(p))}
                                            className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${currentPage === p
                                                ? 'bg-[#1a2f6e] text-white'
                                                : 'border border-gray-200 text-gray-600 hover:border-[#1a2f6e] hover:text-[#1a2f6e]'
                                                }`}
                                        >{p}</button>
                                    )
                                )}

                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-[#1a2f6e] hover:text-[#1a2f6e] disabled:opacity-30 transition-colors"
                            >›</button>
                        </div>
                    )}
                </div>

            </div>
        </div>
    )
}
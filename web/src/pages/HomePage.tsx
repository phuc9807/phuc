import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import ProductCard from '../components/ProductCard'

interface Product {
    product_id: number
    product_name: string
    price: number
    image: string
    slug: string
}

interface Category {
    category_id: number
    category_name: string
    description: string
}

export default function HomePage() {
    const [products, setProducts] = useState<Product[]>([])
    const [categories, setCategories] = useState<Category[]>([])

    const categoryImages: Record<string, string> = {
        'Điện thoại': 'https://cdn.tgdd.vn/News/1563772/iphone-1-800x450.jpg',
        'Laptop': 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=300&q=80',
        'Tai nghe': 'https://product.hstatic.net/200000722513/product/post-03_033d67d9396f461bbb1db1e9dc1b1864_master.jpg',
    }

    useEffect(() => {
        api.get('/products').then(res => setProducts(res.data.slice(0, 6)))
        api.get('/categories').then(res => setCategories(res.data))
    }, [])

    return (
        <div>
            {/* Hero Banner */}
            <section className="bg-gradient-to-r from-[#1a2f6e] to-[#2a4494] text-white overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col md:flex-row items-end gap-10">
                    <div className="flex-1">
                        <span className="bg-[#c8960c] text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide">
                            Sự kiện đặc biệt
                        </span>
                        <h1 className="text-4xl md:text-5xl font-bold mt-4 leading-tight">
                            Siêu Hội<br />Công Nghệ
                        </h1>
                        <p className="text-xl text-blue-200 mt-3 italic">Giảm Sốc Đến 50%</p>
                        <Link
                            to="/products"
                            className="mt-8 inline-block border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-[#1a2f6e] transition-colors"
                        >
                            Mua Sắm Ngay
                        </Link>
                    </div>
                    <div className="flex-1 flex justify-center items-end">
                        <img
                            src="https://cdn.tgdd.vn/Products/Images/42/329135/iphone-16-blue-600x600.png"
                            alt="Hero"
                            className="w-96 h-auto object-contain drop-shadow-2xl"
                        />
                    </div>
                </div>
            </section>

            {/* Danh mục */}
            <section className="max-w-7xl mx-auto px-4 py-12">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Danh Mục Phổ Biến</h2>
                    <Link to="/products" className="text-[#1a2f6e] text-sm font-medium hover:underline">Xem tất cả</Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {categories.map(cat => (
                        <Link
                            key={cat.category_id}
                            to={`/products?category_id=${cat.category_id}`}
                            className="relative border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow bg-gray-50 hover:bg-white overflow-hidden h-36 flex flex-col justify-center"
                        >
                            <h3 className="font-semibold text-gray-800 text-lg z-10">{cat.category_name}</h3>
                            <p className="text-sm text-gray-500 mt-1 z-10">{cat.description}</p>
                            <img
                                src={categoryImages[cat.category_name] || ''}
                                alt={cat.category_name}
                                className="absolute right-0 top-0 h-full w-36 object-cover opacity-90"
                            />
                        </Link>
                    ))}
                </div>
            </section>

            {/* Sản phẩm nổi bật */}
            <section className="max-w-7xl mx-auto px-4 pb-16">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-1 h-7 bg-[#1a2f6e] rounded-full"></div>
                    <h2 className="text-2xl font-bold text-gray-800">Sản Phẩm Nổi Bật</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {products.map(product => (
                        <ProductCard key={product.product_id} {...product} />
                    ))}
                </div>
            </section>
        </div>
    )
}
import { useState, useEffect } from 'react'

const NEWS = [
    {
        id: 1,
        category: 'Công nghệ',
        title: 'iPhone 17 Series chính thức ra mắt: Thiết kế mới, camera đột phá',
        summary: 'Apple vừa công bố dòng iPhone 17 với nhiều cải tiến vượt trội về camera và chip A19 Bionic, hứa hẹn trải nghiệm người dùng hoàn toàn mới trong năm 2026.',
        date: '10/05/2026',
        readTime: '3 phút đọc',
        cover: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&q=80',
        hot: true,
        featured: true,
    },
    {
        id: 2,
        category: 'Laptop',
        title: 'Top 5 Laptop gaming đáng mua nhất nửa đầu 2026',
        summary: 'Thị trường laptop gaming đang sôi động với nhiều lựa chọn hấp dẫn từ ASUS, MSI, Lenovo. Cùng điểm qua những mẫu đáng chú ý nhất hiện nay.',
        date: '08/05/2026',
        readTime: '5 phút đọc',
        cover: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&q=80',
        hot: false,
        featured: false,
    },
    {
        id: 3,
        category: 'Khuyến mãi',
        title: 'TuSigma Sale 5/2026: Giảm đến 40% toàn bộ sản phẩm',
        summary: 'Nhân dịp kỷ niệm 3 năm thành lập, TuSigma tổ chức chương trình khuyến mãi lớn nhất năm với hàng trăm sản phẩm được giảm giá sâu.',
        date: '06/05/2026',
        readTime: '2 phút đọc',
        cover: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&q=80',
        hot: true,
        featured: false,
    },
    {
        id: 4,
        category: 'Đánh giá',
        title: 'Đánh giá chi tiết Samsung Galaxy S25 Ultra sau 1 tháng sử dụng',
        summary: 'Sau hơn một tháng trải nghiệm thực tế, Samsung Galaxy S25 Ultra có thực sự xứng đáng với mức giá cao cấp? Cùng tìm hiểu chi tiết.',
        date: '04/05/2026',
        readTime: '7 phút đọc',
        cover: 'https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=600&q=80',
        hot: false,
        featured: false,
    },
    {
        id: 5,
        category: 'Công nghệ',
        title: 'Tai nghe TWS 2026: Những tính năng ANC thay đổi cuộc chơi',
        summary: 'Công nghệ chống ồn chủ động (ANC) thế hệ mới trên các dòng tai nghe 2026 đang đặt ra tiêu chuẩn mới cho trải nghiệm âm thanh di động.',
        date: '02/05/2026',
        readTime: '4 phút đọc',
        cover: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
        hot: false,
        featured: false,
    },
    {
        id: 6,
        category: 'Mẹo hay',
        title: '7 cách đơn giản giúp điện thoại dùng pin lâu hơn',
        summary: 'Những thói quen nhỏ hàng ngày có thể tăng tuổi thọ pin điện thoại lên đáng kể. Áp dụng ngay 7 mẹo đơn giản này.',
        date: '30/04/2026',
        readTime: '3 phút đọc',
        cover: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&q=80',
        hot: false,
        featured: false,
    },
    {
        id: 7,
        category: 'Laptop',
        title: 'MacBook Air M4 2026: Mỏng hơn, mạnh hơn, pin trâu hơn',
        summary: 'Apple tiếp tục gây ấn tượng với MacBook Air thế hệ mới trang bị chip M4, thời lượng pin lên đến 22 giờ và thiết kế siêu mỏng chỉ 11mm.',
        date: '28/04/2026',
        readTime: '6 phút đọc',
        cover: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80',
        hot: true,
        featured: false,
    },
    {
        id: 8,
        category: 'Đánh giá',
        title: 'So sánh AirPods Pro 3 và Sony WF-1000XM6: Đâu là lựa chọn tốt nhất?',
        summary: 'Hai ông lớn trong làng tai nghe TWS cao cấp đối đầu trực tiếp. Chúng tôi đã thử nghiệm cả hai trong 2 tuần để tìm ra câu trả lời.',
        date: '25/04/2026',
        readTime: '8 phút đọc',
        cover: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&q=80',
        hot: false,
        featured: false,
    },
    {
        id: 9,
        category: 'Công nghệ',
        title: 'Màn hình OLED 2026: Công nghệ hiển thị bước sang kỷ nguyên mới',
        summary: 'Các nhà sản xuất màn hình đang đẩy mạnh công nghệ OLED thế hệ mới với độ sáng vượt 3000 nits, tần số quét 240Hz và tiết kiệm điện hơn 30%.',
        date: '22/04/2026',
        readTime: '5 phút đọc',
        cover: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&q=80',
        hot: false,
        featured: false,
    },
    {
        id: 10,
        category: 'Trí tuệ nhân tạo',
        title: 'Claude 4 ra mắt: AI mạnh nhất của Anthropic với khả năng lập luận vượt trội',
        summary: 'Anthropic chính thức giới thiệu Claude 4 với hiệu suất đột phá trong các tác vụ lập luận phức tạp, lập trình và phân tích dữ liệu, đặt ra tiêu chuẩn mới cho AI năm 2026.',
        date: '12/05/2026',
        readTime: '4 phút đọc',
        cover: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=600&q=80',
        hot: true,
        featured: false,
    },
]

const CATEGORIES = ['Tất cả', 'Công nghệ', 'Laptop', 'Khuyến mãi', 'Đánh giá', 'Mẹo hay']

function Clock() {
    const [time, setTime] = useState(new Date())
    useEffect(() => {
        const t = setInterval(() => setTime(new Date()), 1000)
        return () => clearInterval(t)
    }, [])
    const pad = (n: number) => n.toString().padStart(2, '0')
    const days = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy']
    return (
        <div className="flex items-center gap-6">
            <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-white tabular-nums tracking-tight">
                    {pad(time.getHours())}:{pad(time.getMinutes())}
                </span>
                <span className="text-xl font-light text-blue-300 tabular-nums">:{pad(time.getSeconds())}</span>
            </div>
            <div className="border-l border-blue-400 pl-6">
                <p className="text-blue-200 text-xs font-medium uppercase tracking-wider">{days[time.getDay()]}</p>
                <p className="text-white text-sm font-semibold mt-0.5">
                    {pad(time.getDate())}/{pad(time.getMonth() + 1)}/{time.getFullYear()}
                </p>
            </div>
        </div>
    )
}

export default function NewsPage() {
    const [activeCategory, setActiveCategory] = useState('Tất cả')
    const featured = NEWS.find(n => n.featured)!
    const filtered = activeCategory === 'Tất cả'
        ? NEWS.filter(n => !n.featured)
        : NEWS.filter(n => n.category === activeCategory)

    return (
        <div>

            {/* Hero Banner */}
            <section className="bg-gradient-to-r from-[#1a2f6e] to-[#2a4494] text-white overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col md:flex-row items-center gap-10">
                    <div className="flex-1">
                        <span className="bg-[#c8960c] text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide">
                            Cập nhật mỗi ngày
                        </span>
                        <h1 className="text-4xl md:text-5xl font-bold mt-4 leading-tight">
                            Tin Tức<br />Công Nghệ
                        </h1>
                        <p className="text-blue-200 mt-3 italic">Nhanh nhất · Chính xác nhất</p>
                        <div className="mt-6"><Clock /></div>
                    </div>
                    <div className="flex-1 flex justify-center">
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden max-w-md w-full">
                            <img
                                src={featured.cover}
                                alt={featured.title}
                                className="w-full h-44 object-cover"
                            />
                            <div className="p-5">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="bg-[#c8960c] text-white text-xs font-semibold px-2 py-0.5 rounded-full">Nổi bật</span>
                                </div>
                                <h3 className="text-white font-bold text-sm leading-snug line-clamp-2">{featured.title}</h3>
                                <p className="text-blue-200 text-xs mt-2">{featured.date} · {featured.readTime}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Danh mục */}
            <section className="max-w-7xl mx-auto px-4 pt-8 pb-4">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">Danh Mục</h2>
                </div>
                <div className="flex gap-2 flex-wrap">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeCategory === cat
                                    ? 'bg-[#1a2f6e] text-white'
                                    : 'bg-white text-gray-600 border border-gray-200 hover:border-[#1a2f6e] hover:text-[#1a2f6e]'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </section>

            {/* Danh sách bài viết */}
            <section className="max-w-7xl mx-auto px-4 pb-16">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-1 h-7 bg-[#1a2f6e] rounded-full" />
                    <h2 className="text-2xl font-bold text-gray-800">
                        {activeCategory === 'Tất cả' ? 'Tin Tức Mới Nhất' : activeCategory}
                    </h2>
                </div>

                {filtered.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filtered.map(news => (
                            <div
                                key={news.id}
                                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-shadow cursor-pointer"
                            >
                                {/* Ảnh cover full width */}
                                <div className="h-48 overflow-hidden">
                                    <img
                                        src={news.cover}
                                        alt={news.title}
                                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                    />
                                </div>
                                <div className="p-5">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xs font-semibold text-[#1a2f6e] bg-blue-50 px-2 py-0.5 rounded-full">
                                            {news.category}
                                        </span>
                                        {news.hot && <span className="text-xs text-red-400 font-medium">🔥 Hot</span>}
                                    </div>
                                    <h3 className="font-semibold text-gray-800 text-sm leading-snug line-clamp-2 mb-2">
                                        {news.title}
                                    </h3>
                                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-4">
                                        {news.summary}
                                    </p>
                                    <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-100">
                                        <span>{news.date}</span>
                                        <span>{news.readTime}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 text-gray-400">
                        <p className="text-lg font-medium">Chưa có bài viết nào trong mục này</p>
                        <p className="text-sm mt-1">Hãy quay lại sau nhé!</p>
                    </div>
                )}
            </section>

        </div>
    )
}
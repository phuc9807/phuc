import { useState } from 'react'

const CONTACT_INFO = [
    {
        icon: '📍',
        label: 'Địa chỉ',
        value: '43/1H, Xã Bà Điểm, Huyện Hóc Môn, TP. Hồ Chí Minh',
        sub: 'Mở cửa: 8:00 – 21:00 hàng ngày',
    },
    {
        icon: '📞',
        label: 'Điện thoại',
        value: '1800 6868',
        sub: 'Miễn phí · 8:00 – 22:00',
    },
    {
        icon: '✉️',
        label: 'Email',
        value: 'tu.support@gmail.com',
        sub: 'Phản hồi trong vòng 24 giờ',
    },
    {
        icon: '💬',
        label: 'Live Chat',
        value: 'Chat trực tiếp trên website',
        sub: 'Hỗ trợ 24/7',
    },
]

const FAQS = [
    {
        q: 'Tôi có thể đổi trả hàng trong bao lâu?',
        a: 'TuSigma hỗ trợ đổi trả trong vòng 30 ngày kể từ ngày mua, với sản phẩm còn nguyên hộp và đầy đủ phụ kiện.',
    },
    {
        q: 'Thời gian giao hàng là bao lâu?',
        a: 'Nội thành TP.HCM và Hà Nội: 2–4 tiếng. Các tỉnh thành khác: 1–3 ngày làm việc.',
    },
    {
        q: 'Sản phẩm có bảo hành không?',
        a: 'Tất cả sản phẩm đều có bảo hành chính hãng từ 12–24 tháng tùy loại, kèm bảo hành mở rộng tại cửa hàng.',
    },
]

export default function ContactPage() {
    const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
    const [submitted, setSubmitted] = useState(false)
    const [openFaq, setOpenFaq] = useState<number | null>(null)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitted(true)
    }

    return (
        <div>
            {/* Hero Banner — cùng style HomePage & NewsPage */}
            <section className="bg-gradient-to-r from-[#1a2f6e] to-[#2a4494] text-white overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col md:flex-row items-center gap-10">
                    <div className="flex-1">
                        <span className="bg-[#c8960c] text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide">
                            Hỗ trợ khách hàng
                        </span>
                        <h1 className="text-4xl md:text-5xl font-bold mt-4 leading-tight">
                            Liên Hệ<br />Với Chúng Tôi
                        </h1>
                        <p className="text-blue-200 mt-3 italic">Luôn sẵn sàng lắng nghe bạn</p>
                    </div>
                    <div className="flex-1 flex justify-center">
                        <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
                            {CONTACT_INFO.map((info, i) => (
                                <div
                                    key={i}
                                    className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 hover:bg-white/20 transition-colors"
                                >
                                    <div className="text-2xl mb-2">{info.icon}</div>
                                    <p className="text-blue-200 text-xs font-medium uppercase tracking-wider">{info.label}</p>
                                    <p className="text-white text-sm font-semibold mt-1 leading-snug">{info.value}</p>
                                    <p className="text-blue-300 text-xs mt-1">{info.sub}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Form + FAQ */}
            <section className="max-w-7xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">

                    {/* Form gửi yêu cầu */}
                    <div className="lg:col-span-3">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-1 h-7 bg-[#1a2f6e] rounded-full" />
                            <h2 className="text-2xl font-bold text-gray-800">Gửi Yêu Cầu Hỗ Trợ</h2>
                        </div>

                        {submitted ? (
                            <div className="bg-green-50 border border-green-200 rounded-2xl p-10 text-center">
                                <div className="text-5xl mb-4">✅</div>
                                <h3 className="text-xl font-bold text-green-700">Gửi thành công!</h3>
                                <p className="text-green-600 mt-2 text-sm">
                                    Chúng tôi đã nhận được yêu cầu của bạn và sẽ phản hồi trong vòng 24 giờ.
                                </p>
                                <button
                                    onClick={() => { setSubmitted(false); setForm({ name: '', email: '', phone: '', subject: '', message: '' }) }}
                                    className="mt-6 px-6 py-2 bg-[#1a2f6e] text-white rounded-full text-sm font-medium hover:bg-[#2a4494] transition-colors"
                                >
                                    Gửi yêu cầu khác
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                                            Họ và tên <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={form.name}
                                            onChange={handleChange}
                                            required
                                            placeholder="Nguyễn Văn A"
                                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#1a2f6e] focus:ring-1 focus:ring-[#1a2f6e] transition"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                                            Số điện thoại
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={form.phone}
                                            onChange={handleChange}
                                            placeholder="0909 123 456"
                                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#1a2f6e] focus:ring-1 focus:ring-[#1a2f6e] transition"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                                        Email <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        required
                                        placeholder="example@gmail.com"
                                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#1a2f6e] focus:ring-1 focus:ring-[#1a2f6e] transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                                        Chủ đề
                                    </label>
                                    <select
                                        name="subject"
                                        value={form.subject}
                                        onChange={handleChange}
                                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-[#1a2f6e] focus:ring-1 focus:ring-[#1a2f6e] transition bg-white"
                                    >
                                        <option value="">-- Chọn chủ đề --</option>
                                        <option>Tư vấn sản phẩm</option>
                                        <option>Đặt hàng & giao hàng</option>
                                        <option>Đổi trả & bảo hành</option>
                                        <option>Thanh toán</option>
                                        <option>Khác</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                                        Nội dung <span className="text-red-400">*</span>
                                    </label>
                                    <textarea
                                        name="message"
                                        value={form.message}
                                        onChange={handleChange}
                                        required
                                        rows={5}
                                        placeholder="Mô tả vấn đề bạn cần hỗ trợ..."
                                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#1a2f6e] focus:ring-1 focus:ring-[#1a2f6e] transition resize-none"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-[#1a2f6e] hover:bg-[#2a4494] text-white font-semibold py-3 rounded-xl transition-colors text-sm tracking-wide"
                                >
                                    Gửi Yêu Cầu
                                </button>
                            </form>
                        )}
                    </div>

                    {/* FAQ */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-1 h-7 bg-[#c8960c] rounded-full" />
                            <h2 className="text-2xl font-bold text-gray-800">Câu Hỏi Thường Gặp</h2>
                        </div>

                        <div className="space-y-3">
                            {FAQS.map((faq, i) => (
                                <div
                                    key={i}
                                    className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                                >
                                    <button
                                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
                                    >
                                        <span className="text-sm font-semibold text-gray-800 pr-4">{faq.q}</span>
                                        <span className={`text-[#1a2f6e] text-lg flex-shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-45' : ''}`}>
                                            +
                                        </span>
                                    </button>
                                    {openFaq === i && (
                                        <div className="px-5 pb-4 text-sm text-gray-500 leading-relaxed border-t border-gray-100 pt-3">
                                            {faq.a}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Map placeholder */}
                        <div className="mt-6 rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                            <iframe
                                title="TuSigma Location"
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4443!2d106.7009!3d10.7769!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTDCsDQ2JzM3LjAiTiAxMDbCsDQyJzAzLjIiRQ!5e0!3m2!1svi!2s!4v1"
                                width="100%"
                                height="200"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            />
                            <div className="px-4 py-3 bg-white">
                                <p className="text-xs font-semibold text-gray-700">📍 TuSigma – 43/1H, Xã Bà Điểm, Huyện Hóc Môn, TP.HCM</p>
                                <p className="text-xs text-gray-400 mt-0.5">Mở cửa 8:00 – 21:00 · Tất cả các ngày trong tuần</p>
                            </div>
                        </div>
                    </div>

                </div>
            </section>
        </div>
    )
}
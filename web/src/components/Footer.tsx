import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Brand */}
          <div>
            <h3 className="text-xl font-bold text-[#1a2f6e] mb-3">TuSigma</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Điểm đến hàng đầu cho những người đam mê công nghệ tại Việt Nam.
            </p>
          </div>

          {/* Công ty */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 uppercase mb-4">Công ty</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link to="/about" className="hover:text-[#1a2f6e] transition-colors">Về chúng tôi</Link></li>
              <li><Link to="/careers" className="hover:text-[#1a2f6e] transition-colors">Tuyển dụng</Link></li>
              <li><Link to="/news" className="hover:text-[#1a2f6e] transition-colors">Tin tức công nghệ</Link></li>
            </ul>
          </div>

          {/* Hỗ trợ */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 uppercase mb-4">Hỗ trợ</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link to="/warranty" className="hover:text-[#1a2f6e] transition-colors">Chính sách bảo hành</Link></li>
              <li><Link to="/terms" className="hover:text-[#1a2f6e] transition-colors">Điều khoản dịch vụ</Link></li>
              <li><Link to="/help" className="hover:text-[#1a2f6e] transition-colors">Trung tâm trợ giúp</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 uppercase mb-4">Newsletter</h4>
            <p className="text-sm text-gray-500 mb-3">Nhận thông báo về khuyến mãi sớm nhất.</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Email của bạn"
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1a2f6e] transition-colors"
              />
              <button className="bg-[#1a2f6e] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#152558] transition-colors">
                Gửi
              </button>
            </div>
          </div>

        </div>

        <div className="border-t border-gray-100 mt-10 pt-6 text-center text-sm text-gray-400">
          © 1911 TuSigma. Thiết kế bởi Tubocon.
        </div>
      </div>
    </footer>
  )
}
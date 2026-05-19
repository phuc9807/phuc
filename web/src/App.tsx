import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import Header from './components/Header'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import ProductsPage from './pages/ProductsPage'
import LoginPage from './pages/LoginPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ProductDetailPage from './pages/ProductDetailPage'
import ProfilePage from './pages/ProfilePage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import AdminProductsPage from './pages/AdminProductsPage'
import AdminOrdersPage from './pages/AdminOrdersPage'
import AdminCustomersPage from './pages/AdminCustomersPage'
import AdminStatsPage from './pages/AdminStatsPage'
import OrdersPage from './pages/OrdersPage'
import NewsPage from './pages/NewsPage'
import ContactPage from './pages/ContactPage'

// Chỉ cho admin vào — nếu chưa login → /login, nếu không phải admin → /
function RequireAdmin({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user)
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'admin') return <Navigate to="/" replace />
  return <>{children}</>
}

function App() {
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')
  const noLayout = isAdmin || ['/login', '/forgot-password'].includes(location.pathname)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {!noLayout && <Header />}
      <main className="flex-1">
        <Routes>
          {/* Customer routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:slug" element={<ProductDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* Admin routes */}
          <Route path="/admin/dashboard" element={<RequireAdmin><AdminDashboardPage /></RequireAdmin>} />
          <Route path="/admin/products" element={<RequireAdmin><AdminProductsPage /></RequireAdmin>} />
          <Route path="/admin/orders" element={<RequireAdmin><AdminOrdersPage /></RequireAdmin>} />
          <Route path="/admin/customers" element={<RequireAdmin><AdminCustomersPage /></RequireAdmin>} />
          <Route path="/admin/stats" element={<RequireAdmin><AdminStatsPage /></RequireAdmin>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {!noLayout && <Footer />}
    </div>
  )
}

export default App
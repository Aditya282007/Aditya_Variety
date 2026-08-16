import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { Layout } from './components/Layout'
import { AdminLayout } from './components/AdminLayout'
import { HomePage } from './pages/HomePage'
import { ProductsPage } from './pages/ProductsPage'
import { ProductDetailPage } from './pages/ProductDetailPage'
import { CartPage } from './pages/CartPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { CheckoutPage } from './pages/CheckoutPage'
import { AccountPage } from './pages/AccountPage'
import { AdminLoginPage } from './pages/AdminLoginPage'
import { AdminDashboardPage } from './pages/AdminDashboardPage'
import { AdminProductsPage } from './pages/AdminProductsPage'
import { AdminProductFormPage } from './pages/AdminProductFormPage'
import { AdminOrdersPage } from './pages/AdminOrdersPage'
import { AdminOrderDetailPage } from './pages/AdminOrderDetailPage'

function ProtectedRoute({ children, requiredRole }: { children: React.ReactNode; requiredRole?: 'customer' | 'admin' }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" aria-label="Loading" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: window.location.pathname }} />
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute requiredRole="admin">{children}</ProtectedRoute>
}

function CustomerRoute({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute requiredRole="customer">{children}</ProtectedRoute>
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/:id" element={<ProductDetailPage />} />
        <Route path="categories" element={<ProductsPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="checkout" element={<CustomerRoute><CheckoutPage /></CustomerRoute>} />
        <Route path="account/*" element={<CustomerRoute><AccountPage /></CustomerRoute>} />
      </Route>

      <Route path="admin/login" element={<AdminLoginPage />} />

      <Route element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route path="admin" element={<AdminDashboardPage />} />
        <Route path="admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="admin/products" element={<AdminProductsPage />} />
        <Route path="admin/products/new" element={<AdminProductFormPage />} />
        <Route path="admin/products/:id/edit" element={<AdminProductFormPage />} />
        <Route path="admin/orders" element={<AdminOrdersPage />} />
        <Route path="admin/orders/:id" element={<AdminOrderDetailPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
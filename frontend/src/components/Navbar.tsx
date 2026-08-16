import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { Button } from './Button'
import { cn } from '../utils/cn'
import { ShoppingCart, User, LogOut, Menu, X, Store } from 'lucide-react'
import { useState } from 'react'

interface NavbarProps {
  isAdmin?: boolean
}

export function Navbar({ isAdmin = false }: NavbarProps) {
  const { user, logout, loading } = useAuth()
  const { getItemCount } = useCart()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const cartCount = getItemCount()

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/products', label: 'Products' },
    { path: '/categories', label: 'Categories' }
  ]

  const adminNavLinks = [
    { path: '/admin', label: 'Dashboard' },
    { path: '/admin/products', label: 'Products' },
    { path: '/admin/orders', label: 'Orders' }
  ]

  const links = isAdmin ? adminNavLinks : navLinks

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-sage-100">
      <nav className="container" aria-label="Main navigation">
        <div className="flex h-16 items-center justify-between">
          <Link to={isAdmin ? '/admin' : '/'} className="flex items-center gap-2" aria-label="Variety Store Home">
            <Store className="h-7 w-7 text-brand-600" aria-hidden="true" />
            <span className="font-display font-semibold text-xl text-sage-950">Variety Store</span>
          </Link>

          <div className="hidden md:flex md:items-center md:gap-6">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  'text-sm font-medium transition-colors duration-200 relative',
                  location.pathname === link.path
                    ? 'text-brand-600'
                    : 'text-sage-600 hover:text-sage-900'
                )}
              >
                {link.label}
                {location.pathname === link.path && (
                  <span className="absolute bottom-[-8px] left-0 right-0 h-0.5 bg-brand-500 rounded-full" />
                )}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {!isAdmin && (
              <Link to="/cart" className="relative p-2 text-sage-600 hover:text-sage-900 rounded-xl hover:bg-sage-100 transition-colors" aria-label={`Cart, ${cartCount} items`}>
                <ShoppingCart className="h-5 w-5" aria-hidden="true" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-white text-xs font-bold">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>
            )}

            {user ? (
              <div className="hidden md:flex md:items-center md:gap-3">
                <Link to={isAdmin ? '/admin' : '/account'} className="text-sm font-medium text-sage-600 hover:text-sage-900 transition-colors flex items-center gap-1">
                  <User className="h-4 w-4" aria-hidden="true" />
                  {user.name}
                </Link>
                <Button variant="ghost" size="sm" onClick={() => logout()}>
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </div>
            ) : (
              !isAdmin && (
                <div className="hidden md:flex md:items-center md:gap-2">
                  <Link to="/login" className="text-sm font-medium text-sage-600 hover:text-sage-900 transition-colors px-3 py-2 rounded-lg">
                    Login
                  </Link>
                  <Link to="/register">
                    <Button size="sm">Sign Up</Button>
                  </Link>
                </div>
              )
            )}

            <button
              className="md:hidden p-2 text-sage-600 hover:text-sage-900 rounded-xl hover:bg-sage-100 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        <div
          id="mobile-menu"
          className={cn(
            'md:hidden overflow-hidden transition-all duration-300 ease-in-out border-t border-sage-100 bg-white',
            mobileMenuOpen ? 'max-h-96 opacity-100 py-4' : 'max-h-0 opacity-0 py-0'
          )}
        >
          <div className="flex flex-col gap-2 px-2">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  'px-3 py-2 rounded-xl text-sm font-medium transition-colors',
                  location.pathname === link.path
                    ? 'bg-brand-50 text-brand-600'
                    : 'text-sage-600 hover:bg-sage-50 hover:text-sage-900'
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            {!isAdmin && (
              <Link
                to="/cart"
                className="px-3 py-2 rounded-xl text-sm font-medium text-sage-600 hover:bg-sage-50 hover:text-sage-900 transition-colors flex items-center gap-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <ShoppingCart className="h-5 w-5" aria-hidden="true" />
                Cart
                {cartCount > 0 && (
                  <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-white text-xs font-bold">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}

            {user ? (
              <>
                <Link
                  to={isAdmin ? '/admin' : '/account'}
                  className="px-3 py-2 rounded-xl text-sm font-medium text-sage-600 hover:bg-sage-50 hover:text-sage-900 transition-colors flex items-center gap-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="h-5 w-5" aria-hidden="true" />
                  {user.name}
                </Link>
                <button
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="px-3 py-2 rounded-xl text-sm font-medium text-sage-600 hover:bg-sage-50 hover:text-sage-900 transition-colors flex items-center gap-2 text-left"
                >
                  <LogOut className="h-5 w-5" aria-hidden="true" />
                  Logout
                </button>
              </>
            ) : (
              !isAdmin && (
                <div className="flex flex-col gap-2 pt-2 border-t border-sage-100">
                  <Link
                    to="/login"
                    className="px-3 py-2 rounded-xl text-sm font-medium text-sage-600 hover:bg-sage-50 hover:text-sage-900 transition-colors text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full">Sign Up</Button>
                  </Link>
                </div>
              )
            )}
          </div>
        </div>
      </nav>
    </header>
  )
}
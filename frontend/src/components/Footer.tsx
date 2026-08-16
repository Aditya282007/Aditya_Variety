import { Link } from 'react-router-dom'
import { Store, MapPin, Phone, Mail, Truck, Shield, RotateCcw, Clock } from 'lucide-react'
import { cn } from '../utils/cn'

export function Footer() {
  const currentYear = new Date().getFullYear()

  const features = [
    { icon: Truck, title: 'Free Delivery', desc: 'On orders above ₹500' },
    { icon: Shield, title: 'Quality Guaranteed', desc: 'Fresh & authentic products' },
    { icon: RotateCcw, title: 'Easy Returns', desc: '7-day return policy' },
    { icon: Clock, title: 'Daily 8AM - 10PM', desc: 'We\'re here to help' }
  ]

  const footerLinks = {
    Shop: [
      { label: 'All Products', href: '/products' },
      { label: 'Categories', href: '/categories' },
      { label: 'Offers', href: '#' },
      { label: 'New Arrivals', href: '#' }
    ],
    Support: [
      { label: 'Contact Us', href: '/contact' },
      { label: 'FAQs', href: '#' },
      { label: 'Track Order', href: '#' },
      { label: 'Returns', href: '#' }
    ],
    Account: [
      { label: 'My Account', href: '/account' },
      { label: 'Orders', href: '/account/orders' },
      { label: 'Wishlist', href: '#' },
      { label: 'Settings', href: '#' }
    ],
    Legal: [
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms of Service', href: '#' },
      { label: 'Refund Policy', href: '#' },
      { label: 'Shipping Info', href: '#' }
    ]
  }

  return (
    <footer className="bg-sage-950 text-sage-100" role="contentinfo">
      <div className="container py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 lg:gap-12">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-6" aria-label="Variety Store Home">
              <Store className="h-8 w-8 text-brand-400" aria-hidden="true" />
              <span className="font-display font-semibold text-xl text-white">Variety Store</span>
            </Link>
            <p className="text-sage-400 text-sm leading-relaxed mb-6 max-w-xs">
              Your friendly neighborhood variety store. Quality groceries, household essentials, and everyday needs delivered to your doorstep.
            </p>
            <div className="flex flex-wrap gap-4 text-sm text-sage-400">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" aria-hidden="true" />
                <span>123 Main Street, Your City</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" aria-hidden="true" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" aria-hidden="true" />
                <span>hello@varietystore.in</span>
              </div>
            </div>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <nav key={title} aria-labelledby={`footer-${title.toLowerCase()}`}>
              <h3 id={`footer-${title.toLowerCase()}`} className="font-semibold text-white mb-4">
                {title}
              </h3>
              <ul className="space-y-3" role="list">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm text-sage-400 hover:text-brand-300 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-sage-800">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <p className="text-sm text-sage-500">
              © {currentYear} Variety Store. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-sage-500 hover:text-brand-300 transition-colors" aria-label="Facebook">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              <a href="#" className="text-sage-500 hover:text-brand-300 transition-colors" aria-label="Instagram">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>
              <a href="#" className="text-sage-500 hover:text-brand-300 transition-colors" aria-label="WhatsApp">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20.52 3.46A12.07 12.07 0 0 0 12 0C5.37 0 0 5.37 0 12c0 2.31.7 4.47 1.88 6.34L0 24l6.53-1.75a12.06 12.06 0 0 0 6.46 1.88A12.07 12.07 0 0 0 24 12c0-6.63-5.37-12-12-12-.96 0-1.87.13-2.74.35l-.71-.71-.02-.02z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
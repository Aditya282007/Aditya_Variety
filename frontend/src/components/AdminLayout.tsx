import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Footer } from './Footer'

export function AdminLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-cream-50">
      <Navbar isAdmin={true} />
      <main className="flex-1" id="main-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'

interface CartItem {
  productId: string
  name: string
  price: number
  qty: number
  imageUrl: string
  stock: number
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'qty'> & { qty?: number }) => void
  removeItem: (productId: string) => void
  updateQty: (productId: string, qty: number) => void
  clearCart: () => void
  getTotal: () => number
  getItemCount: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const CART_STORAGE_KEY = 'variety-store-cart'

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const addItem = (item: Omit<CartItem, 'qty'> & { qty?: number }) => {
    setItems(prev => {
      const existing = prev.find(i => i.productId === item.productId)
      if (existing) {
        const newQty = Math.min(existing.qty + (item.qty || 1), existing.stock)
        return prev.map(i => i.productId === item.productId ? { ...i, qty: newQty } : i)
      }
      return [...prev, { ...item, qty: item.qty || 1 }]
    })
  }

  const removeItem = (productId: string) => {
    setItems(prev => prev.filter(i => i.productId !== productId))
  }

  const updateQty = (productId: string, qty: number) => {
    if (qty <= 0) {
      removeItem(productId)
      return
    }
    setItems(prev => prev.map(i =>
      i.productId === productId ? { ...i, qty: Math.min(qty, i.stock) } : i
    ))
  }

  const clearCart = () => {
    setItems([])
  }

  const getTotal = () => {
    return items.reduce((sum, item) => sum + item.price * item.qty, 0)
  }

  const getItemCount = () => {
    return items.reduce((sum, item) => sum + item.qty, 0)
  }

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, getTotal, getItemCount }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
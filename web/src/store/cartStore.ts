import { create } from 'zustand'
import api from '../services/api'

export interface CartItemWithProduct {
  cart_item_id: number
  cart_id: number
  product_id: number
  quantity: number
  // product info (fetched separately)
  name?: string
  price?: number
  image_url?: string
  slug?: string
  variant?: string
  stock?: number
}

interface CartStore {
  items: CartItemWithProduct[]
  loading: boolean
  fetchCart: (user_id: number) => Promise<void>
  addToCart: (user_id: number, product_id: number, quantity: number) => Promise<void>
  removeFromCart: (cart_item_id: number) => Promise<void>
  updateQuantity: (cart_item_id: number, quantity: number) => Promise<void>
  clearCart: () => void
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  loading: false,

  fetchCart: async (user_id) => {
    set({ loading: true })
    try {
      const [cartRes, productsRes] = await Promise.all([
        api.get(`/cart/${user_id}`),
        api.get('/products'),
      ])
      const cartItems: CartItemWithProduct[] = cartRes.data
      // Backend có thể trả { products: [...] } hoặc [...]
      const allProducts = productsRes.data?.products || productsRes.data || []

      const enriched = cartItems.map((item) => {
        const product = allProducts.find((p: any) => p.product_id === item.product_id)
        return {
          ...item,
          name: product?.product_name || 'Sản phẩm',
          price: product?.price || 0,
          image_url: product?.image || '',
          slug: product?.slug || '',
          variant: product?.variant || '',
          stock: product?.stock ?? 0,
        }
      })
      set({ items: enriched })
    } catch {
      set({ items: [] })
    }
    set({ loading: false })
  },

  addToCart: async (user_id, product_id, quantity) => {
    await api.post('/cart', { user_id, product_id, quantity })
    get().fetchCart(user_id)
  },

  removeFromCart: async (cart_item_id) => {
    await api.delete(`/cart/${cart_item_id}`)
    set(state => ({
      items: state.items.filter(i => i.cart_item_id !== cart_item_id)
    }))
  },

  updateQuantity: async (cart_item_id, quantity) => {
    if (quantity < 1) return
    try {
      await api.put(`/cart/${cart_item_id}`, { quantity })
      set(state => ({
        items: state.items.map(i =>
          i.cart_item_id === cart_item_id ? { ...i, quantity } : i
        )
      }))
    } catch {
      // Nếu API báo lỗi (vd: không đủ hàng) thì không cập nhật UI
    }
  },

  clearCart: () => set({ items: [] }),
}))
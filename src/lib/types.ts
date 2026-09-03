export type Product = {
  id: string
  category_id: string
  name: string
  slug: string
  description: string | null
  price: number
  unit: string | null
  image_url: string | null
  in_stock: boolean
  sort_order: number
}

export type CartItem = {
  id: string
  user_id: string
  product_id: string
  quantity: number
  product?: Product
}

export type Address = {
  id: string
  user_id: string
  label: string
  address_line: string | null
  city: string | null
  lat: number
  lng: number
  in_service_area: boolean
  is_default: boolean
}

export type OrderStatus = 'pending' | 'confirmed' | 'out_for_delivery' | 'completed' | 'cancelled'
export type PaymentMethod = 'cash' | 'card'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'cod_pending'

export type Order = {
  id: string
  order_number: string
  user_id: string
  address_id: string | null
  customer_name: string
  customer_phone: string
  lat: number
  lng: number
  items_summary: string
  total_amount: number
  payment_method: PaymentMethod
  payment_status: PaymentStatus
  moyasar_payment_id: string | null
  status: OrderStatus
  proof_photo_url: string | null
  created_at: string
  updated_at: string
}

export type OrderItem = {
  id: string
  order_id: string
  product_id: string | null
  product_name: string
  unit_price: number
  quantity: number
  line_total: number
}

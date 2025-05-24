// types/index.ts

// 用户信息类型（已存在，保持兼容）
export interface IUserInfo {
  nickname: string
  avatar: string
  token?: string
}

// 商品相关类型
export interface Product {
  id?: number
  barcode: string
  nameCN?: string
  nameEN: string
  price: number
  discount_price?: number
  tax_rate?: number
  category?: string
  stock?: number
  imageUrl?: string
  created_at?: string
  updated_at?: string
}

// 客户相关类型
export interface Customer {
  id: number
  name: string
  address?: string
  postal_code?: string
  city?: string
  nip?: string
  phone?: string
  email?: string
  notes?: string
  created_at?: string
  updated_at?: string
}

// 购物车相关类型
export interface CartItem {
  id: number | string
  barcode: string
  nameCN?: string
  nameEN: string
  price: number
  discount_price?: number
  tax_rate: number
  quantity: number
  imageUrl?: string
  category?: string
}

// 挂单相关类型
export interface HangingOrder {
  id: number
  order_number: string
  customer_id?: number
  customer_name?: string
  cart_data: string // JSON字符串
  total_amount: number
  tax_amount: number
  discount_amount: number
  final_amount: number
  note?: string
  operator?: string
  created_at: string
  updated_at: string
}

// 订单相关类型
export interface Order {
  id: number
  order_no: string
  customer_id?: number
  total_amount: number
  discount_amount: number
  tax_amount: number
  final_amount: number
  status: OrderStatus
  payment_status: PaymentStatus
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: number
  order_id: number
  product_id?: number
  barcode: string
  product_name: string
  price: number
  discount_price?: number
  tax_rate: number
  quantity: number
  subtotal: number
}

export interface Payment {
  id: number
  order_id: number
  payment_method: PaymentMethod
  amount: number
  status: PaymentStatus
  transaction_no?: string
  created_at: string
}

// 枚举类型
export enum PaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  MOBILE = 'mobile',
  MIXED = 'mixed',
}

export enum OrderStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export enum PaymentStatus {
  UNPAID = 'unpaid',
  PAID = 'paid',
  REFUNDED = 'refunded',
  PARTIAL_REFUNDED = 'partial_refunded',
}

// API响应类型
export interface ApiResponse<T = any> {
  status: 'success' | 'error'
  message: string
  data?: T
  error?: any
}

// 分页响应类型
export interface PaginationResponse<T = any> {
  status: 'success' | 'error'
  message: string
  data?: {
    list: T[]
    pagination: {
      total: number
      currentPage: number
      pageSize: number
      totalPages: number
    }
  }
}

// 数据库操作相关类型
export interface DatabaseResult {
  status: 'success' | 'error'
  message: string
  data?: any
  error?: any
}

// 搜索选项类型
export interface SearchOptions {
  keyword?: string
  category?: string
  priceRange?: {
    min: number
    max: number
  }
  orderBy?: string
  limit?: number
  offset?: number
}

// 导入/导出相关类型
export interface ImportResult {
  status: 'success' | 'error'
  message: string
  data?: {
    total: number
    success: number
    failed: number
    errors?: string[]
  }
}

// 结算相关类型
export interface CheckoutData {
  items: CartItem[]
  customer: Customer | null
  subtotal: number
  taxAmount: number
  discount: number
  total: number
  note: string
}

// 挂单操作结果类型
export interface HangingOrderResult {
  success: boolean
  orderNumber?: string
  message: string
}

// 导航相关类型
export interface NavItem {
  text: string
  iconType: string
  url: string
}

export interface NavChangeEvent {
  index: number
  item: NavItem
  type: 'nav' | 'settings'
}

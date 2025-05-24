// store/cart.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { createHangingOrder } from '@/common/db/hangingOrder.js'
import { orderNumberService, ORDER_TYPES } from '@/common/services/orderNumberService.js'

// 类型定义
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

export interface Customer {
  id: number
  name: string
  address?: string
  postal_code?: string
  city?: string
  nip?: string
  phone?: string
  email?: string
}

export interface Product {
  barcode: string
  nameCN?: string
  nameEN: string
  price: number
  discount_price?: number
  tax_rate?: number
  category?: string
  imageUrl?: string
}

export interface CheckoutData {
  items: CartItem[]
  customer: Customer | null
  subtotal: number
  taxAmount: number
  discount: number
  total: number
  note: string
}

export interface HangingOrderResult {
  success: boolean
  orderNumber?: string
  message: string
}

export const useCartStore = defineStore(
  'cart',
  () => {
    // 状态
    const cartItems = ref<CartItem[]>([])
    const currentCustomer = ref<Customer | null>(null)
    const discountAmount = ref<number>(0)
    const taxRate = ref<number>(0.23) // 默认23%税率
    const note = ref<string>('')

    // 计算属性
    const totalQuantity = computed<number>(() => {
      return cartItems.value.reduce((total, item) => total + item.quantity, 0)
    })

    const subtotalAmount = computed<number>(() => {
      return cartItems.value.reduce((total, item) => {
        const itemPrice = item.discount_price || item.price
        return total + itemPrice * item.quantity
      }, 0)
    })

    const taxAmount = computed<number>(() => {
      return subtotalAmount.value * taxRate.value
    })

    const totalAmount = computed<number>(() => {
      return subtotalAmount.value + taxAmount.value - discountAmount.value
    })

    const finalAmount = computed<number>(() => {
      return Math.max(0, totalAmount.value)
    })

    const isEmpty = computed<boolean>(() => cartItems.value.length === 0)

    // 购物车操作方法
    const addToCart = (product: Product, quantity: number = 1): void => {
      const existingItemIndex = cartItems.value.findIndex(
        (item) => item.barcode === product.barcode,
      )

      if (existingItemIndex !== -1) {
        // 商品已存在，增加数量
        cartItems.value[existingItemIndex].quantity += quantity
      } else {
        // 新商品，添加到购物车
        const cartItem: CartItem = {
          id: Date.now(), // 临时ID
          barcode: product.barcode,
          nameCN: product.nameCN,
          nameEN: product.nameEN,
          price: product.price,
          discount_price: product.discount_price,
          tax_rate: product.tax_rate || 0,
          quantity: quantity,
          imageUrl: product.imageUrl || '/static/default-product.png',
          category: product.category,
        }
        cartItems.value.push(cartItem)
      }
    }

    const removeFromCart = (index: number): void => {
      if (index >= 0 && index < cartItems.value.length) {
        cartItems.value.splice(index, 1)
      }
    }

    const updateQuantity = (index: number, quantity: number): void => {
      if (index >= 0 && index < cartItems.value.length && quantity > 0) {
        cartItems.value[index].quantity = quantity
      }
    }

    const increaseQuantity = (index: number): void => {
      if (index >= 0 && index < cartItems.value.length) {
        cartItems.value[index].quantity++
      }
    }

    const decreaseQuantity = (index: number): void => {
      if (index >= 0 && index < cartItems.value.length) {
        if (cartItems.value[index].quantity > 1) {
          cartItems.value[index].quantity--
        }
      }
    }

    const clearCart = (): void => {
      cartItems.value = []
      currentCustomer.value = null
      discountAmount.value = 0
      note.value = ''
    }

    // 客户管理
    const setCustomer = (customer: Customer): void => {
      currentCustomer.value = customer
    }

    const clearCustomer = (): void => {
      currentCustomer.value = null
    }

    // 折扣管理
    const setDiscount = (amount: number): void => {
      discountAmount.value = Math.max(0, amount)
    }

    const setDiscountPercent = (percent: number): void => {
      const discount = subtotalAmount.value * (percent / 100)
      setDiscount(discount)
    }

    // 挂单功能
    const createHangingOrderFromCart = async (
      orderNote: string = '',
    ): Promise<HangingOrderResult> => {
      if (isEmpty.value) {
        throw new Error('购物车为空，无法创建挂单')
      }

      try {
        // 生成挂单号
        const orderNumber = await orderNumberService.generateOrderNumber(ORDER_TYPES.HANGING)

        // 准备挂单数据
        const hangingOrderData = {
          order_number: orderNumber,
          customer_id: currentCustomer.value?.id || null,
          customer_name: currentCustomer.value?.name || null,
          cart_data: JSON.stringify(cartItems.value), // 将购物车数据序列化
          total_amount: subtotalAmount.value,
          tax_amount: taxAmount.value,
          discount_amount: discountAmount.value,
          final_amount: finalAmount.value,
          note: orderNote || note.value,
          operator: 'current_user', // 这里应该从用户状态获取
        }

        // 保存到数据库
        const result = await createHangingOrder(hangingOrderData)

        if (result.status === 'success') {
          // 挂单成功，清空当前购物车
          clearCart()
          return {
            success: true,
            orderNumber: orderNumber,
            message: '挂单创建成功',
          }
        } else {
          throw new Error(result.message || '挂单创建失败')
        }
      } catch (error: any) {
        console.error('创建挂单失败:', error)
        return {
          success: false,
          message: error.message || '创建挂单失败',
        }
      }
    }

    // 从挂单恢复购物车
    const restoreFromHangingOrder = (hangingOrder: any): boolean => {
      try {
        // 清空当前购物车
        clearCart()

        // 解析购物车数据
        const cartData: CartItem[] = JSON.parse(hangingOrder.cart_data)
        cartItems.value = cartData

        // 恢复其他信息
        if (hangingOrder.customer_id) {
          currentCustomer.value = {
            id: hangingOrder.customer_id,
            name: hangingOrder.customer_name,
          }
        }

        discountAmount.value = hangingOrder.discount_amount || 0
        note.value = hangingOrder.note || ''

        return true
      } catch (error) {
        console.error('恢复挂单失败:', error)
        return false
      }
    }

    // 结算准备数据
    const getCheckoutData = (): CheckoutData => {
      return {
        items: cartItems.value,
        customer: currentCustomer.value,
        subtotal: subtotalAmount.value,
        taxAmount: taxAmount.value,
        discount: discountAmount.value,
        total: finalAmount.value,
        note: note.value,
      }
    }

    return {
      // 状态
      cartItems,
      currentCustomer,
      discountAmount,
      taxRate,
      note,

      // 计算属性
      totalQuantity,
      subtotalAmount,
      taxAmount,
      totalAmount,
      finalAmount,
      isEmpty,

      // 购物车操作
      addToCart,
      removeFromCart,
      updateQuantity,
      increaseQuantity,
      decreaseQuantity,
      clearCart,

      // 客户管理
      setCustomer,
      clearCustomer,

      // 折扣管理
      setDiscount,
      setDiscountPercent,

      // 挂单功能
      createHangingOrderFromCart,
      restoreFromHangingOrder,

      // 结算
      getCheckoutData,
    }
  },
  {
    persist: {
      storage: {
        getItem: uni.getStorageSync,
        setItem: uni.setStorageSync,
      },
      // 只持久化关键数据，避免存储过多临时数据
      paths: ['cartItems', 'currentCustomer', 'discountAmount', 'note'],
    },
  },
)

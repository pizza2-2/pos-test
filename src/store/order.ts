// store/order.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import db from '@/common/db/index.js'
import { orderNumberService, ORDER_TYPES } from '@/common/services/orderNumberService.js'
import { withLoggingTransaction } from '@/common/db/transaction.js'
import type { CheckoutData } from './cart'

// 类型定义
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

export interface OrderDetail {
  order: Order
  items: OrderItem[]
  payments: Payment[]
}

export interface CreateOrderResult {
  success: boolean
  data?: {
    orderId: number
    orderNo: string
    totalAmount: number
  }
  message: string
}

export interface OrderListOptions {
  page?: number
  pageSize?: number
  status?: OrderStatus
  startDate?: string
  endDate?: string
}

export interface ReturnItem {
  product_id?: number
  barcode: string
  product_name: string
  price: number
  returnQuantity: number
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

export const useOrderStore = defineStore('order', () => {
  // 当前正在处理的订单
  const currentOrder = ref<CreateOrderResult['data'] | null>(null)
  const isProcessing = ref<boolean>(false)

  // 支付方式
  const PAYMENT_METHODS = PaymentMethod

  // 创建订单
  const createOrder = async (
    checkoutData: CheckoutData,
    paymentMethod: PaymentMethod = PaymentMethod.CASH,
  ): Promise<CreateOrderResult> => {
    if (isProcessing.value) {
      throw new Error('正在处理订单，请稍候')
    }

    isProcessing.value = true

    try {
      const result = await withLoggingTransaction(async (tx) => {
        // 1. 生成订单号
        const orderNo = await orderNumberService.generateOrderNumber(ORDER_TYPES.SALE)

        // 2. 创建订单主记录
        const orderData = {
          order_no: orderNo,
          customer_id: checkoutData.customer?.id || null,
          total_amount: checkoutData.total,
          discount_amount: checkoutData.discount,
          tax_amount: checkoutData.taxAmount,
          final_amount: checkoutData.total,
          status: OrderStatus.COMPLETED,
          payment_status: PaymentStatus.PAID,
        }

        const orderResult = await db.insert('orders', orderData)

        // 3. 获取订单ID (需要查询获取自增ID)
        const orderQuery = await db.query('orders', {
          where: { order_no: orderNo },
          limit: 1,
        })

        if (!orderQuery.data || orderQuery.data.length === 0) {
          throw new Error('获取订单ID失败')
        }

        const orderId = orderQuery.data[0].id

        // 4. 创建订单明细
        for (const item of checkoutData.items) {
          const itemData = {
            order_id: orderId,
            product_id: item.id || null,
            barcode: item.barcode,
            product_name: item.nameEN,
            price: item.price,
            discount_price: item.discount_price,
            tax_rate: item.tax_rate || 0,
            quantity: item.quantity,
            subtotal: (item.discount_price || item.price) * item.quantity,
          }

          await db.insert('order_items', itemData)
        }

        // 5. 创建支付记录
        const paymentData = {
          order_id: orderId,
          payment_method: paymentMethod,
          amount: checkoutData.total,
          status: PaymentStatus.PAID,
          transaction_no: `PAY_${orderNo}_${Date.now()}`,
        }

        await db.insert('payments', paymentData)

        // 6. 更新商品库存 (如果需要)
        for (const item of checkoutData.items) {
          // 这里可以添加库存更新逻辑
          // await updateProductStock(item.barcode, -item.quantity)
        }

        return {
          orderId,
          orderNo,
          totalAmount: checkoutData.total,
        }
      }, '创建销售订单')

      currentOrder.value = result

      return {
        success: true,
        data: result,
        message: '订单创建成功',
      }
    } catch (error: any) {
      console.error('创建订单失败:', error)
      return {
        success: false,
        message: error.message || '订单创建失败',
      }
    } finally {
      isProcessing.value = false
    }
  }

  // 获取订单列表
  const getOrderList = async (options: OrderListOptions = {}) => {
    try {
      const { page = 1, pageSize = 20, status, startDate, endDate } = options

      let whereConditions: Record<string, any> = {}

      if (status) {
        whereConditions.status = status
      }

      const result = await db.paginate('orders', page, pageSize, {
        where: whereConditions,
        orderBy: 'created_at DESC',
      })

      return result
    } catch (error: any) {
      console.error('获取订单列表失败:', error)
      return {
        status: 'error',
        message: '获取订单列表失败',
        error,
      }
    }
  }

  // 获取订单详情
  const getOrderDetail = async (
    orderId: number,
  ): Promise<{ success: boolean; data?: OrderDetail; message?: string }> => {
    try {
      // 获取订单基本信息
      const orderResult = await db.query('orders', {
        where: { id: orderId },
      })

      if (!orderResult.data || orderResult.data.length === 0) {
        throw new Error('订单不存在')
      }

      const order = orderResult.data[0] as Order

      // 获取订单明细
      const itemsResult = await db.query('order_items', {
        where: { order_id: orderId },
        orderBy: 'id ASC',
      })

      // 获取支付信息
      const paymentsResult = await db.query('payments', {
        where: { order_id: orderId },
        orderBy: 'created_at ASC',
      })

      return {
        success: true,
        data: {
          order,
          items: (itemsResult.data as OrderItem[]) || [],
          payments: (paymentsResult.data as Payment[]) || [],
        },
      }
    } catch (error: any) {
      console.error('获取订单详情失败:', error)
      return {
        success: false,
        message: error.message || '获取订单详情失败',
      }
    }
  }

  // 退货处理
  const processReturn = async (
    originalOrderId: number,
    returnItems: ReturnItem[],
  ): Promise<CreateOrderResult> => {
    isProcessing.value = true

    try {
      const result = await withLoggingTransaction(async (tx) => {
        // 1. 生成退货订单号
        const returnOrderNo = await orderNumberService.generateOrderNumber(ORDER_TYPES.RETURN)

        // 2. 计算退货金额
        const returnAmount = returnItems.reduce((total, item) => {
          return total + item.price * item.returnQuantity
        }, 0)

        // 3. 创建退货订单
        const returnOrderData = {
          order_no: returnOrderNo,
          customer_id: null, // 可以从原订单获取
          total_amount: -returnAmount, // 负数表示退货
          discount_amount: 0,
          tax_amount: 0,
          final_amount: -returnAmount,
          status: OrderStatus.COMPLETED,
          payment_status: PaymentStatus.REFUNDED,
        }

        const returnOrderResult = await db.insert('orders', returnOrderData)

        // 4. 创建退货明细
        for (const item of returnItems) {
          const itemData = {
            order_id: returnOrderResult.insertId,
            product_id: item.product_id,
            barcode: item.barcode,
            product_name: item.product_name,
            price: item.price,
            discount_price: null,
            tax_rate: 0,
            quantity: -item.returnQuantity, // 负数表示退货
            subtotal: -(item.price * item.returnQuantity),
          }

          await db.insert('order_items', itemData)
        }

        return {
          orderId: returnOrderResult.insertId,
          orderNo: returnOrderNo,
          totalAmount: returnAmount,
        }
      }, '处理退货订单')

      return {
        success: true,
        data: result,
        message: '退货处理成功',
      }
    } catch (error: any) {
      console.error('退货处理失败:', error)
      return {
        success: false,
        message: error.message || '退货处理失败',
      }
    } finally {
      isProcessing.value = false
    }
  }

  // 清空当前订单
  const clearCurrentOrder = (): void => {
    currentOrder.value = null
  }

  return {
    // 状态
    currentOrder,
    isProcessing,
    PAYMENT_METHODS,

    // 方法
    createOrder,
    getOrderList,
    getOrderDetail,
    processReturn,
    clearCurrentOrder,
  }
})

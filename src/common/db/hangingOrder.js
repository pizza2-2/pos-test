/**
 * 挂单功能相关的数据库操作
 */
import db from './index.js';

/**
 * 创建挂单
 * @param {Object} hangingOrder 挂单信息对象
 * @returns {Promise}
 */
export const createHangingOrder = async (hangingOrder) => {
  try {
    // 添加挂单
    const result = await db.insert('hanging_orders', {
      order_number: hangingOrder.order_number,
      customer_id: hangingOrder.customer_id || null,
      customer_name: hangingOrder.customer_name || null,
      cart_data: hangingOrder.cart_data, // JSON字符串
      total_amount: hangingOrder.total_amount,
      tax_amount: hangingOrder.tax_amount,
      discount_amount: hangingOrder.discount_amount || 0,
      final_amount: hangingOrder.final_amount,
      note: hangingOrder.note || null,
      operator: hangingOrder.operator || null
    });
    
    return { 
      status: 'success', 
      message: '挂单创建成功', 
      data: result 
    };
  } catch (error) {
    console.error('创建挂单失败', error);
    return { 
      status: 'error', 
      message: '创建挂单失败', 
      error 
    };
  }
};

/**
 * 获取所有挂单列表
 * @param {Object} options 查询选项
 * @returns {Promise}
 */
export const getAllHangingOrders = async (options = {}) => {
  try {
    const defaultOptions = {
      orderBy: 'created_at DESC',
      limit: 100
    };
    
    const queryOptions = { ...defaultOptions, ...options };
    const result = await db.query('hanging_orders', queryOptions);
    
    return { 
      status: 'success', 
      data: result.data 
    };
  } catch (error) {
    console.error('获取挂单列表失败', error);
    return { 
      status: 'error', 
      message: '获取挂单列表失败', 
      error 
    };
  }
};

/**
 * 通过ID获取挂单
 * @param {Number} id 挂单ID
 * @returns {Promise}
 */
export const getHangingOrderById = async (id) => {
  try {
    const result = await db.query('hanging_orders', {
      where: { id }
    });
    
    if (result.data && result.data.length > 0) {
      return { 
        status: 'success', 
        data: result.data[0] 
      };
    }
    
    return { 
      status: 'error', 
      message: '挂单不存在' 
    };
  } catch (error) {
    console.error('获取挂单失败', error);
    return { 
      status: 'error', 
      message: '获取挂单失败', 
      error 
    };
  }
};

/**
 * 通过订单号获取挂单
 * @param {String} order_number 订单号
 * @returns {Promise}
 */
export const getHangingOrderByNumber = async (order_number) => {
  try {
    const result = await db.query('hanging_orders', {
      where: { order_number }
    });
    
    if (result.data && result.data.length > 0) {
      return { 
        status: 'success', 
        data: result.data[0] 
      };
    }
    
    return { 
      status: 'error', 
      message: '挂单不存在' 
    };
  } catch (error) {
    console.error('获取挂单失败', error);
    return { 
      status: 'error', 
      message: '获取挂单失败', 
      error 
    };
  }
};

/**
 * 更新挂单信息
 * @param {Number} id 挂单ID
 * @param {Object} updateData 更新的数据
 * @returns {Promise}
 */
export const updateHangingOrder = async (id, updateData) => {
  try {
    // 更新时间
    updateData.updated_at = db.escapeSql("datetime('now','localtime')");
    
    const result = await db.update('hanging_orders', updateData, { id });
    
    return { 
      status: 'success', 
      message: '挂单更新成功', 
      data: result 
    };
  } catch (error) {
    console.error('更新挂单失败', error);
    return { 
      status: 'error', 
      message: '更新挂单失败', 
      error 
    };
  }
};

/**
 * 删除挂单
 * @param {Number} id 挂单ID
 * @returns {Promise}
 */
export const deleteHangingOrder = async (id) => {
  try {
    const result = await db.delete('hanging_orders', { id });
    
    return { 
      status: 'success', 
      message: '挂单删除成功', 
      data: result 
    };
  } catch (error) {
    console.error('删除挂单失败', error);
    return { 
      status: 'error', 
      message: '删除挂单失败', 
      error 
    };
  }
};

/**
 * 删除所有挂单
 * @returns {Promise}
 */
export const deleteAllHangingOrders = async () => {
  try {
    const result = await db.delete('hanging_orders', {});
    
    return { 
      status: 'success', 
      message: '所有挂单已清空', 
      data: result 
    };
  } catch (error) {
    console.error('清空挂单失败', error);
    return { 
      status: 'error', 
      message: '清空挂单失败', 
      error 
    };
  }
};
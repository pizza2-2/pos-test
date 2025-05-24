/**
 * 客户相关的数据库操作
 */
import db from './index.js';

/**
 * 添加客户
 * @param {Object} customer 客户信息对象
 * @returns {Promise}
 */
export const addCustomer = async (customer) => {
  try {
    // 添加客户
    const result = await db.insert('customers', {
      name: customer.name,
      address: customer.address || null,
      postal_code: customer.postal_code || null,
      city: customer.city || null,
      nip: customer.nip || null,
      phone: customer.phone || null,
      email: customer.email || null,
      notes: customer.notes || null
    });
    
    return { 
      status: 'success', 
      message: '客户添加成功', 
      data: result 
    };
  } catch (error) {
    console.error('添加客户失败', error);
    return { 
      status: 'error', 
      message: '添加客户失败', 
      error 
    };
  }
};

/**
 * 通过ID获取客户
 * @param {Number} id 客户ID
 * @returns {Promise}
 */
export const getCustomerById = async (id) => {
  try {
    const result = await db.query('customers', {
      where: { id }
    });
    
    if (result.data && result.data.length > 0) {
      return result.data[0];
    }
    return null;
  } catch (error) {
    console.error('查询客户失败', error);
    return null;
  }
};

/**
 * 搜索客户
 * @param {String} keyword 搜索关键词
 * @returns {Promise}
 */
export const searchCustomers = async (keyword) => {
  if (!keyword) {
    return getAllCustomers();
  }

  try {
    // SQLite不支持复杂的LIKE语句组合，我们需要使用原始SQL
    const searchSql = `
      SELECT * FROM customers 
      WHERE name LIKE '%${keyword}%' 
         OR address LIKE '%${keyword}%' 
         OR city LIKE '%${keyword}%' 
         OR nip LIKE '%${keyword}%' 
         OR postal_code LIKE '%${keyword}%'
      ORDER BY id DESC
    `;
    
    const result = await db.selectSql(searchSql);
    
    return { 
      status: 'success', 
      message: '搜索客户成功', 
      data: result.data 
    };
  } catch (error) {
    console.error('搜索客户失败', error);
    return { 
      status: 'error', 
      message: '搜索客户失败', 
      error 
    };
  }
};

/**
 * 获取所有客户
 * @param {Object} options 查询选项
 * @returns {Promise}
 */
export const getAllCustomers = async (options = {}) => {
  try {
    const defaultOptions = {
      orderBy: 'id DESC',
      limit: 100
    };
    
    const queryOptions = { ...defaultOptions, ...options };
    const result = await db.query('customers', queryOptions);
    
    return { 
      status: 'success', 
      data: result.data 
    };
  } catch (error) {
    console.error('获取客户列表失败', error);
    return { 
      status: 'error', 
      message: '获取客户列表失败', 
      error 
    };
  }
};

/**
 * 分页获取客户
 * @param {Number} page 页码
 * @param {Number} pageSize 每页条数
 * @param {Object} options 其他查询选项
 * @returns {Promise}
 */
export const getCustomersByPage = async (page = 1, pageSize = 20, options = {}) => {
  try {
    const result = await db.paginate('customers', page, pageSize, {
      orderBy: options.orderBy || 'id DESC',
      where: options.where || {}
    });
    
    return result;
  } catch (error) {
    console.error('分页获取客户失败', error);
    return { 
      status: 'error', 
      message: '分页获取客户失败', 
      error 
    };
  }
};

/**
 * 更新客户信息
 * @param {Number} id 客户ID
 * @param {Object} updateData 更新的数据
 * @returns {Promise}
 */
export const updateCustomer = async (id, updateData) => {
  try {
    // 更新时间
    updateData.updated_at = db.escapeSql("datetime('now','localtime')");
    
    const result = await db.update('customers', updateData, { id });
    
    return { 
      status: 'success', 
      message: '客户更新成功', 
      data: result 
    };
  } catch (error) {
    console.error('更新客户失败', error);
    return { 
      status: 'error', 
      message: '更新客户失败', 
      error 
    };
  }
};

/**
 * 删除客户
 * @param {Number} id 客户ID
 * @returns {Promise}
 */
export const deleteCustomer = async (id) => {
  try {
    const result = await db.delete('customers', { id });
    
    return { 
      status: 'success', 
      message: '客户删除成功', 
      data: result 
    };
  } catch (error) {
    console.error('删除客户失败', error);
    return { 
      status: 'error', 
      message: '删除客户失败', 
      error 
    };
  }
};

/**
 * 批量导入客户
 * @param {Array} customers 客户数组
 * @returns {Promise}
 */
export const importCustomers = async (customers) => {
  if (!Array.isArray(customers) || customers.length === 0) {
    return { status: 'error', message: '无效的客户数据' };
  }
  
  try {
    // 开始事务
    return await db.transaction(async (tx) => {
      const results = [];
      
      for (const customer of customers) {
        // 添加客户
        const addResult = await addCustomer(customer);
        results.push({ 
          name: customer.name, 
          action: 'added', 
          success: addResult.status === 'success' 
        });
      }
      
      return { 
        status: 'success', 
        message: '客户导入成功', 
        data: results 
      };
    });
  } catch (error) {
    console.error('批量导入客户失败', error);
    return { 
      status: 'error', 
      message: '批量导入客户失败', 
      error 
    };
  }
};
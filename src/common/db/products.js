/**
 * 商品相关的数据库操作
 */
import db from './index.js';

/**
 * 添加商品
 * @param {Object} product 商品信息对象
 * @returns {Promise}
 */
export const addProduct = async (product) => {
  try {
    // 确保条形码唯一
    const existingProduct = await getProductByBarcode(product.barcode);
    if (existingProduct && existingProduct.length > 0) {
      return { status: 'error', message: '条形码已存在' };
    }
	
	// 添加商品
	const result = await db.insert('products', {
	  barcode: product.barcode,
	  nameCN: product.nameCN || null, // 中文名称可为空
	  nameEN: product.nameEN, // 英文名称必填
	  price: product.price,
	  discount_price: product.discount_price || null,
	  tax_rate: product.tax_rate || 0,
	  category: product.category || null,
	  stock: product.stock || 0
	});
    
    return { status: 'success', message: '商品添加成功', data: result };
  } catch (error) {
    console.error('添加商品失败', error);
    return { status: 'error', message: '添加商品失败', error };
  }
};

/**
 * 通过条形码获取商品
 * @param {String} barcode 商品条形码
 * @returns {Promise}
 */
export const getProductByBarcode = async (barcode) => {
  try {
    // 检查数据库是否打开
    if (!db.isOpen()) {
      console.error('查询商品失败：数据库未打开');
      return null;
    }
    
    const result = await db.query('products', {
      where: { barcode }
    });
    
    if (result.data && result.data.length > 0) {
      return result.data[0];
    }
    return null;
  } catch (error) {
    console.error('查询商品失败', error);
    return null;
  }
};

/**
 * 获取所有商品
 * @param {Object} options 查询选项
 * @returns {Promise}
 */
export const getAllProducts = async (options = {}) => {
  try {
    // 检查数据库是否打开
    if (!db.isOpen()) {
      return { 
        status: 'error', 
        message: '数据库未打开',
        error: new Error('数据库未打开')
      };
    }
    
    const defaultOptions = {
      orderBy: 'id DESC',
      limit: 100
    };
    
    const queryOptions = { ...defaultOptions, ...options };
    const result = await db.query('products', queryOptions);
    
    return { status: 'success', data: result.data };
  } catch (error) {
    console.error('获取商品列表失败', error);
    return { status: 'error', message: '获取商品列表失败', error };
  }
};

/**
 * 分页获取商品
 * @param {Number} page 页码
 * @param {Number} pageSize 每页条数
 * @param {Object} options 其他查询选项
 * @returns {Promise}
 */
export const getProductsByPage = async (page = 1, pageSize = 20, options = {}) => {
  try {
    // 检查数据库是否打开
    if (!db.isOpen()) {
      return { 
        status: 'error', 
        message: '数据库未打开',
        error: new Error('数据库未打开')
      };
    }
    
    const result = await db.paginate('products', page, pageSize, {
      orderBy: options.orderBy || 'id DESC',
      where: options.where || {}
    });
    
    return result;
  } catch (error) {
    console.error('分页获取商品失败', error);
    return { status: 'error', message: '分页获取商品失败', error };
  }
};

/**
 * 搜索商品
 * @param {String} keyword 搜索关键词
 * @returns {Promise}
 */
export const searchProducts = async (keyword) => {
  try {
    // 检查数据库是否打开
    if (!db.isOpen()) {
      return { 
        status: 'error', 
        message: '数据库未打开',
        error: new Error('数据库未打开')
      };
    }
    
    // 如果没有关键词，返回所有商品
    if (!keyword) {
      return await getAllProducts();
    }
    
    // 使用安全的SQL构建方式
    const escapedKeyword = `%${keyword.replace(/'/g, "''")}%`;
    
    // 构建查询SQL
    const searchSql = `
      SELECT * FROM products 
      WHERE nameEN LIKE '${escapedKeyword}' 
         OR barcode LIKE '${escapedKeyword}' 
         OR category LIKE '${escapedKeyword}'
      ORDER BY id DESC
      LIMIT 100
    `;
    
    const result = await db.selectSql(searchSql);
    
    return {
      status: 'success',
      message: '搜索商品成功',
      data: result.data
    };
  } catch (error) {
    console.error('搜索商品失败', error);
    return { 
      status: 'error', 
      message: '搜索商品失败', 
      error 
    };
  }
};

/**
 * 更新商品信息
 * @param {String} barcode 商品条形码
 * @param {Object} updateData 更新的数据
 * @returns {Promise}
 */
export const updateProduct = async (barcode, updateData) => {
  try {
    // 更新时间
    updateData.updated_at = db.escapeSql("datetime('now','localtime')");
    
    const result = await db.update('products', updateData, { barcode });
    
    return { status: 'success', message: '商品更新成功', data: result };
  } catch (error) {
    console.error('更新商品失败', error);
    return { status: 'error', message: '更新商品失败', error };
  }
};

/**
 * 删除商品
 * @param {String} barcode 商品条形码
 * @returns {Promise}
 */
export const deleteProduct = async (barcode) => {
  try {
    const result = await db.delete('products', { barcode });
    
    return { status: 'success', message: '商品删除成功', data: result };
  } catch (error) {
    console.error('删除商品失败', error);
    return { status: 'error', message: '删除商品失败', error };
  }
};

/**
 * 更新商品库存
 * @param {String} barcode 商品条形码
 * @param {Number} quantityChange 库存变化数量 (正数增加，负数减少)
 * @returns {Promise}
 */
export const updateProductStock = async (barcode, quantityChange) => {
  try {
    // 获取当前商品
    const product = await getProductByBarcode(barcode);
    if (!product) {
      return { status: 'error', message: '商品不存在' };
    }
    
    // 计算新库存
    const newStock = Math.max(0, (product.stock || 0) + quantityChange);
    
    // 更新库存
    const result = await updateProduct(barcode, { stock: newStock });
    
    return { status: 'success', message: '库存更新成功', data: { newStock } };
  } catch (error) {
    console.error('更新库存失败', error);
    return { status: 'error', message: '更新库存失败', error };
  }
};

/**
 * 批量导入商品
 * @param {Array} products 商品数组
 * @returns {Promise}
 */
export const importProducts = async (products) => {
  if (!Array.isArray(products) || products.length === 0) {
    return { status: 'error', message: '无效的商品数据' };
  }
  
  try {
    // 开始事务
    return await db.transaction(async (tx) => {
      const results = [];
      
      for (const product of products) {
        // 检查条形码是否已存在
        const existing = await getProductByBarcode(product.barcode);
        
        if (existing) {
          // 如果存在，则更新
          const updateResult = await updateProduct(product.barcode, {
            nameCN: product.nameCN || null,
            nameEN: product.nameEN,
            price: product.price,
            discount_price: product.discount_price || null,
            tax_rate: product.tax_rate || 0,
            category: product.category || null,
            stock: product.stock || 0
          });
          results.push({ barcode: product.barcode, action: 'updated' });
        } else {
          // 如果不存在，则添加
          const addResult = await addProduct(product);
          results.push({ barcode: product.barcode, action: 'added' });
        }
      }
      
      return { status: 'success', message: '商品导入成功', data: results };
    });
  } catch (error) {
    console.error('批量导入商品失败', error);
    return { status: 'error', message: '批量导入商品失败', error };
  }
};


/**
 * 删除所有商品数据
 * @returns {Promise}
 */
export const deleteAllProducts = async () => {
  try {
    // 使用delete方法而不是execute
    const result = await db.delete('products', {});
    
    return { status: 'success', message: '所有商品数据已清空', data: result };
  } catch (error) {
    console.error('清空商品数据失败', error);
    return { status: 'error', message: '清空商品数据失败', error };
  }
};
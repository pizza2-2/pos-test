// common/services/orderNumberService.js
import { globalDBManager } from '../db/globalDBManager.js';
import db from '../db/index.js';

// 订单类型常量
export const ORDER_TYPES = {
  SALE: 'S',      // 销售订单
  RETURN: 'R',    // 退货订单
  HANGING: 'H'    // 挂单
};

// 订单号服务
export const orderNumberService = {
  /**
   * 生成统一订单号
   * @param {String} type 订单类型，使用ORDER_TYPES中的值
   * @param {Object} options 附加选项
   * @returns {Promise<String>} 生成的订单号
   */
  async generateOrderNumber(type, options = {}) {
    // 确保数据库已初始化
    if (!globalDBManager.isInitialized()) {
      await globalDBManager.ensureInitialized();
    }
    
    // 获取当前日期和时间信息
    const now = new Date();
    const year = now.getFullYear().toString().substr(-2);
    const month = ('0' + (now.getMonth() + 1)).slice(-2);
    const day = ('0' + now.getDate()).slice(-2);
    const hours = ('0' + now.getHours()).slice(-2);
    const minutes = ('0' + now.getMinutes()).slice(-2);
    const seconds = ('0' + now.getSeconds()).slice(-2);
    
    // 生成日期部分
    const datePart = `${year}${month}${day}`;
    
    // 获取今日计数
    const todayPrefix = type + datePart;
    let sequenceNumber = await this.getNextSequenceNumber(type, datePart);
    
    // 格式化序列号为5位数
    const sequencePart = sequenceNumber.toString().padStart(5, '0');
    
    // 组合订单号: 类型 + 日期 + 序列号
    // 例如: S2304051234 表示 2023年4月5日的第1234个销售订单
    const orderNumber = `${type}${datePart}${sequencePart}`;
    
    return orderNumber;
  },
  
  /**
   * 获取指定类型和日期的下一个序列号
   * @param {String} type 订单类型
   * @param {String} datePart 日期部分
   * @returns {Promise<Number>} 序列号
   */
  async getNextSequenceNumber(type, datePart) {
    try {
      // 检查序列号表是否存在，不存在则创建
      await this.ensureSequenceTable();
      
      // 查询当前序列号
      const key = `${type}_${datePart}`;
      const result = await db.selectSql(`
        SELECT current_value FROM order_sequences
        WHERE sequence_key = '${key}'
      `);
      
      if (result.data.length === 0) {
        // 没有记录，插入新记录并返回1
        await db.executeSql(`
          INSERT INTO order_sequences (sequence_key, current_value)
          VALUES ('${key}', 1)
        `);
        return 1;
      } else {
        // 有记录，递增并返回新值
        const currentValue = result.data[0].current_value;
        const newValue = currentValue + 1;
        
        await db.executeSql(`
          UPDATE order_sequences
          SET current_value = ${newValue}
          WHERE sequence_key = '${key}'
        `);
        
        return newValue;
      }
    } catch (error) {
      console.error('获取序列号失败:', error);
      
      // 发生错误时，使用时间戳作为备用方案
      const timestamp = Date.now() % 100000; // 取最后5位数字
      return timestamp;
    }
  },
  
  /**
   * 确保序列号表存在
   */
  async ensureSequenceTable() {
    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS order_sequences (
        sequence_key TEXT PRIMARY KEY,
        current_value INTEGER NOT NULL,
        created_at TEXT DEFAULT (datetime('now','localtime')),
        updated_at TEXT DEFAULT (datetime('now','localtime'))
      )
    `);
  },
  
  /**
   * 解析订单号
   * @param {String} orderNumber 订单号
   * @returns {Object} 解析结果
   */
  parseOrderNumber(orderNumber) {
    if (!orderNumber || orderNumber.length < 8) {
      return null;
    }
    
    const type = orderNumber.substr(0, 1);
    const year = '20' + orderNumber.substr(1, 2);
    const month = orderNumber.substr(3, 2);
    const day = orderNumber.substr(5, 2);
    const sequence = parseInt(orderNumber.substr(7), 10);
    
    let typeName = '未知';
    switch (type) {
      case ORDER_TYPES.SALE:
        typeName = '销售订单';
        break;
      case ORDER_TYPES.RETURN:
        typeName = '退货订单';
        break;
      case ORDER_TYPES.HANGING:
        typeName = '挂单';
        break;
    }
    
    return {
      type,
      typeName,
      date: `${year}-${month}-${day}`,
      sequence,
      orderNumber
    };
  }
};
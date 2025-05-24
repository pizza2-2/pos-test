// common/db/transaction.js
import db from './index.js';
import { globalDBManager } from './globalDBManager.js';

// 增强的事务管理
export async function withTransaction(callback, options = {}) {
  const { retryCount = 3, timeout = 10000 } = options;
  
  if (!globalDBManager.isInitialized()) {
    await globalDBManager.ensureInitialized();
  }
  
  // 使用操作队列确保事务顺序
  return globalDBManager.enqueueOperation(async () => {
    let attempt = 0;
    
    while (attempt < retryCount) {
      try {
        await db.executeSql('BEGIN TRANSACTION');
        
        // 设置超时保护
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('事务执行超时')), timeout);
        });
        
        // 执行事务回调
        const resultPromise = callback(db);
        
        // 等待执行结果或超时
        const result = await Promise.race([resultPromise, timeoutPromise]);
        
        // 提交事务
        await db.executeSql('COMMIT');
        return result;
      } catch (error) {
        attempt++;
        console.error(`事务执行失败 (尝试 ${attempt}/${retryCount}):`, error);
        
        // 回滚事务
        try {
          await db.executeSql('ROLLBACK');
        } catch (rollbackError) {
          console.error('事务回滚失败:', rollbackError);
        }
        
        // 如果已达到最大重试次数，则抛出错误
        if (attempt >= retryCount) {
          throw error;
        }
        
        // 否则等待一段时间后重试
        await new Promise(resolve => setTimeout(resolve, 500 * attempt));
      }
    }
  });
}

// 带日志的事务执行
export async function withLoggingTransaction(callback, description, options = {}) {
  console.log(`开始事务: ${description}`);
  const startTime = Date.now();
  
  try {
    const result = await withTransaction(callback, options);
    const duration = Date.now() - startTime;
    console.log(`事务成功: ${description} (耗时: ${duration}ms)`);
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`事务失败: ${description} (耗时: ${duration}ms)`, error);
    throw error;
  }
}
// common/db/globalDBManager.js
import { initDatabase, closeDatabase } from './index.js';
import db from '../sqlite.js';

// 单例模式
let isInitialized = false;
let initializationPromise = null;
let pendingOperations = [];
let isProcessingQueue = false;

export const globalDBManager = {
  // 确保数据库只初始化一次
  ensureInitialized() {
    if (isInitialized) {
      return Promise.resolve(true);
    }
    
    if (initializationPromise) {
      return initializationPromise;
    }
    
    console.log("开始全局初始化数据库...");
    initializationPromise = initDatabase().then(result => {
      isInitialized = result;
      console.log("全局数据库初始化结果:", result ? "成功" : "失败");
      return result;
    }).catch(error => {
      console.error("全局数据库初始化错误:", error);
      return false;
    });
    
    return initializationPromise;
  },
  
  // 统一的初始化方法，供页面组件调用
  async initForPage(context, successCallback) {
    try {
      const result = await this.ensureInitialized();
      if (result) {
        // 设置页面的数据库初始化状态
        if (context) {
          context.dbInitialized = true;
        }
        
        // 如果提供了成功回调，则调用它
        if (typeof successCallback === 'function') {
          successCallback();
        }
        
        return true;
      } else {
        // 显示错误提示
        uni.showToast({
          icon: 'error',
          title: '数据库初始化失败'
        });
        return false;
      }
    } catch (error) {
      console.error('初始化数据库出错:', error);
      uni.showToast({
        icon: 'error',
        title: '数据库初始化出错'
      });
      return false;
    }
  },
  
  // 添加操作队列功能
  enqueueOperation(operation) {
    return new Promise((resolve, reject) => {
      pendingOperations.push({
        operation,
        resolve,
        reject
      });
      
      this.processQueue();
    });
  },
  
  // 处理队列中的操作
  async processQueue() {
    if (isProcessingQueue || pendingOperations.length === 0) {
      return;
    }
    
    isProcessingQueue = true;
    
    try {
      // 确保数据库已初始化
      await this.ensureInitialized();
      
      while (pendingOperations.length > 0) {
        const { operation, resolve, reject } = pendingOperations.shift();
        
        try {
          const result = await operation();
          resolve(result);
        } catch (error) {
          console.error('数据库操作失败:', error);
          reject(error);
        }
      }
    } catch (error) {
      console.error('处理数据库队列出错:', error);
      
      // 将所有待处理操作标记为失败
      while (pendingOperations.length > 0) {
        const { reject } = pendingOperations.shift();
        reject(new Error('数据库队列处理失败'));
      }
    } finally {
      isProcessingQueue = false;
    }
  },
  
  // 检查数据库完整性
  async checkDatabaseIntegrity() {
    if (!isInitialized) {
      await this.ensureInitialized();
    }
    
    return this.enqueueOperation(async () => {
      try {
        const result = await db.selectSql('PRAGMA integrity_check');
        return result.data[0].integrity_check === 'ok';
      } catch (error) {
        console.error('数据库完整性检查失败:', error);
        return false;
      }
    });
  },
  
  // 备份数据库
  async backupDatabase(backupPath) {
    if (!isInitialized) {
      await this.ensureInitialized();
    }
    
    return this.enqueueOperation(async () => {
      try {
        // 关闭当前数据库连接
        await closeDatabase();
        isInitialized = false;
        
        // 复制数据库文件
        const originPath = db.dbPath;
        const result = await uni.copyFile({
          srcPath: originPath,
          destPath: backupPath
        });
        
        // 重新打开数据库
        await this.ensureInitialized();
        
        return { status: 'success', message: '数据库备份成功' };
      } catch (error) {
        console.error('数据库备份失败:', error);
        
        // 重新打开数据库
        await this.ensureInitialized();
        
        return { status: 'error', message: '数据库备份失败', error };
      }
    });
  },
  
  // 恢复数据库
  async restoreDatabase(backupPath) {
    return this.enqueueOperation(async () => {
      try {
        // 关闭当前数据库连接
        await closeDatabase();
        isInitialized = false;
        
        // 复制备份文件到数据库路径
        const destPath = db.dbPath;
        const result = await uni.copyFile({
          srcPath: backupPath,
          destPath: destPath
        });
        
        // 重新打开数据库
        await this.ensureInitialized();
        
        return { status: 'success', message: '数据库恢复成功' };
      } catch (error) {
        console.error('数据库恢复失败:', error);
        
        // 重新打开数据库
        await this.ensureInitialized();
        
        return { status: 'error', message: '数据库恢复失败', error };
      }
    });
  },
  
  // 只在应用退出时关闭
  closeDatabase() {
    if (isInitialized) {
      return closeDatabase().then(() => {
        isInitialized = false;
        initializationPromise = null;
        return true;
      }).catch(error => {
        console.error("关闭数据库出错:", error);
        return false;
      });
    }
    return Promise.resolve(true);
  },
  
  // 检查是否已初始化
  isInitialized() {
    return isInitialized;
  }
};
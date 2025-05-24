// common/db/version.js
import db from './index.js';

// 定义当前数据库架构版本
const DB_SCHEMA_VERSION = '1.1.0';

// 升级函数映射
const upgradeFunctions = {
  // 从无版本到 1.0.0
  'initial_to_1.0.0': async () => {
    // 初始化版本不需要进行特殊操作
    console.log('初始化数据库到版本 1.0.0');
    return true;
  },
  
  // 从 1.0.0 到 1.1.0
  '1.0.0_to_1.1.0': async () => {
    console.log('升级数据库从 1.0.0 到 1.1.0');
    
    try {
      // 添加版本控制表（如果不存在）
      await db.executeSql(`
        CREATE TABLE IF NOT EXISTS db_version (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          version TEXT NOT NULL,
          updated_at TEXT DEFAULT (datetime('now','localtime'))
        )
      `);
      
      // 修改 orders 表，添加统一订单号字段
      await db.executeSql(`
        ALTER TABLE orders ADD COLUMN unified_order_no TEXT;
      `);
      
      // 修改 hanging_orders 表，添加统一订单号字段
      await db.executeSql(`
        ALTER TABLE hanging_orders ADD COLUMN unified_order_no TEXT;
      `);
      
      // 创建订单号索引
      await db.executeSql(`
        CREATE INDEX IF NOT EXISTS idx_orders_unified_order_no ON orders(unified_order_no);
        CREATE INDEX IF NOT EXISTS idx_hanging_orders_unified_order_no ON hanging_orders(unified_order_no);
      `);
      
      return true;
    } catch (error) {
      console.error('升级失败:', error);
      return false;
    }
  }
};

// 确定升级路径
function determineUpgradePath(currentVersion, targetVersion) {
  if (!currentVersion) {
    return ['initial_to_1.0.0', '1.0.0_to_1.1.0'];
  }
  
  const versions = ['1.0.0', '1.1.0'];
  const currentIndex = versions.indexOf(currentVersion);
  const targetIndex = versions.indexOf(targetVersion);
  
  if (currentIndex === -1 || targetIndex === -1) {
    throw new Error(`无效的版本: 当前=${currentVersion}, 目标=${targetVersion}`);
  }
  
  if (currentIndex >= targetIndex) {
    return []; // 不需要升级
  }
  
  // 构建升级路径
  const upgradePath = [];
  for (let i = currentIndex; i < targetIndex; i++) {
    upgradePath.push(`${versions[i]}_to_${versions[i+1]}`);
  }
  
  return upgradePath;
}

// 获取当前数据库版本
export async function getCurrentSchemaVersion() {
  try {
    // 检查版本表是否存在
    const tableCheck = await db.selectSql(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='db_version'
    `);
    
    if (tableCheck.data.length === 0) {
      return null; // 表不存在，说明是新数据库
    }
    
    // 获取最新版本记录
    const versionResult = await db.selectSql(`
      SELECT version FROM db_version 
      ORDER BY id DESC LIMIT 1
    `);
    
    if (versionResult.data.length === 0) {
      return null; // 表存在但没有版本记录
    }
    
    return versionResult.data[0].version;
  } catch (error) {
    console.error('获取数据库版本失败:', error);
    return null;
  }
}

// 保存新版本
async function saveSchemaVersion(version) {
  try {
    await db.executeSql(`
      INSERT INTO db_version (version) VALUES ('${version}')
    `);
    return true;
  } catch (error) {
    console.error('保存数据库版本失败:', error);
    return false;
  }
}

// 检查并升级数据库架构
export async function checkAndUpgradeSchema() {
  try {
    const currentVersion = await getCurrentSchemaVersion();
    console.log(`当前数据库版本: ${currentVersion || '无'}, 目标版本: ${DB_SCHEMA_VERSION}`);
    
    if (currentVersion === DB_SCHEMA_VERSION) {
      return true; // 已是最新版本
    }
    
    // 确定升级路径
    const upgradePath = determineUpgradePath(currentVersion, DB_SCHEMA_VERSION);
    
    if (upgradePath.length === 0) {
      console.log('不需要升级数据库');
      return true;
    }
    
    console.log(`升级路径: ${upgradePath.join(' -> ')}`);
    
    // 执行升级
    for (const upgradeKey of upgradePath) {
      const upgradeFunc = upgradeFunctions[upgradeKey];
      
      if (!upgradeFunc) {
        throw new Error(`找不到升级函数: ${upgradeKey}`);
      }
      
      const success = await upgradeFunc();
      
      if (!success) {
        throw new Error(`升级失败: ${upgradeKey}`);
      }
      
      // 获取此升级步骤的目标版本
      const targetVersion = upgradeKey.split('_to_')[1];
      await saveSchemaVersion(targetVersion);
      
      console.log(`成功升级到版本: ${targetVersion}`);
    }
    
    return true;
  } catch (error) {
    console.error('数据库升级失败:', error);
    return false;
  }
}
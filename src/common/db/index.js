/**
 * 数据库初始化和管理
 */
import db from '../sqlite.js';

// 定义数据库名称和路径
const DB_NAME = 'posSystem';
const DB_PATH = '_downloads/posSystem.db';

// 商品表结构
const CREATE_PRODUCTS_TABLE = `
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  barcode TEXT NOT NULL UNIQUE,
  nameCN TEXT,
  nameEN TEXT NOT NULL,
  price REAL NOT NULL,
  discount_price REAL,
  tax_rate REAL DEFAULT 0,
  category TEXT,
  stock INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now','localtime')),
  updated_at TEXT DEFAULT (datetime('now','localtime'))
)
`;

// 客户表结构
const CREATE_CUSTOMERS_TABLE = `
CREATE TABLE IF NOT EXISTS customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  address TEXT,
  postal_code TEXT,
  city TEXT,
  nip TEXT,
  phone TEXT,
  email TEXT,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now','localtime')),
  updated_at TEXT DEFAULT (datetime('now','localtime'))
)
`;

// 订单表结构
const CREATE_ORDERS_TABLE = `
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_no TEXT NOT NULL UNIQUE,
  customer_id INTEGER,
  total_amount REAL NOT NULL,
  discount_amount REAL DEFAULT 0,
  tax_amount REAL DEFAULT 0,
  final_amount REAL NOT NULL,
  status TEXT DEFAULT 'pending',
  payment_status TEXT DEFAULT 'unpaid',
  created_at TEXT DEFAULT (datetime('now','localtime')),
  updated_at TEXT DEFAULT (datetime('now','localtime')),
  FOREIGN KEY (customer_id) REFERENCES customers(id)
)
`;

// 订单明细表结构
const CREATE_ORDER_ITEMS_TABLE = `
CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  barcode TEXT NOT NULL,
  product_name TEXT NOT NULL,
  price REAL NOT NULL,
  discount_price REAL,
  tax_rate REAL DEFAULT 0,
  quantity INTEGER NOT NULL,
  subtotal REAL NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
)
`;

// 支付表结构
const CREATE_PAYMENTS_TABLE = `
CREATE TABLE IF NOT EXISTS payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL,
  payment_method TEXT NOT NULL,
  amount REAL NOT NULL,
  status TEXT DEFAULT 'completed',
  transaction_no TEXT,
  created_at TEXT DEFAULT (datetime('now','localtime')),
  FOREIGN KEY (order_id) REFERENCES orders(id)
)
`;

// 挂单表结构
const CREATE_HANGING_ORDERS_TABLE = `
CREATE TABLE IF NOT EXISTS hanging_orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_number TEXT NOT NULL UNIQUE,
  customer_id INTEGER,
  customer_name TEXT,
  cart_data TEXT NOT NULL,
  total_amount REAL NOT NULL,
  tax_amount REAL DEFAULT 0,
  discount_amount REAL DEFAULT 0,
  final_amount REAL NOT NULL,
  note TEXT,
  operator TEXT,
  created_at TEXT DEFAULT (datetime('now','localtime')),
  updated_at TEXT DEFAULT (datetime('now','localtime'))
)
`;

const CREATE_PRODUCTS_INDEX = `
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
`;

const CREATE_ORDERS_INDEX = `
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
`;
/**
 * 初始化数据库
 * 创建所有必要的表
 */
export const initDatabase = async () => {
  try {
    console.log('开始初始化数据库...');
    
    // 检查数据库是否已经打开
    if (db.isOpen()) {
      console.log('数据库已经打开');
      return true;
    }
    
    // 设置数据库名称和路径
    db.setDatabase(DB_NAME, DB_PATH);
    
    // 打开数据库
    const openResult = await db.openSqlite();
    if (openResult.status !== 'success') {
      console.error('数据库打开失败', openResult.error);
      return false;
    }
    console.log('数据库连接成功');
    
    // 创建表
    await db.executeSql(CREATE_PRODUCTS_TABLE);
    await db.executeSql(CREATE_CUSTOMERS_TABLE);
    await db.executeSql(CREATE_ORDERS_TABLE);
    await db.executeSql(CREATE_ORDER_ITEMS_TABLE);
    await db.executeSql(CREATE_PAYMENTS_TABLE);
    await db.executeSql(CREATE_HANGING_ORDERS_TABLE); // 添加挂单表创建
    
    console.log('数据库表创建成功');
	
	// 创建索引
	await db.executeSql(CREATE_PRODUCTS_INDEX);
	await db.executeSql(CREATE_ORDERS_INDEX);
	
    return true;
  } catch (error) {
    console.error('数据库初始化失败', error);
    return false;
  }
};

/**
 * 检查数据库是否已初始化
 */
export const isDbInitialized = () => {
  return db.isOpen();
};

/**
 * 关闭数据库连接
 */
export const closeDatabase = async () => {
  try {
    if (!db.isOpen()) {
      console.log('数据库已经关闭');
      return true;
    }
    
    const result = await db.closeSqlite();
    console.log('数据库已关闭');
    return true;
  } catch (error) {
    console.error('关闭数据库失败', error);
    return false;
  }
};

// 导出数据库实例，便于其他模块直接使用
export default db;
/**
 * UniApp SQLite数据库操作模块
 * 提供了更加健壮、安全和灵活的数据库操作方法
 */
const db = {
  dbName: 'appDatabase', // 数据库名称
  dbPath: '_downloads/appDatabase.db', // 数据库地址,推荐以下划线为开头
  
  /**
   * 设置数据库名称和路径
   * @param {String} name 数据库名称
   * @param {String} path 数据库路径
   */
  setDatabase(name, path) {
    if (name) this.dbName = name;
    if (path) this.dbPath = path;
    return this;
  },
  
  /**
   * 判断数据库是否打开
   * @return {Boolean} 是否已打开
   */
  isOpen() {
    try {
      const open = plus.sqlite.isOpenDatabase({
        name: this.dbName,
        path: this.dbPath
      });
      return open;
    } catch (e) {
      console.error('检查数据库状态出错:', e);
      return false;
    }
  },
 
  /**
   * 创建数据库或打开已存在的数据库
   * @return {Promise}
   */
  openSqlite() {
    return new Promise((resolve, reject) => {
      try {
        // 如果数据库已经打开，则直接返回成功
        if (this.isOpen()) {
          resolve({ status: 'success', message: '数据库已经打开' });
          return;
        }
        
        // 打开数据库
        plus.sqlite.openDatabase({
          name: this.dbName,
          path: this.dbPath,
          success(e) {
            resolve({ status: 'success', message: '数据库打开成功', data: e });
          },
          fail(e) {
            reject({ status: 'error', message: '数据库打开失败', error: e });
          }
        });
      } catch (e) {
        reject({ status: 'error', message: '数据库操作异常', error: e });
      }
    });
  },
 
  /**
   * 关闭数据库
   * @return {Promise}
   */
  closeSqlite() {
    return new Promise((resolve, reject) => {
      try {
        // 如果数据库未打开，则直接返回成功
        if (!this.isOpen()) {
          resolve({ status: 'success', message: '数据库已经关闭' });
          return;
        }
        
        plus.sqlite.closeDatabase({
          name: this.dbName,
          success(e) {
            resolve({ status: 'success', message: '数据库关闭成功', data: e });
          },
          fail(e) {
            reject({ status: 'error', message: '数据库关闭失败', error: e });
          }
        });
      } catch (e) {
        reject({ status: 'error', message: '数据库操作异常', error: e });
      }
    });
  },
  
  /**
   * 执行SQL语句（用于执行非查询操作）
   * @param {String} sql SQL语句
   * @return {Promise}
   */
  executeSql(sql) {
    return new Promise((resolve, reject) => {
      try {
        if (!this.isOpen()) {
          reject({ status: 'error', message: '数据库未打开' });
          return;
        }
        
        plus.sqlite.executeSql({
          name: this.dbName,
          sql: sql,
          success(e) {
            resolve({ status: 'success', message: 'SQL执行成功', data: e });
          },
          fail(e) {
            reject({ status: 'error', message: 'SQL执行失败', error: e, sql: sql });
          }
        });
      } catch (e) {
        reject({ status: 'error', message: 'SQL执行异常', error: e, sql: sql });
      }
    });
  },
  
  /**
   * 执行查询SQL语句
   * @param {String} sql SQL查询语句
   * @return {Promise}
   */
  selectSql(sql) {
    return new Promise((resolve, reject) => {
      try {
        if (!this.isOpen()) {
          reject({ status: 'error', message: '数据库未打开' });
          return;
        }
        
        plus.sqlite.selectSql({
          name: this.dbName,
          sql: sql,
          success(e) {
            resolve({ status: 'success', message: '查询成功', data: e });
          },
          fail(e) {
            reject({ status: 'error', message: '查询失败', error: e, sql: sql });
          }
        });
      } catch (e) {
        reject({ status: 'error', message: '查询异常', error: e, sql: sql });
      }
    });
  },
 
  /**
   * 转义SQL参数，防止SQL注入
   * @param {String} value 需要转义的字符串
   * @return {String} 转义后的字符串
   */
  escapeSql(value) {
    if (value === null || value === undefined) {
      return 'NULL';
    }
    
    if (typeof value === 'boolean') {
      return value ? '1' : '0';
    }
    
    if (typeof value === 'number') {
      return value.toString();
    }
    
    // 字符串类型，进行转义
    return "'" + String(value).replace(/'/g, "''") + "'";
  },
  
  /**
   * 构建安全的WHERE条件
   * @param {Object} conditions 条件对象，格式为 {column1: value1, column2: value2}
   * @return {String} 构建好的WHERE条件语句
   */
  buildWhereClause(conditions) {
    if (!conditions || Object.keys(conditions).length === 0) {
      return '';
    }
    
    const whereConditions = Object.keys(conditions).map(key => {
      const value = conditions[key];
      if (value === null) {
        return `${key} IS NULL`;
      } else {
        return `${key} = ${this.escapeSql(value)}`;
      }
    });
    
    return 'WHERE ' + whereConditions.join(' AND ');
  },
 
  /**
   * 数据库建表
   * @param {String} tableName 表名
   * @param {String} columns 列定义字符串，例如："id INTEGER PRIMARY KEY, name TEXT NOT NULL"
   * @return {Promise}
   */
  createTable(tableName, columns) {
    if (!tableName || !columns) {
      return Promise.reject({ status: 'error', message: '表名和列定义不能为空' });
    }
    
    const sql = `CREATE TABLE IF NOT EXISTS ${tableName}(${columns})`;
    return this.executeSql(sql);
  },
 
  /**
   * 删除表
   * @param {String} tableName 表名
   * @return {Promise}
   */
  dropTable(tableName) {
    if (!tableName) {
      return Promise.reject({ status: 'error', message: '表名不能为空' });
    }
    
    const sql = `DROP TABLE IF EXISTS ${tableName}`;
    return this.executeSql(sql);
  },
  
  /**
   * 检查表是否存在
   * @param {String} tableName 表名
   * @return {Promise<Boolean>}
   */
  tableExists(tableName) {
    const sql = `SELECT name FROM sqlite_master WHERE type='table' AND name='${tableName}'`;
    return this.selectSql(sql).then(result => {
      return result.data && result.data.length > 0;
    });
  },
 
  /**
   * 插入数据
   * @param {String} tableName 表名
   * @param {Object} data 要插入的数据对象，格式为 {column1: value1, column2: value2}
   * @return {Promise}
   */
  insert(tableName, data) {
    if (!tableName || !data || Object.keys(data).length === 0) {
      return Promise.reject({ status: 'error', message: '表名或数据不能为空' });
    }
    
    const columns = Object.keys(data).join(', ');
    const values = Object.values(data).map(v => this.escapeSql(v)).join(', ');
    
    const sql = `INSERT INTO ${tableName} (${columns}) VALUES (${values})`;
    return this.executeSql(sql);
  },
  
  /**
   * 批量插入数据
   * @param {String} tableName 表名
   * @param {Array<Object>} dataArray 数据对象数组
   * @return {Promise}
   */
  batchInsert(tableName, dataArray) {
    if (!tableName || !Array.isArray(dataArray) || dataArray.length === 0) {
      return Promise.reject({ status: 'error', message: '表名或数据数组不能为空' });
    }
    
    // 开始事务
    return this.executeSql('BEGIN TRANSACTION')
      .then(() => {
        const promises = dataArray.map(data => this.insert(tableName, data));
        return Promise.all(promises);
      })
      .then(results => {
        // 提交事务
        return this.executeSql('COMMIT')
          .then(() => ({ status: 'success', message: '批量插入成功', data: results }));
      })
      .catch(error => {
        // 回滚事务
        return this.executeSql('ROLLBACK')
          .then(() => Promise.reject({ status: 'error', message: '批量插入失败', error }));
      });
  },
  
  /**
   * 插入或替换数据（基于主键或唯一约束）
   * @param {String} tableName 表名
   * @param {Object} data 要插入或替换的数据对象
   * @return {Promise}
   */
  insertOrReplace(tableName, data) {
    if (!tableName || !data || Object.keys(data).length === 0) {
      return Promise.reject({ status: 'error', message: '表名或数据不能为空' });
    }
    
    const columns = Object.keys(data).join(', ');
    const values = Object.values(data).map(v => this.escapeSql(v)).join(', ');
    
    const sql = `INSERT OR REPLACE INTO ${tableName} (${columns}) VALUES (${values})`;
    return this.executeSql(sql);
  },
 
  /**
   * 更新数据
   * @param {String} tableName 表名
   * @param {Object} data 要更新的数据对象
   * @param {Object} conditions 条件对象
   * @return {Promise}
   */
  update(tableName, data, conditions) {
    if (!tableName || !data || Object.keys(data).length === 0) {
      return Promise.reject({ status: 'error', message: '表名或更新数据不能为空' });
    }
    
    const setClause = Object.keys(data).map(key => {
      return `${key} = ${this.escapeSql(data[key])}`;
    }).join(', ');
    
    const whereClause = this.buildWhereClause(conditions);
    
    const sql = `UPDATE ${tableName} SET ${setClause} ${whereClause}`;
    return this.executeSql(sql);
  },
 
  /**
   * 删除数据
   * @param {String} tableName 表名
   * @param {Object} conditions 条件对象，为空则删除所有数据
   * @return {Promise}
   */
  delete(tableName, conditions) {
    if (!tableName) {
      return Promise.reject({ status: 'error', message: '表名不能为空' });
    }
    
    const whereClause = this.buildWhereClause(conditions);
    const sql = `DELETE FROM ${tableName} ${whereClause}`;
    
    return this.executeSql(sql);
  },
 
  /**
   * 查询数据
   * @param {String} tableName 表名
   * @param {Object} options 查询选项
   * @param {Array<String>} options.columns 要查询的列，默认为 ['*']
   * @param {Object} options.where 查询条件
   * @param {String} options.orderBy 排序方式，例如 "id DESC"
   * @param {Number} options.limit 限制返回的行数
   * @param {Number} options.offset 跳过的行数
   * @return {Promise}
   */
  query(tableName, options = {}) {
    if (!tableName) {
      return Promise.reject({ status: 'error', message: '表名不能为空' });
    }
    
    const columns = options.columns && options.columns.length > 0 ? options.columns.join(', ') : '*';
    const whereClause = this.buildWhereClause(options.where);
    let sql = `SELECT ${columns} FROM ${tableName} ${whereClause}`;
    
    if (options.orderBy) {
      sql += ` ORDER BY ${options.orderBy}`;
    }
    
    if (options.limit) {
      sql += ` LIMIT ${parseInt(options.limit)}`;
      
      if (options.offset) {
        sql += ` OFFSET ${parseInt(options.offset)}`;
      }
    }
    
    return this.selectSql(sql);
  },
  
  /**
   * 分页查询
   * @param {String} tableName 表名
   * @param {Number} page 页码，从1开始
   * @param {Number} pageSize 每页记录数
   * @param {Object} options 其他查询选项，同 query 方法
   * @return {Promise}
   */
  paginate(tableName, page = 1, pageSize = 20, options = {}) {
    // 获取总记录数
    const countSql = `SELECT COUNT(*) as total FROM ${tableName} ${this.buildWhereClause(options.where)}`;
    
    return this.selectSql(countSql)
      .then(countResult => {
        const total = countResult.data[0].total;
        
        // 分页参数
        const currentPage = Math.max(1, page);
        const offset = (currentPage - 1) * pageSize;
        
        // 查询分页数据
        return this.query(tableName, {
          ...options,
          limit: pageSize,
          offset: offset
        }).then(dataResult => {
          return {
            status: 'success',
            message: '查询成功',
            data: {
              list: dataResult.data,
              pagination: {
                total: total,
                currentPage: currentPage,
                pageSize: pageSize,
                totalPages: Math.ceil(total / pageSize)
              }
            }
          };
        });
      });
  },
  
  /**
   * 执行事务
   * @param {Function} callback 回调函数，接收一个事务对象作为参数
   * @return {Promise}
   */
  transaction(callback) {
    return this.executeSql('BEGIN TRANSACTION')
      .then(() => {
        // 创建一个事务对象
        const txObj = {
          executeSql: this.executeSql.bind(this),
          selectSql: this.selectSql.bind(this)
        };
        
        // 执行回调
        return callback(txObj);
      })
      .then(result => {
        // 提交事务
        return this.executeSql('COMMIT')
          .then(() => result);
      })
      .catch(error => {
        // 回滚事务
        return this.executeSql('ROLLBACK')
          .then(() => Promise.reject(error));
      });
  },
  
  /**
   * 获取表信息
   * @param {String} tableName 表名
   * @return {Promise}
   */
  getTableInfo(tableName) {
    if (!tableName) {
      return Promise.reject({ status: 'error', message: '表名不能为空' });
    }
    
    const sql = `PRAGMA table_info(${tableName})`;
    return this.selectSql(sql);
  },
  
  /**
   * 执行多条SQL语句
   * @param {Array<String>} sqlArray SQL语句数组
   * @return {Promise}
   */
  executeBatch(sqlArray) {
    if (!Array.isArray(sqlArray) || sqlArray.length === 0) {
      return Promise.reject({ status: 'error', message: 'SQL语句数组不能为空' });
    }
    
    return this.transaction(tx => {
      const promises = sqlArray.map(sql => tx.executeSql(sql));
      return Promise.all(promises);
    });
  }
};

export default db;
// 诊断工具
export const diagnosticTools = {
    // 获取数据库大小
    async getDatabaseSize() {
        try {
            const result = await db.selectSql(`PRAGMA page_count, page_size`);
            if (result.status === 'success' && result.data.length > 0) {
                const pageCount = result.data[0].page_count;
                const pageSize = result.data[0].page_size;
                const sizeInBytes = pageCount * pageSize;
                return {
                    status: 'success',
                    data: {
                        sizeInBytes,
                        sizeInMB: (sizeInBytes / (1024 * 1024)).toFixed(2)
                    }
                };
            }
            return { status: 'error', message: '无法获取数据库大小' };
        } catch (error) {
            return { status: 'error', message: '获取数据库大小失败', error };
        }
    },
    
    // 获取表统计信息
    async getTableStats() {
        try {
            // 获取所有表
            const tablesResult = await db.selectSql(
                `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'`
            );
            
            if (tablesResult.status !== 'success') {
                return { status: 'error', message: '获取表列表失败' };
            }
            
            const stats = [];
            
            for (const table of tablesResult.data) {
                const tableName = table.name;
                
                // 获取表中的行数
                const countResult = await db.selectSql(`SELECT COUNT(*) as count FROM ${tableName}`);
                
                if (countResult.status === 'success') {
                    stats.push({
                        tableName,
                        rowCount: countResult.data[0].count
                    });
                }
            }
            
            return { status: 'success', data: stats };
        } catch (error) {
            return { status: 'error', message: '获取表统计信息失败', error };
        }
    }
};
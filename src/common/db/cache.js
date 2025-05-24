// 在globalDBManager中添加缓存机制
const cache = {
    products: {
        data: null,
        timestamp: 0,
        ttl: 60000 // 1分钟过期
    },
    // 其他实体缓存...
};

// 获取带缓存的商品列表
async function getCachedProducts() {
    const now = Date.now();
    
    // 缓存有效且未过期
    if (cache.products.data && (now - cache.products.timestamp) < cache.products.ttl) {
        return cache.products.data;
    }
    
    // 重新获取数据
    const result = await getAllProducts();
    
    if (result.status === 'success') {
        cache.products.data = result.data;
        cache.products.timestamp = now;
    }
    
    return result.data;
}

// 清除商品缓存（当有更新时）
function invalidateProductsCache() {
    cache.products.data = null;
    cache.products.timestamp = 0;
}
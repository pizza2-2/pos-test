<template>
  <view class="shop-cart">
    <!-- 删除按钮 -->
    <uni-icons class="delete-icon" @click="$emit('remove')" type="clear" size="60rpx"></uni-icons>
    <!-- 商品信息区域 - 图片 -->
    <view class="shop-info">
      <image mode="aspectFill" class="shop-image" :src="item.imageUrl || '/static/default-product.png'" @click="handleToDetail">
      </image>
    </view>
    
    <!-- 商品基本信息区域 -->
    <view class="basic">
      <!-- 商品名称 -->
      <view class="shop-name" @click="handleToDetail">{{ getLocalizedProductName(item) }}</view>
      
      <!-- 附加信息 - 在中文界面显示税率和条形码 -->
      <view class="item-details" v-if="isChineseLocale">
        <text class="item-barcode">{{ item.barcode }}</text>
        <text class="item-tax-rate" v-if="item.tax_rate">TAX: {{(item.tax_rate * 100)}}%</text>
      </view>
      
      <!-- 标签列表 - 如果需要可以添加 -->
      <view class="tag-list" v-if="item.tags && item.tags.length">
        <text v-for="(tag, tagIndex) in item.tags" :key="tagIndex" class="tag-item">{{ tag }}</text>
      </view>
      
      <!-- 底部价格显示 -->
      <view class="basic-footer">
        <!-- 价格显示 -->
        <view class="price-content">
          <!-- 折扣价显示 -->
          <template v-if="hasDiscount">
            <view class="original-price">￥{{ (item.original_price).toFixed(2) }}</view>
            <view class="price-container">
              <view class="unit">￥</view>
              <view class="price">{{ (item.price).toFixed(2) }}</view>
            </view>
          </template>
          
          <!-- 普通价格显示 -->
          <template v-else>
            <view class="price-container">
              <view class="unit">￥</view>
              <view class="price">{{ (item.price).toFixed(2) }}</view>
            </view>
          </template>
        </view>
      </view>
    </view>
    
    <!-- 居中放置的数量控制区域 -->
    <view class="quantity-control-container">
      <view class="cart-num">
        <view class="symbol decrease" @click="$emit('decrease')">-</view>
        <view class="count">{{ item.quantity }}</view>
        <view class="symbol increase" @click="$emit('increase')">+</view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    item: {
      type: Object,
      required: true
    },
    index: {
      type: Number,
      required: true
    }
  },
  computed: {
    // 判断是否有折扣
    hasDiscount() {
      return this.item.original_price && 
             this.item.original_price > this.item.price;
    },
    
    // 是否为中文环境
    isChineseLocale() {
      const locale = uni.getLocale();
      return locale === 'zh-Hans' || locale === 'zh-Hant';
    }
  },
  emits: ['remove', 'increase', 'decrease', 'viewDetail'],
  methods: {
    // 处理查看详情
    handleToDetail() {
      this.$emit('viewDetail', this.item, this.index);
    },
    
    // 获取本地化的产品名称
    getLocalizedProductName(product) {
      const locale = uni.getLocale();
      
      // 新版本处理 - 使用nameCN和nameEN
      if (product.nameCN || product.nameEN) {
        if ((locale === 'zh-Hans' || locale === 'zh-Hant') && product.nameCN) {
          // 中文环境：如果有中文名称，则显示"中文名称 (英文名称)"格式
          return `${product.nameCN} (${product.nameEN})`;
        } else {
          // 其他语言环境：只显示英文名称
          return product.nameEN;
        }
      }
      
      // 兼容旧版本 - 处理可能的name对象或直接的name
      if (typeof product.name === 'object') {
        return product.name[locale] || product.name.en || product.name;
      }
      
      return product.name;
    },
    
    // 格式化货币显示
    formatCurrency(value) {
      // 根据当前语言设置格式化货币
      const locale = uni.getLocale();
      const currencyCode = locale === 'zh-Hans' ? 'CNY' : 'USD';
      const currencySymbol = locale === 'zh-Hans' ? '¥' : '$';
      
      try {
        return new Intl.NumberFormat(locale, {
          style: 'currency',
          currency: currencyCode
        }).format(value);
      } catch (e) {
        // 如果国际化货币格式化失败，使用简单格式化
        return currencySymbol + value.toFixed(2);
      }
    }
  }
}
</script>

<style>
.shop-cart {
  display: flex;
  padding: 20rpx 15rpx; /* 缩小整体padding */
  position: relative;
  /* 主要背景改为黑色 */
  background-color: #1a1a1a;
  border-bottom: 1px solid #333; /* 分隔线改为深灰色 */
  border-radius: 12rpx; /* 添加圆角 */
  margin-bottom: 8rpx; /* 缩小卡片间距 */
}

.delete-icon {
  position: absolute;
  right: 8rpx;
  top: 8rpx;
  z-index: 10;
  color: #999;
  font-size: 35rpx; /* 稍微缩小删除图标 */
}

.shop-info {
  display: flex;
  align-items: center;
  margin-right: 15rpx; /* 缩小右边距 */
  margin-left: 15rpx; /* 添加左边距，让图片不贴边 */
}

.shop-image {
  width: 120rpx; /* 缩小图片尺寸 */
  height: 120rpx; /* 缩小图片尺寸 */
  border-radius: 8rpx;
  background-color: #333; /* 图片背景改为深灰 */
}

.basic {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 120rpx; /* 缩小基本信息区域高度 */
  overflow: hidden;
}

.shop-name {
  font-size: 24rpx; /* 缩小字体 */
  color: #ffffff; /* 商品名称改为白色 */
  max-height: 60rpx; /* 缩小最大高度 */
  line-height: 30rpx; /* 缩小行高 */
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* 附加信息样式调整 */
.item-details {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
  margin-top: 6rpx;
  margin-bottom: 6rpx;
}

.item-barcode, .item-tax-rate {
  font-size: 18rpx; /* 缩小字体 */
  color: #ccc; /* 文字改为浅灰色 */
  background-color: #333; /* 背景改为深灰 */
  padding: 2rpx 6rpx; /* 缩小padding */
  border-radius: 4rpx;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  margin: 10rpx 0;
}

.tag-item {
  font-size: 20rpx;
  color: #4a9eff; /* 标签颜色调亮 */
  background-color: rgba(74, 158, 255, 0.2); /* 标签背景调暗 */
  padding: 4rpx 10rpx;
  border-radius: 4rpx;
  margin-right: 10rpx;
  margin-bottom: 8rpx;
}

.basic-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.price-content {
  display: flex;
  align-items: baseline;
}

.original-price {
  font-size: 24rpx;
  color: #888; /* 原价颜色调暗 */
  text-decoration: line-through;
  margin-right: 10rpx;
}

.price-container {
  display: flex;
  align-items: baseline;
}

.unit {
  font-size: 24rpx;
  color: #ff6b35; /* 价格单位颜色调整 */
}

.price {
  font-size: 28rpx; /* 缩小价格字体 */
  color: #ff6b35; /* 价格颜色调整为橙红色 */
  font-weight: bold;
}

/* 数量控制区域 */
.quantity-control-container {
  position: absolute;
  bottom: 15rpx;
  left: 50%;
  transform: translateX(-50%);
}

.cart-num {
  display: flex;
  align-items: center;
  background-color: #2a2a2a; /* 控制器背景改为深灰 */
  border-radius: 30rpx; /* 缩小圆角 */
  padding: 3rpx; /* 缩小padding */
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.3); /* 阴影加深 */
}

/* 加减按钮样式调整 */
.symbol {
  width: 50rpx; /* 缩小按钮尺寸 */
  height: 50rpx; /* 缩小按钮尺寸 */
  border-radius: 25rpx; /* 对应调整圆角 */
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 28rpx; /* 缩小符号字体 */
  font-weight: bold;
}

.symbol.decrease {
  background-color: #444; /* 减号按钮背景 */
  color: #ccc; /* 减号颜色 */
}

.symbol.increase {
  background-color: #409eff; /* 加号按钮保持蓝色 */
  color: white;
}

.count {
  width: 60rpx; /* 缩小数量显示区域 */
  text-align: center;
  font-size: 26rpx; /* 缩小数字字体 */
  font-weight: bold;
  color: #ffffff; /* 数量文字改为白色 */
}
</style>
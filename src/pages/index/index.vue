<!-- 使用 type="home" 属性设置首页，其他页面不需要设置，默认为page；推荐使用json5，更强大，且允许注释 -->
<route lang="json5" type="home">
{
  style: {
    navigationBarTitleText: '首页',
    navigationStyle: 'custom',
    bounce: 'none',
  },
}
</route>
<template>
  <view class="body">
    <!-- 毛玻璃覆盖层 -->
    <view class="glass-overlay"></view>

    <view class="container">
      <view class="flex-container">
        <!-- 第一列：固定宽度导航栏 -->
        <view class="nav-column">
          <SideNavBar @nav-change="handleNavChange" />
        </view>

        <!-- 第二列：自适应宽度内容区 -->
        <view class="content-column">
          <view class="content-section">
            <!-- 购物车列表容器 -->
            <view class="cart-list-container">
              <!-- 购物车列表 -->
              <scroll-view
                class="cart-scroll"
                scroll-y="true"
                :show-scrollbar="false"
                @scrolltolower="handleScrollToLower"
              >
                <view class="cart-items">
                  <CartItem
                    v-for="(item, index) in cartItems"
                    :key="item.id"
                    :item="item"
                    :index="index"
                    @remove="handleRemove(index)"
                    @increase="handleIncrease(index)"
                    @decrease="handleDecrease(index)"
                    @viewDetail="handleViewDetail"
                  />
                </view>

                <!-- 到底提示 -->
                <view class="scroll-bottom-tip" v-if="cartItems.length > 0">
                  <view class="tip-line"></view>
                  <text class="tip-text">— 到底了 —</text>
                  <view class="tip-line"></view>
                </view>
              </scroll-view>
            </view>
          </view>
        </view>

        <!-- 第三列：固定宽度键盘区 -->
        <view class="keyboard-column">
          <view class="content-section">
            <keyboard />
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import SideNavBar from './components/SideNavBar.vue'
import keyboard from './components/keyboard.vue'
import CartItem from './components/CartItem.vue'

export default {
  components: {
    keyboard,
    SideNavBar,
    CartItem,
  },
  data() {
    return {
      // 购物车商品数据
      cartItems: [],
    }
  },
  computed: {
    // 计算总价
    totalPrice() {
      return this.cartItems.reduce((total, item) => {
        return total + item.price * item.quantity
      }, 0)
    },
  },
  methods: {
    // 处理导航切换
    handleNavChange(data) {
      console.log('导航切换:', data)
    },

    // 处理滚动到底部
    handleScrollToLower() {
      // 可以在这里添加一些触觉反馈或其他提示
      uni.vibrateShort({
        type: 'light',
      })
    },

    // 删除商品
    handleRemove(index) {
      uni.showModal({
        title: '提示',
        content: '确定要删除这个商品吗？',
        success: (res) => {
          if (res.confirm) {
            this.cartItems.splice(index, 1)
            uni.showToast({
              title: '删除成功',
              icon: 'success',
            })
          }
        },
      })
    },

    // 增加数量
    handleIncrease(index) {
      this.cartItems[index].quantity++
    },

    // 减少数量
    handleDecrease(index) {
      if (this.cartItems[index].quantity > 1) {
        this.cartItems[index].quantity--
      } else {
        uni.showToast({
          title: '数量不能小于1',
          icon: 'none',
        })
      }
    },

    // 查看商品详情
    handleViewDetail(item, index) {
      console.log('查看商品详情:', item)
      uni.showToast({
        title: `查看 ${item.name}`,
        icon: 'none',
      })
    },
  },
}
</script>

<style lang="scss">
.container {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  position: relative;
  z-index: 2;
}

.body {
  background: url('../../static/loginback.png');
  width: 100%;
  height: 100%;
  position: fixed;
  background-size: 100% 100%;
  background-repeat: no-repeat;
  background-attachment: fixed;
}

/* 毛玻璃覆盖层 */
.glass-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px) saturate(1.2) brightness(1.1);
  -webkit-backdrop-filter: blur(8px) saturate(1.2) brightness(1.1);
  z-index: 1;
  pointer-events: none;
}

/* Flexbox 三列布局 */
.flex-container {
  display: flex;
  height: 100vh;
  width: 100%;
}

/* 第一列：固定宽度导航栏 */
.nav-column {
  width: 5rem;
  min-width: 5rem;
  flex-shrink: 0;
  height: 100vh;
  overflow: hidden;
}

/* 第二列：自适应宽度 */
.content-column {
  flex: 1;
  height: 100vh;
  overflow: hidden;
  margin-right: 20px;
}

/* 第三列：固定宽度键盘区 */
.keyboard-column {
  width: 400px;
  min-width: 400px;
  flex-shrink: 0;
  height: 100vh;
  overflow: hidden;
  background-color: #1a1a1a;
  border-radius: 25px;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  margin-right: 20px;
}

/* 内容区域样式 */
.content-section {
  height: 100vh;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 25px;
  background-color: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

/* 购物车列表容器 */
.cart-list-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 购物车头部 */
.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 30rpx;
  background-color: #fff;
  border-bottom: 1px solid #f0f0f0;
}

.cart-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.cart-count {
  font-size: 28rpx;
  color: #666;
}

/* 购物车滚动区域 */
.cart-scroll {
  flex: 1;
  overflow: hidden;
}

.cart-items {
  padding: 0 30rpx;
}

/* 到底提示样式 */
.scroll-bottom-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx 60rpx 60rpx 60rpx; /* 增加底部padding，避免遮挡 */
  margin-top: 20rpx;
}

.tip-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.3), transparent);
}

.tip-text {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.6);
  margin: 0 30rpx;
  white-space: nowrap;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

/* 购物车底部汇总 */
.cart-footer {
  padding: 20rpx 30rpx;
  background-color: #fff;
  border-top: 1px solid #f0f0f0;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}

.total-info {
  display: flex;
  justify-content: flex-end;
  align-items: baseline;
}

.total-label {
  font-size: 32rpx;
  color: #333;
  margin-right: 10rpx;
}

.total-price {
  font-size: 40rpx;
  color: #ff5500;
  font-weight: bold;
}

/* 响应式调整 */
@media screen and (max-width: 1024px) {
  .nav-column {
    width: 4rem;
    min-width: 4rem;
  }

  .keyboard-column {
    width: 15rem;
    min-width: 15rem;
  }
}

@media screen and (max-width: 768px) {
  .nav-column {
    width: 3rem;
    min-width: 3rem;
  }

  .keyboard-column {
    width: 12rem;
    min-width: 12rem;
  }

  .cart-title {
    font-size: 32rpx;
  }

  .cart-count {
    font-size: 24rpx;
  }

  .glass-overlay {
    backdrop-filter: blur(6px) saturate(1.1);
    -webkit-backdrop-filter: blur(6px) saturate(1.1);
  }

  .tip-text {
    font-size: 20rpx;
    margin: 0 20rpx;
  }
}

/* 针对小屏幕的特殊处理 */
@media screen and (max-width: 600px) {
  .flex-container {
    flex-direction: column;
  }

  .nav-column,
  .keyboard-column {
    width: 100%;
    height: auto;
    min-height: 60px;
  }

  .content-column {
    flex: 1;
    height: auto;
  }
}

/* 针对不支持backdrop-filter的浏览器的回退方案 */
@supports not (backdrop-filter: blur(1px)) {
  .glass-overlay {
    background: rgba(255, 255, 255, 0.15);
  }

  .content-section {
    background-color: rgba(255, 255, 255, 0.12);
  }

  .keyboard-column {
    background-color: rgba(0, 0, 0, 0.4);
  }
}
</style>

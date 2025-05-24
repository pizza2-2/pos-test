<template>
  <view class="nav-container">
    <view class="card">
      <view class="nav-header">
        <image class="logo" :src="logoSrc" mode="aspectFit"></image>
      </view>

      <!-- 主要导航按钮区域 - 从顶部开始排列 -->
      <view class="nav-items">
        <view
          v-for="(item, index) in navItems"
          :key="index"
          class="nav-item"
          :class="{ active: currentIndex === index }"
          @tap="handleNavClick(index)"
        >
          <wd-icon
            :name="item.iconType"
            size="24px"
            :color="currentIndex === index ? '#ffffff' : '#ffffff80'"
          ></wd-icon>
          <text class="nav-text">{{ item.text }}</text>
        </view>
      </view>

      <!-- 设置按钮区域 - 固定在底部 -->
      <view class="settings-section">
        <view
          class="nav-item settings-item"
          :class="{ active: currentIndex === -1 }"
          @tap="handleSettingsClick"
        >
          <wd-icon
            name="setting"
            size="24px"
            :color="currentIndex === -1 ? '#ffffff' : '#ffffff80'"
          ></wd-icon>
          <text class="nav-text">设置</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'SideNavBar',
  data() {
    return {
      logoSrc: '/static/logo.png',
      currentIndex: 0,
      navItems: [
        {
          text: '商品',
          iconType: 'add-circle', // 根据wd-icon支持的图标名更改
          url: '/pages/product/index',
        },
        {
          text: '订单',
          iconType: 'cart', // 如果wd-icon不支持，需要更换为支持的图标名
          url: '/pages/order/index',
        },
        {
          text: '取单',
          iconType: 'list', // 如果wd-icon不支持，需要更换为支持的图标名
          url: '/pages/HangingOrdersList/index',
        },
        {
          text: '客户',
          iconType: 'user', // 将staff改为user，更常见的图标名
          url: '/pages/customer/index',
        },
      ],
    }
  },
  methods: {
    handleNavClick(index) {
      this.currentIndex = index
      const targetUrl = this.navItems[index].url || '/pages/index/index'

      // 页面跳转
      uni.navigateTo({
        url: targetUrl,
      })

      // 向父组件传递事件
      this.$emit('nav-change', {
        index: index,
        item: this.navItems[index],
        type: 'nav',
      })
    },

    handleSettingsClick() {
      this.currentIndex = -1 // 设置按钮使用特殊索引

      // 跳转到设置页面
      uni.navigateTo({
        url: '/pages/settings/index',
      })

      // 向父组件传递设置事件
      this.$emit('nav-change', {
        index: -1,
        item: { text: '设置', iconType: 'setting' },
        type: 'settings',
      })
    },
  },
}
</script>

<style scoped>
.nav-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  overflow: hidden;
}

.card {
  width: 3rem;
  height: 90%;
  max-height: 30rem;
  background-color: #212121;
  border-radius: 1rem;
  border: #212121 0.2rem solid;
  transition: all 0.4s ease-in;
  box-shadow: 0.4rem 0.4rem 0.6rem #00000040;
  display: flex;
  flex-direction: column;
  padding: 0.5rem 0;
}

.nav-header {
  padding: 0.5rem;
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
  /* 固定在顶部 */
  flex-shrink: 0;
}

.logo {
  width: 2rem;
  height: 2rem;
}

/* 主导航区域 - 从顶部开始排列 */
.nav-items {
  display: flex;
  flex-direction: column;
  align-items: center;
  /* 移除 flex: 1，让按钮从顶部开始排列 */
  flex-shrink: 0;
  padding-top: 0; /* 确保从顶部开始 */
}

/* 设置区域 - 固定在底部 */
.settings-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: auto; /* 自动推到底部 */
  padding-bottom: 0.5rem;
  flex-shrink: 0;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: 0.5rem 0;
  margin: 0.2rem 0;
  cursor: pointer;
  border-radius: 0.5rem;
  transition: background-color 0.3s ease;
}

.nav-item:hover {
  background-color: #32323240;
}

.nav-item.active {
  background-color: #32323280;
}

/* 设置按钮特殊样式 */
.settings-item {
  border-top: 1px solid #32323280;
  margin-top: 0.5rem;
  padding-top: 0.8rem;
}

.settings-item:hover {
  background-color: #32323260;
}

.nav-text {
  font-size: 0.6rem;
  color: #ffffff80;
  margin-top: 0.2rem;
  transition: color 0.3s ease;
}

.nav-item.active .nav-text {
  color: #ffffff;
}

/* 响应式调整 */
@media screen and (max-width: 768px) {
  .card {
    width: 2.5rem;
    height: 70%;
  }

  .logo {
    width: 1.5rem;
    height: 1.5rem;
  }

  .nav-text {
    font-size: 0.5rem;
  }

  .settings-item {
    padding-top: 0.6rem;
  }
}
</style>

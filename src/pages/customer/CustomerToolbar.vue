<template>
  <view class="toolbar">
    <view>
      <wd-button @click="goBack">返回</wd-button>
    </view>
    
    <view class="search-box">
      <wd-input 
        class="search-input" 
        type="text" 
        :value="searchKeyword"
        @change="handleInput"
        placeholder="搜索客户..." 
      />
      <text class="search-icon">🔍</text>
    </view>
    
    <wd-button class="add-btn" @click="$emit('add')">
      添加客户
    </wd-button>
  </view>
</template>

<script>
export default {
  name: 'CustomerToolbar',
  props: {
    searchKeyword: {
      type: String,
      default: ''
    }
  },
  emits: ['search', 'add', 'back'],
  methods: {
    handleInput(e) {
      // wd-input的change事件返回的是直接的value值
      this.$emit('search', e.detail ? e.detail.value : e)
    },
    
    goBack() {
      uni.navigateBack()
    }
  }
}
</script>

<style lang="scss" scoped>
.toolbar {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 20rpx;
  background: #1a1a1a;
  border-bottom: 1px solid #333;
  flex-shrink: 0;
}

.search-box {
  flex: 1;
  position: relative;
  margin: 0 12rpx;
}

.search-input {
  width: 100%;
}

.search-icon {
  position: absolute;
  left: 20rpx;
  top: 50%;
  transform: translateY(-50%);
  font-size: 28rpx;
  color: #666;
  pointer-events: none;
}

.add-btn {
  flex-shrink: 0;
}
</style>

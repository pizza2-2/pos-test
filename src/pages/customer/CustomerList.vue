<template>
  <view class="customer-list">
    <scroll-view 
      class="scroll-container" 
      scroll-y="true" 
      :show-scrollbar="false"
    >
      <!-- 空状态 -->
      <view v-if="customers.length === 0 && !isLoading" class="empty-state">
        <text class="empty-icon">👥</text>
        <text class="empty-text">暂无客户</text>
      </view>

      <!-- 客户列表 -->
      <view v-else class="customers-container">
        <CustomerItem
          v-for="(customer, index) in customers" 
          :key="customer.id"
          :item="customer"
          :index="index"
          @edit="$emit('edit', customer)"
          @delete="$emit('delete', customer)"
          @viewDetail="$emit('viewDetail', customer)"
        />
      </view>

      <!-- 加载状态 -->
      <view v-if="isLoading" class="loading">
        <text class="loading-text">加载中...</text>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import CustomerItem from './CustomerItem.vue'

export default {
  name: 'CustomerList',
  components: {
    CustomerItem
  },
  props: {
    customers: {
      type: Array,
      default: () => []
    },
    isLoading: {
      type: Boolean,
      default: false
    }
  },
  emits: ['edit', 'delete', 'viewDetail']
}
</script>

<style lang="scss" scoped>
.customer-list {
  flex: 1;
  overflow: hidden;
}

.scroll-container {
  height: 100%;
}

.customers-container {
  padding: 16rpx;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400rpx;
  gap: 20rpx;
}

.empty-icon {
  font-size: 80rpx;
  opacity: 0.6;
}

.empty-text {
  font-size: 28rpx;
  color: #888;
}

.loading {
  display: flex;
  justify-content: center;
  padding: 40rpx;
}

.loading-text {
  color: #888;
  font-size: 24rpx;
}
</style>

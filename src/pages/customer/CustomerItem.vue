


<template>
  <view class="customer-card">
    <!-- 操作按钮 -->
    <view class="action-buttons">
      <wd-button 
        type="icon" 
        icon="edit-outline"
        size="small"
        custom-class="edit-btn"
        @click="$emit('edit')"
      />
      <wd-button 
        type="icon" 
        icon="delete-outline"
        size="small"
        custom-class="delete-btn"
        @click="$emit('delete')"
      />
    </view>
    
    <!-- 客户头像区域 -->
    <view class="customer-avatar">
      <view class="avatar-circle">
        <text class="avatar-text">{{ getAvatarText(item.name) }}</text>
      </view>
    </view>
    
    <!-- 客户基本信息区域 -->
    <view class="basic">
      <!-- 客户姓名 -->
      <view class="customer-name" @click="handleToDetail">
        {{ item.name }}
      </view>
      
      <!-- 联系信息 -->
      <view class="contact-info">
        <view class="contact-item" v-if="item.phone">
          <text class="contact-icon">📞</text>
          <text class="contact-text">{{ item.phone }}</text>
        </view>
        <view class="contact-item" v-if="item.email">
          <text class="contact-icon">📧</text>
          <text class="contact-text">{{ item.email }}</text>
        </view>
      </view>
      
      <!-- 地址信息 -->
      <view class="address-info" v-if="item.address">
        <text class="address-icon">📍</text>
        <text class="address-text">
          {{ formatAddress(item) }}
        </text>
      </view>
      
      <!-- 企业信息 -->
      <view class="business-info" v-if="item.nip">
        <view class="nip-info">
          <text class="label">NIP:</text>
          <text class="value">{{ item.nip }}</text>
        </view>
      </view>
      
      <!-- 备注信息 -->
      <view class="notes-info" v-if="item.notes">
        <text class="notes-label">备注:</text>
        <text class="notes-text">{{ item.notes }}</text>
      </view>
      
      <!-- 底部创建时间 -->
      <view class="basic-footer">
        <view class="create-time">
          <text class="time-label">创建时间:</text>
          <text class="time-value">{{ formatDate(item.created_at) }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'CustomerItem',
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
  emits: ['edit', 'delete', 'viewDetail'],
  methods: {
    // 处理查看详情
    handleToDetail() {
      this.$emit('viewDetail', this.item, this.index);
    },
    
    // 获取头像文字（取姓名首字母）
    getAvatarText(name) {
      if (!name) return '?';
      
      // 对于波兰语名字，取第一个和最后一个单词的首字母
      const words = name.trim().split(' ');
      if (words.length >= 2) {
        return (words[0][0] + words[words.length - 1][0]).toUpperCase();
      }
      return name[0].toUpperCase();
    },
    
    // 格式化地址
    formatAddress(customer) {
      const parts = [];
      if (customer.address) parts.push(customer.address);
      if (customer.postal_code) parts.push(customer.postal_code);
      if (customer.city) parts.push(customer.city);
      return parts.join(', ');
    },
    
    // 格式化日期
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('pl-PL');
    }
  }
}
</script>

<style lang="scss" scoped>
.customer-card {
  display: flex;
  padding: 20rpx 15rpx;
  position: relative;
  background-color: #1a1a1a;
  border-bottom: 1px solid #333;
  border-radius: 12rpx;
  margin-bottom: 8rpx;
}

.action-buttons {
  position: absolute;
  right: 8rpx;
  top: 8rpx;
  z-index: 10;
  display: flex;
  gap: 8rpx;
}

/* wd-button 自定义样式 */
:deep(.edit-btn) {
  --wd-button-bg-color: rgba(74, 222, 128, 0.2) !important;
  --wd-button-color: #4ade80 !important;
  border-radius: 25rpx !important;
  width: 50rpx !important;
  height: 50rpx !important;
}

:deep(.delete-btn) {
  --wd-button-bg-color: rgba(248, 113, 113, 0.2) !important;
  --wd-button-color: #f87171 !important;
  border-radius: 25rpx !important;
  width: 50rpx !important;
  height: 50rpx !important;
}

.customer-avatar {
  display: flex;
  align-items: center;
  margin-right: 15rpx;
  margin-left: 15rpx;
}

.avatar-circle {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-text {
  color: #ffffff;
  font-size: 32rpx;
  font-weight: bold;
}

.basic {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 120rpx;
  overflow: hidden;
}

.customer-name {
  font-size: 28rpx;
  color: #ffffff;
  font-weight: 600;
  margin-bottom: 8rpx;
  cursor: pointer;
}

.contact-info {
  margin-bottom: 8rpx;
}

.contact-item {
  display: flex;
  align-items: center;
  margin-bottom: 4rpx;
}

.contact-icon {
  font-size: 20rpx;
  margin-right: 8rpx;
  width: 24rpx;
}

.contact-text {
  font-size: 22rpx;
  color: #ccc;
}

.address-info {
  display: flex;
  align-items: flex-start;
  margin-bottom: 8rpx;
}

.address-icon {
  font-size: 20rpx;
  margin-right: 8rpx;
  margin-top: 2rpx;
}

.address-text {
  font-size: 22rpx;
  color: #ccc;
  line-height: 1.3;
}

.business-info {
  margin-bottom: 8rpx;
}

.nip-info {
  display: flex;
  align-items: center;
}

.label {
  font-size: 20rpx;
  color: #888;
  margin-right: 6rpx;
}

.value {
  font-size: 20rpx;
  color: #4a9eff;
  background-color: rgba(74, 158, 255, 0.2);
  padding: 2rpx 8rpx;
  border-radius: 4rpx;
}

.notes-info {
  margin-bottom: 8rpx;
}

.notes-label {
  font-size: 20rpx;
  color: #888;
  margin-right: 6rpx;
}

.notes-text {
  font-size: 20rpx;
  color: #aaa;
  line-height: 1.3;
}

.basic-footer {
  margin-top: auto;
  padding-top: 8rpx;
}

.create-time {
  display: flex;
  align-items: center;
}

.time-label {
  font-size: 18rpx;
  color: #666;
  margin-right: 6rpx;
}

.time-value {
  font-size: 18rpx;
  color: #888;
}
</style>

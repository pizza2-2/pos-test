<template>
	<view>
		<!-- 简单的商品信息显示 -->
		<view class="product-info">
			<view class="info-row">
				<text class="label">总价</text>
				<text class="value">{{ productName || '请选择商品' }}</text>
			</view>
			<view class="info-row">
				<text class="label">商品名</text>
				<text class="value">{{ productName || '请选择商品' }}</text>
			</view>
			<view class="info-row">
				<text class="label">Kod</text>
				<text class="value">{{ productName || '请输入Kod' }}</text>
			</view>
			
			<view class="info-row">
				<text class="label">价格</text>
				<text class="value price">{{ formatPrice(price) }}</text>
			</view>
		</view>

		<view class="keyboard-wrapper">	
			<!-- 网格键盘布局 -->
			<view class="keyboard-grid">
				<!-- 第一行 -->
				<view class="neumorphism-btn" @tap="handleClick('7')">
					<text class="btn-text">7</text>
				</view>
				<view class="neumorphism-btn" @tap="handleClick('8')">
					<text class="btn-text">8</text>
				</view>
				<view class="neumorphism-btn" @tap="handleClick('9')">
					<text class="btn-text">9</text>
				</view>
				<view class="neumorphism-btn function-key" @tap="handleClick('X')">
					<text class="btn-text">X</text>
				</view>
				
				<!-- 第二行 -->
				<view class="neumorphism-btn" @tap="handleClick('4')">
					<text class="btn-text">4</text>
				</view>
				<view class="neumorphism-btn" @tap="handleClick('5')">
					<text class="btn-text">5</text>
				</view>
				<view class="neumorphism-btn" @tap="handleClick('6')">
					<text class="btn-text">6</text>
				</view>
				<view class="neumorphism-btn function-key" @tap="handleClick('Kod')">
					<text class="btn-text">Kod</text>
				</view>
				
				<!-- 第三行 -->
				<view class="neumorphism-btn" @tap="handleClick('1')">
					<text class="btn-text">1</text>
				</view>
				<view class="neumorphism-btn" @tap="handleClick('2')">
					<text class="btn-text">2</text>
				</view>
				<view class="neumorphism-btn" @tap="handleClick('3')">
					<text class="btn-text">3</text>
				</view>
				<view class="neumorphism-btn function-key" @tap="handleClick('Cena')">
					<text class="btn-text">Cena</text>
				</view>
				
				<!-- 第四行 -->
				<view class="neumorphism-btn" @tap="handleClick('0')">
					<text class="btn-text">0</text>
				</view>
				<view class="neumorphism-btn" @tap="handleClick('.')">
					<text class="btn-text">.</text>
				</view>
				<view class="neumorphism-btn" @tap="handleClick('挂单')">
					<text class="btn-text">挂单</text>
				</view>
				<view class="neumorphism-btn confirm-key" @tap="handleClick('结算')">
					<text class="btn-text">结算</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
// 使用 ES6 import 导入
import music from '@/utils/music.js';

export default {
  name: 'GridKeyboard',
  data() {
    return {
      inputValue: '',
      productName: '苹果 iPhone 15',
      price: 999.99
    }
  },
  methods: {
    handleClick(key) {
      // 播放按键音效
      this.playClickSound();
      
      switch(key) {
        case 'Cena':
        case 'Kod':
        case 'X':
          uni.showToast({
            title: `执行${key}功能`,
            icon: 'none'
          });
          break;
        case '挂单':
          uni.showToast({
            title: '挂单操作',
            icon: 'none'
          });
          break;
        case '结算':
          uni.showToast({
            title: `结算完成: ${this.inputValue}`,
            icon: 'success'
          });
          break;
        default:
          if (this.inputValue.length < 10) {
            this.inputValue += key;
          }
      }
      
      uni.vibrateShort({
        type: 'light'
      });
    },
    
    // 播放按键音效
    playClickSound() {
      try {
        music.play_didi();
      } catch (error) {
        console.log('音效播放失败:', error);
      }
    },
    
    formatPrice(price) {
      return price ? `¥${price.toFixed(2)}` : '¥0.00';
    }
  }
}
</script>

<style lang="scss">
/* 样式保持不变 */
.product-info {
  padding: 15px 20px;
  margin-bottom: 10px;
  position: fixed;
  top: 20px;
  left: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 12px;
  z-index: 99;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 16px;
}

.value {
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
}

.value.price {
  color: #4ade80;
  font-weight: 700;
}

.keyboard-wrapper {
  position: fixed;
  bottom: 20px;
  left: 0;
  right: 0;
  padding: 20px;
  background: transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 100;
}

.keyboard-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(4, 1fr);
  gap: 15px;
  padding: 20px;
  border-radius: 20px;
  width: 320px;
  height: 320px;
}

.neumorphism-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: #5C5C5C;
  cursor: pointer;
  user-select: none;
  aspect-ratio: 1;
}

.function-key {
  background: #DD8503;
}

.function-key .btn-text {
  color: #C2C2C2;
  font-size: 20px;
}

.special-key {
  background: #d0d0d0;
}

.special-key .btn-text {
  color: #C2C2C2;
  font-size: 14px;
}

.confirm-key {
  background: #48d153;
}

.confirm-key .btn-text {
  color: #C2C2C2;
  font-size: 16px;
  font-weight: 700;
} 

.btn-text {
  font-size: 25px;
  font-weight: 600;
  color: #C2C2C2;
}

.neumorphism-btn:active {
  box-shadow: 
    inset 4px 4px 8px #b0b0b0,
    inset -4px -4px 8px #f0f0f0;
  transform: scale(0.95);
}

.function-key:active {
  box-shadow: 
    inset 4px 4px 8px #cc8633,
    inset -4px -4px 8px #ffcc4d;
}

.special-key:active {
  box-shadow: 
    inset 4px 4px 8px #a3a056,
    inset -4px -4px 8px #f7ee82;
}

.confirm-key:active {
  box-shadow: 
    inset 4px 4px 8px #3aa742,
    inset -4px -4px 8px #5bfb64;
}
</style>
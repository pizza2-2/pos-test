<template>
  <view class="customer-page">
    <!-- 紧凑顶部工具栏 -->
    <CustomerToolbar 
      :searchKeyword="searchKeyword"
      @search="handleSearch"
      @add="showAddDialog"
    />

    <!-- 客户列表 -->
    <CustomerList
      :customers="filteredCustomers"
      :isLoading="isLoading"
      @edit="editCustomer"
      @delete="deleteCustomer"
      @viewDetail="viewCustomerDetail"
    />

    <!-- 添加/编辑弹窗 -->
    <CustomerModal
      :visible="showModal"
      :customer="editingCustomer"
      :isEditing="isEditing"
      @close="closeModal"
      @save="saveCustomer"
    />
  </view>
</template>

<script>
// 引入子组件
import CustomerToolbar from './components/CustomerToolbar.vue'
import CustomerList from './components/CustomerList.vue'
import CustomerModal from './components/CustomerModal.vue'

export default {
  name: 'CustomerManagementPage',
  components: {
    CustomerToolbar,
    CustomerList,
    CustomerModal
  },
  data() {
    return {
      searchKeyword: '',
      isLoading: false,
      showModal: false,
      isEditing: false,
      editingCustomer: null,
      customers: [
        {
          id: 1,
          name: 'Anna Kowalska',
          address: 'ul. Gdańska 123',
          postal_code: '80-001',
          city: 'Gdańsk',
          nip: '1234567890',
          phone: '+48 123 456 789',
          email: 'anna.kowalska@email.com',
          notes: '常客，喜欢电子产品',
          created_at: '2024-01-15'
        },
        {
          id: 2,
          name: 'Jan Nowak',
          address: 'ul. Morska 456',
          postal_code: '80-002',
          city: 'Gdańsk',
          nip: '0987654321',
          phone: '+48 987 654 321',
          email: 'jan.nowak@email.com',
          notes: '企业客户',
          created_at: '2024-02-20'
        },
        {
          id: 3,
          name: 'Maria Wiśniewska',
          address: 'ul. Słoneczna 789',
          postal_code: '81-001',
          city: 'Gdynia',
          nip: '5678901234',
          phone: '+48 555 666 777',
          email: 'maria.wisniewska@email.com',
          notes: '零售客户，经常购买服装',
          created_at: '2024-03-10'
        }
      ]
    }
  },
  computed: {
    filteredCustomers() {
      if (!this.searchKeyword) {
        return this.customers
      }
      
      const keyword = this.searchKeyword.toLowerCase()
      return this.customers.filter(customer => {
        return (
          customer.name?.toLowerCase().includes(keyword) ||
          customer.address?.toLowerCase().includes(keyword) ||
          customer.city?.toLowerCase().includes(keyword) ||
          customer.nip?.toLowerCase().includes(keyword) ||
          customer.phone?.toLowerCase().includes(keyword) ||
          customer.email?.toLowerCase().includes(keyword)
        )
      })
    }
  },
  methods: {
    handleSearch(keyword) {
      this.searchKeyword = keyword
    },
    
    showAddDialog() {
      this.isEditing = false
      this.editingCustomer = null
      this.showModal = true
    },
    
    editCustomer(customer) {
      this.isEditing = true
      this.editingCustomer = customer
      this.showModal = true
    },
    
    deleteCustomer(customer) {
      uni.showModal({
        title: '确认删除',
        content: `确定要删除客户 "${customer.name}" 吗？`,
        success: (res) => {
          if (res.confirm) {
            const index = this.customers.findIndex(c => c.id === customer.id)
            if (index > -1) {
              this.customers.splice(index, 1)
              uni.showToast({
                title: '删除成功',
                icon: 'success'
              })
            }
          }
        }
      })
    },
    
    viewCustomerDetail(customer) {
      console.log('查看客户详情:', customer)
      uni.showToast({
        title: `查看客户 ${customer.name}`,
        icon: 'none'
      })
    },
    
    closeModal() {
      this.showModal = false
      this.editingCustomer = null
    },
    
    saveCustomer(customerData) {
      if (this.isEditing) {
        // 更新客户
        const index = this.customers.findIndex(c => c.id === customerData.id)
        if (index > -1) {
          this.customers[index] = { ...this.customers[index], ...customerData }
          uni.showToast({
            title: '更新成功',
            icon: 'success'
          })
        }
      } else {
        // 添加客户
        const newCustomer = {
          ...customerData,
          id: Date.now(), // 简单的ID生成
          created_at: new Date().toISOString().split('T')[0]
        }
        
        this.customers.push(newCustomer)
        uni.showToast({
          title: '添加成功',
          icon: 'success'
        })
      }
      
      this.closeModal()
    }
  }
}
</script>

<style lang="scss" scoped>
.customer-page {
  width: 100vw;
  height: 100vh;
  background: #0a0a0a;
  color: #ffffff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
</style>

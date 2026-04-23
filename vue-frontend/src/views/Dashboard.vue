<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="stat-card">
          <el-statistic title="总房源数" :value="stats.totalProperties">
            <template #prefix>
              <el-icon color="#409EFF"><OfficeBuilding /></el-icon>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stat-card">
          <el-statistic title="已出租" :value="stats.rentedProperties">
            <template #prefix>
              <el-icon color="#67C23A"><Check /></el-icon>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stat-card">
          <el-statistic title="活跃租约" :value="stats.activeLeases">
            <template #prefix>
              <el-icon color="#E6A23C"><Document /></el-icon>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stat-card">
          <el-statistic title="本月收入" :value="stats.monthlyIncome" prefix="¥">
            <template #prefix>
              <el-icon color="#F56C6C"><Money /></el-icon>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
    </el-row>
    
    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>即将到期的租约</span>
              <el-button type="primary" text @click="$router.push('/leases')">查看全部</el-button>
            </div>
          </template>
          <el-empty v-if="expiringLeases.length === 0" description="暂无即将到期的租约" />
          <el-table v-else :data="expiringLeases" style="width: 100%">
            <el-table-column prop="propertyAddress" label="房源" />
            <el-table-column prop="tenantName" label="租客" />
            <el-table-column prop="endDate" label="到期日期" width="120" />
          </el-table>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>待支付账单</span>
              <el-button type="primary" text @click="$router.push('/bills')">查看全部</el-button>
            </div>
          </template>
          <el-empty v-if="pendingBills.length === 0" description="暂无待支付账单" />
          <el-table v-else :data="pendingBills" style="width: 100%">
            <el-table-column prop="billType" label="类型" width="100" />
            <el-table-column prop="amount" label="金额" width="120" />
            <el-table-column prop="dueDate" label="到期日期" width="120" />
            <el-table-column prop="status" label="状态" width="100" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { OfficeBuilding, Check, Document, Money } from '@element-plus/icons-vue'
import { dashboardAPI, leaseAPI, billAPI } from '@/api/modules'
import { ElMessage } from 'element-plus'

const stats = ref({
  totalProperties: 0,
  rentedProperties: 0,
  activeLeases: 0,
  monthlyIncome: 0
})

const expiringLeases = ref([])
const pendingBills = ref([])

const fetchData = async () => {
  try {
    const [statsRes, expiringRes, billsRes] = await Promise.all([
      dashboardAPI.getStatistics(),
      leaseAPI.getExpiringLeases(),
      billAPI.getPendingBills()
    ])

    const statsData = statsRes?.data || {}
    stats.value = {
      totalProperties: statsData.totalProperties || 0,
      rentedProperties: statsData.rentedProperties || 0,
      activeLeases: statsData.activeLeases || 0,
      monthlyIncome: statsData.monthlyIncome || 0
    }
    expiringLeases.value = expiringRes?.data || []
    pendingBills.value = billsRes?.data || []
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error)
    ElMessage.error('加载数据失败')
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.stat-card {
  text-align: center;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
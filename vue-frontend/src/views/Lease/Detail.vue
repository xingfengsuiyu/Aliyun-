<template>
  <div class="lease-detail">
    <el-card v-loading="loading">
      <template #header>
        <div class="card-header">
          <span>租约详情</span>
          <el-button @click="$router.back()">返回</el-button>
        </div>
      </template>

      <div v-if="lease" class="detail-container">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="房源地址">
            {{ lease.propertyAddress || lease.propertyName || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="房源名称">
            {{ lease.propertyName || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="租客姓名">
            {{ lease.tenantName || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="租约状态">
            <el-tag :type="getStatusType(lease.status)">{{ lease.status }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="开始日期">
            {{ lease.startDate || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="结束日期">
            {{ lease.endDate || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="月租金">
            ¥{{ lease.rent }}
          </el-descriptions-item>
          <el-descriptions-item label="押金">
            ¥{{ lease.deposit }}
          </el-descriptions-item>
          <el-descriptions-item label="付款方式">
            {{ lease.paymentMode || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="付款日">
            {{ lease.paymentDay ? `每月${lease.paymentDay}日` : '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="租约创建时间" :span="2">
            {{ formatDateTime(lease.createdAt) }}
          </el-descriptions-item>
          <el-descriptions-item label="特殊条款" :span="2">
            <div v-if="lease.specialTerms" class="special-terms">{{ lease.specialTerms }}</div>
            <span v-else>-</span>
          </el-descriptions-item>
          <el-descriptions-item v-if="lease.status === '已终止'" label="终止原因" :span="2">
            {{ lease.terminationReason || '-' }}
          </el-descriptions-item>
          <el-descriptions-item v-if="lease.status === '已终止'" label="实际终止日期" :span="2">
            {{ lease.actualTerminationDate || '-' }}
          </el-descriptions-item>
        </el-descriptions>

        <div class="action-buttons" v-if="lease.status === '生效中'">
          <el-button type="success" @click="handleRenew">续租</el-button>
          <el-button type="danger" @click="handleTerminate">终止租约</el-button>
        </div>
      </div>

      <el-empty v-else description="未找到租约信息" />
    </el-card>

    <el-dialog v-model="terminateDialogVisible" title="终止租约" width="500px">
      <el-form :model="terminateForm" label-width="100px">
        <el-form-item label="终止日期">
          <el-date-picker
            v-model="terminateForm.actualTerminationDate"
            type="date"
            placeholder="选择日期"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="终止原因">
          <el-input
            v-model="terminateForm.terminationReason"
            type="textarea"
            :rows="3"
            placeholder="请输入终止原因"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="terminateDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmTerminate" :loading="terminating">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="renewDialogVisible" title="续租" width="500px">
      <el-form :model="renewForm" label-width="100px">
        <el-form-item label="新结束日期">
          <el-date-picker
            v-model="renewForm.endDate"
            type="date"
            placeholder="选择日期"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="renewDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmRenew" :loading="renewing">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { leaseAPI } from '@/api/modules'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const lease = ref(null)

const terminateDialogVisible = ref(false)
const terminateForm = reactive({
  actualTerminationDate: '',
  terminationReason: ''
})
const terminating = ref(false)

const renewDialogVisible = ref(false)
const renewForm = reactive({
  endDate: '',
  rent: 0
})
const renewing = ref(false)

const getStatusType = (status) => {
  const typeMap = {
    '草稿': 'info',
    '生效中': 'success',
    '已到期': 'warning',
    '已终止': 'danger',
    '待续签': 'warning'
  }
  return typeMap[status] || 'info'
}

const formatDateTime = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('zh-CN')
}

const loadLease = async () => {
  try {
    loading.value = true
    const res = await leaseAPI.getById(route.params.id)
    if (res?.data) {
      lease.value = res.data
    }
  } catch (error) {
    console.error('Failed to load lease:', error)
    ElMessage.error('加载租约信息失败')
  } finally {
    loading.value = false
  }
}

const handleTerminate = () => {
  const today = new Date().toISOString().slice(0, 10)
  terminateForm.actualTerminationDate = today
  terminateForm.terminationReason = ''
  terminateDialogVisible.value = true
}

const confirmTerminate = async () => {
  try {
    terminating.value = true
    await leaseAPI.terminate({
      id: lease.value.id,
      terminationReason: terminateForm.terminationReason,
      actualTerminationDate: terminateForm.actualTerminationDate
    })
    ElMessage.success('租约已终止')
    terminateDialogVisible.value = false
    loadLease()
  } catch (error) {
    console.error('Failed to terminate lease:', error)
    ElMessage.error(error?.response?.data?.message || '操作失败')
  } finally {
    terminating.value = false
  }
}

const handleRenew = () => {
  renewForm.endDate = ''
  renewForm.rent = lease.value?.rent || 0
  renewDialogVisible.value = true
}

const confirmRenew = async () => {
  if (!renewForm.endDate) {
    ElMessage.error('请选择新结束日期')
    return
  }
  const newEndDate = renewForm.endDate instanceof Date
    ? renewForm.endDate.toISOString().slice(0, 10)
    : renewForm.endDate
  if (new Date(newEndDate) <= new Date(lease.value.endDate)) {
    ElMessage.error('新结束日期必须大于当前结束日期')
    return
  }
  try {
    renewing.value = true
    await leaseAPI.renew({
      id: lease.value.id,
      newLeaseData: {
        endDate: newEndDate,
        rent: renewForm.rent
      }
    })
    ElMessage.success('续租成功')
    renewDialogVisible.value = false
    loadLease()
  } catch (error) {
    console.error('Failed to renew lease:', error)
    ElMessage.error(error?.response?.data?.message || '操作失败')
  } finally {
    renewing.value = false
  }
}

onMounted(() => {
  loadLease()
})
</script>

<style scoped>
.lease-detail {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-container {
  padding: 10px 0;
}

.special-terms {
  white-space: pre-wrap;
  color: #666;
}

.action-buttons {
  margin-top: 30px;
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #eee;
}
</style>

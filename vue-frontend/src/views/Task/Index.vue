<template>
  <div class="task-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>定时任务管理</span>
        </div>
      </template>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-card shadow="hover" class="task-card">
            <div class="task-info">
              <h3>账单生成任务</h3>
              <p>为所有活跃租约生成月度账单</p>
              <p class="task-schedule">定时执行时间：每天 01:00</p>
            </div>
            <el-button
              type="primary"
              :loading="generatingBills"
              @click="handleGenerateBills"
            >
              {{ generatingBills ? '执行中...' : '立即执行' }}
            </el-button>
          </el-card>
        </el-col>

        <el-col :span="12">
          <el-card shadow="hover" class="task-card">
            <div class="task-info">
              <h3>逾期账单更新任务</h3>
              <p>更新所有未支付账单的逾期状态和罚金</p>
              <p class="task-schedule">定时执行时间：每天 02:00</p>
            </div>
            <el-button
              type="warning"
              :loading="updatingOverdue"
              @click="handleUpdateOverdueBills"
            >
              {{ updatingOverdue ? '执行中...' : '立即执行' }}
            </el-button>
          </el-card>
        </el-col>
      </el-row>

      <el-alert
        v-if="message.text"
        :title="message.text"
        :type="message.type"
        show-icon
        style="margin-top: 20px"
        @close="message.text = ''"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { taskAPI } from '@/api/modules'

const generatingBills = ref(false)
const updatingOverdue = ref(false)
const message = ref({ text: '', type: 'success' })

const handleGenerateBills = async () => {
  generatingBills.value = true
  message.value = { text: '', type: 'success' }
  try {
    const res = await taskAPI.generateBills()
    if (res.success) {
      message.value = { text: '账单生成任务已触发执行', type: 'success' }
      ElMessage.success('账单生成任务已触发执行')
    } else {
      message.value = { text: res.message || '任务执行失败', type: 'error' }
      ElMessage.error(res.message || '任务执行失败')
    }
  } catch (error) {
    message.value = { text: '调用失败: ' + error.message, type: 'error' }
    ElMessage.error('调用失败: ' + error.message)
  } finally {
    generatingBills.value = false
  }
}

const handleUpdateOverdueBills = async () => {
  updatingOverdue.value = true
  message.value = { text: '', type: 'success' }
  try {
    const res = await taskAPI.updateOverdueBills()
    if (res.success) {
      message.value = { text: '逾期账单更新任务已触发执行', type: 'success' }
      ElMessage.success('逾期账单更新任务已触发执行')
    } else {
      message.value = { text: res.message || '任务执行失败', type: 'error' }
      ElMessage.error(res.message || '任务执行失败')
    }
  } catch (error) {
    message.value = { text: '调用失败: ' + error.message, type: 'error' }
    ElMessage.error('调用失败: ' + error.message)
  } finally {
    updatingOverdue.value = false
  }
}
</script>

<style scoped>
.task-container {
  max-width: 1000px;
}

.card-header {
  font-size: 18px;
  font-weight: 500;
}

.task-card {
  height: 100%;
}

.task-info {
  margin-bottom: 20px;
}

.task-info h3 {
  margin: 0 0 10px 0;
  color: #303133;
}

.task-info p {
  margin: 5px 0;
  color: #606266;
  font-size: 14px;
}

.task-schedule {
  color: #909399 !important;
  font-size: 12px !important;
}
</style>
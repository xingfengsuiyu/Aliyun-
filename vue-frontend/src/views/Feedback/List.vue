<template>
  <div class="feedback-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>意见反馈</span>
          <el-button type="primary" @click="handleCreate">
            <el-icon><Plus /></el-icon>
            提交反馈
          </el-button>
        </div>
      </template>

      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="feedbackType" label="类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getTypeColor(row.feedbackType)" size="small">
              {{ row.feedbackType }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="content" label="内容" min-width="300" show-overflow-tooltip />
        <el-table-column prop="createdAt" label="提交时间" width="160" />
      </el-table>

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.size"
        :total="pagination.total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="fetchData"
        @current-change="fetchData"
        style="margin-top: 20px; justify-content: flex-end"
      />
    </el-card>

    <!-- Create Feedback Dialog -->
    <el-dialog v-model="createDialogVisible" title="提交反馈" width="600px">
      <el-form :model="createForm" :rules="createRules" ref="createFormRef" label-width="100px">
        <el-form-item label="反馈类型" prop="feedbackType">
          <el-select v-model="createForm.feedbackType" placeholder="请选择类型" style="width: 100%">
            <el-option label="功能建议" value="功能建议" />
            <el-option label="系统bug" value="系统bug" />
            <el-option label="体验反馈" value="体验反馈" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="标题" prop="title">
          <el-input v-model="createForm.title" placeholder="请输入反馈标题" />
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input v-model="createForm.content" type="textarea" :rows="6" placeholder="请输入反馈内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitCreate" :loading="submitting">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { feedbackAPI } from '@/api/modules'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

const loading = ref(false)
const submitting = ref(false)
const tableData = ref([])
const createDialogVisible = ref(false)
const createFormRef = ref(null)

const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

const createForm = reactive({
  feedbackType: '',
  title: '',
  content: ''
})

const createRules = {
  feedbackType: [{ required: true, message: '请选择反馈类型', trigger: 'change' }],
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入内容', trigger: 'blur' }]
}

const getTypeColor = (type) => {
  const colorMap = {
    '功能建议': 'primary',
    '系统bug': 'danger',
    '体验反馈': 'warning',
    '其他': 'info'
  }
  return colorMap[type] || 'info'
}

const fetchData = async () => {
  try {
    loading.value = true
    const params = {
      page: pagination.page,
      size: pagination.size
    }
    const { data } = await feedbackAPI.getList(params)
    tableData.value = data.list ?? data.content ?? []
    pagination.total = data.total ?? data.totalElements ?? 0
  } catch (error) {
    console.error('Failed to fetch feedbacks:', error)
  } finally {
    loading.value = false
  }
}

const handleCreate = () => {
  createForm.feedbackType = ''
  createForm.title = ''
  createForm.content = ''
  createDialogVisible.value = true
}

const handleSubmitCreate = async () => {
  try {
    await createFormRef.value.validate()
    submitting.value = true
    await feedbackAPI.create(createForm)
    ElMessage.success('提交成功')
    createDialogVisible.value = false
    fetchData()
  } catch (error) {
    console.error('Failed to create feedback:', error)
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
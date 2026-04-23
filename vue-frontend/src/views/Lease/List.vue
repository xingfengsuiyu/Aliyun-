<template>
  <div class="lease-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>租约列表</span>
          <el-button type="primary" @click="$router.push('/leases/create')">
            <el-icon><Plus /></el-icon>
            新增租约
          </el-button>
        </div>
      </template>

      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="草稿" value="草稿" />
            <el-option label="生效中" value="生效中" />
            <el-option label="已到期" value="已到期" />
            <el-option label="已终止" value="已终止" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="propertyAddress" label="房源地址" min-width="200" />
        <el-table-column prop="tenantName" label="租客姓名" width="120" />
        <el-table-column prop="startDate" label="开始日期" width="120" />
        <el-table-column prop="endDate" label="结束日期" width="120" />
        <el-table-column prop="rent" label="月租金(元)" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleView(row)">查看</el-button>
            <el-button v-if="row.status === '生效中'" type="success" link @click="handleRenew(row)">续租</el-button>
            <el-button v-if="row.status === '生效中'" type="danger" link @click="handleTerminate(row)">终止</el-button>
          </template>
        </el-table-column>
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { leaseAPI } from '@/api/modules'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

const router = useRouter()

const loading = ref(false)
const tableData = ref([])

const searchForm = reactive({
  status: ''
})

const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

const renewDialogVisible = ref(false)
const renewForm = reactive({
  endDate: '',
  rent: 0
})
const renewing = ref(false)
const currentRenewLease = ref(null)

const terminateDialogVisible = ref(false)
const terminateForm = reactive({
  actualTerminationDate: '',
  terminationReason: ''
})
const terminating = ref(false)
const currentTerminateLease = ref(null)

const getStatusType = (status) => {
  const typeMap = {
    '草稿': 'info',
    '生效中': 'success',
    '已到期': 'warning',
    '已终止': 'danger'
  }
  return typeMap[status] || 'info'
}

const fetchData = async () => {
  try {
    loading.value = true
    const params = {
      page: pagination.page,
      size: pagination.size,
      ...(searchForm.status && { status: searchForm.status })
    }
    const res = await leaseAPI.getList(params)
    tableData.value = res?.data?.list ?? []
    pagination.total = res?.data?.total ?? 0
  } catch (error) {
    console.error('Failed to fetch leases:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  fetchData()
}

const handleReset = () => {
  searchForm.status = ''
  handleSearch()
}

const handleView = (row) => {
  router.push(`/leases/${row.id}`)
}

const handleRenew = (row) => {
  currentRenewLease.value = row
  renewForm.endDate = ''
  renewForm.rent = row.rent || 0
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
  const oldEndDate = currentRenewLease.value.endDate
  if (new Date(newEndDate) <= new Date(oldEndDate)) {
    ElMessage.error('新结束日期必须大于当前结束日期')
    return
  }
  try {
    renewing.value = true
    await leaseAPI.renew({
      id: currentRenewLease.value.id,
      newLeaseData: {
        endDate: newEndDate,
        rent: renewForm.rent
      }
    })
    ElMessage.success('续租成功')
    renewDialogVisible.value = false
    fetchData()
  } catch (error) {
    console.error('Failed to renew:', error)
    ElMessage.error(error?.response?.data?.message || '续租失败')
  } finally {
    renewing.value = false
  }
}

const handleTerminate = (row) => {
  currentTerminateLease.value = row
  const today = new Date().toISOString().slice(0, 10)
  terminateForm.actualTerminationDate = today
  terminateForm.terminationReason = ''
  terminateDialogVisible.value = true
}

const confirmTerminate = async () => {
  if (!terminateForm.actualTerminationDate) {
    ElMessage.error('请选择终止日期')
    return
  }
  try {
    terminating.value = true
    const terminationDate = terminateForm.actualTerminationDate instanceof Date
      ? terminateForm.actualTerminationDate.toISOString().slice(0, 10)
      : terminateForm.actualTerminationDate
    await leaseAPI.terminate({
      id: currentTerminateLease.value.id,
      terminationReason: terminateForm.terminationReason,
      actualTerminationDate: terminationDate
    })
    ElMessage.success('终止成功')
    terminateDialogVisible.value = false
    fetchData()
  } catch (error) {
    console.error('Failed to terminate:', error)
    ElMessage.error(error?.response?.data?.message || '终止失败')
  } finally {
    terminating.value = false
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

.search-form {
  margin-bottom: 20px;
}
</style>
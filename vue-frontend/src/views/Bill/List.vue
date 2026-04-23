<template>
  <div class="bill-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>账单管理</span>
          <el-button type="primary" @click="handleCreate">
            <el-icon><Plus /></el-icon>
            添加账单
          </el-button>
        </div>
      </template>

      <el-form :model="searchForm" inline @submit.prevent="fetchData">
        <el-form-item label="账单类型">
          <el-select v-model="searchForm.billType" placeholder="请选择" clearable style="width: 150px">
            <el-option label="租金" value="租金" />
            <el-option label="押金" value="押金" />
            <el-option label="物业费" value="物业费" />
            <el-option label="水电费" value="水电费" />
            <el-option label="维修费" value="维修费" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable style="width: 150px">
            <el-option label="待支付" value="待支付" />
            <el-option label="已支付" value="已支付" />
            <el-option label="逾期" value="逾期" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchData">查询</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="propertyAddress" label="房源地址" min-width="180" />
        <el-table-column prop="tenantName" label="租客" width="100" />
        <el-table-column prop="leaseStartDate" label="租约开始" width="110" />
        <el-table-column prop="leaseEndDate" label="租约结束" width="110" />
        <el-table-column prop="billType" label="账单类型" width="100">
          <template #default="{ row }">
            <el-tag size="small">{{ row.billType }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="金额" width="100">
          <template #default="{ row }">
            ¥{{ row.amount }}
          </template>
        </el-table-column>
        <el-table-column prop="dueDate" label="到期日期" width="110" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleView(row)">查看</el-button>
            <el-button v-if="row.status === '待支付'" type="success" link @click="handlePay(row)">收款</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
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

    <el-dialog v-model="addDialogVisible" title="添加账单" width="600px">
      <el-alert
        title="账单说明"
        type="info"
        :closable="false"
        show-icon
        style="margin-bottom: 20px"
      >
        <template #default>
          <p>• 每月1号会根据租约自动生成待支付账单</p>
          <p>• 您也可以手动添加账单信息</p>
        </template>
      </el-alert>

      <el-form :model="addForm" :rules="addRules" ref="addFormRef" label-width="100px">
        <el-form-item label="选择租约" prop="leaseId">
          <el-select
            v-model="addForm.leaseId"
            placeholder="请选择租约"
            filterable
            style="width: 100%"
            @change="handleLeaseChange"
          >
            <el-option
              v-for="lease in leaseList"
              :key="lease.id"
              :label="`${lease.propertyAddress} - ${lease.tenantName}`"
              :value="lease.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="账单类型" prop="billType">
          <el-select v-model="addForm.billType" placeholder="请选择" style="width: 100%">
            <el-option label="租金" value="租金" />
            <el-option label="押金" value="押金" />
            <el-option label="物业费" value="物业费" />
            <el-option label="水电费" value="水电费" />
            <el-option label="维修费" value="维修费" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>

        <el-form-item label="金额" prop="amount">
          <el-input-number v-model="addForm.amount" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>

        <el-form-item label="到期日期" prop="dueDate">
          <el-date-picker
            v-model="addForm.dueDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="选择日期"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="备注">
          <el-input v-model="addForm.remark" type="textarea" :rows="3" placeholder="可选" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitAdd" :loading="submitting">确认添加</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="viewDialogVisible" title="账单详情" width="600px">
      <el-descriptions v-if="currentBill" :column="2" border>
        <el-descriptions-item label="房源地址" :span="2">{{ currentBill.propertyAddress }}</el-descriptions-item>
        <el-descriptions-item label="租客">{{ currentBill.tenantName }}</el-descriptions-item>
        <el-descriptions-item label="账单类型">{{ currentBill.billType }}</el-descriptions-item>
        <el-descriptions-item label="金额">¥{{ currentBill.amount }}</el-descriptions-item>
        <el-descriptions-item label="到期日期">{{ currentBill.dueDate }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(currentBill.status)" size="small">
            {{ currentBill.status }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item v-if="currentBill.paidAmount" label="已付金额">¥{{ currentBill.paidAmount }}</el-descriptions-item>
        <el-descriptions-item v-if="currentBill.paidDate" label="支付日期">{{ currentBill.paidDate }}</el-descriptions-item>
        <el-descriptions-item v-if="currentBill.paymentMethod" label="支付方式">{{ currentBill.paymentMethod }}</el-descriptions-item>
        <el-descriptions-item v-if="currentBill.remark" label="备注" :span="2">{{ currentBill.remark }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="viewDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="payDialogVisible" title="记录收款" width="500px">
      <el-form :model="payForm" label-width="100px">
        <el-form-item label="实收金额">
          <el-input-number v-model="payForm.paidAmount" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="支付方式">
          <el-select v-model="payForm.paymentMethod" placeholder="请选择" style="width: 100%">
            <el-option label="微信支付" value="微信支付" />
            <el-option label="支付宝支付" value="支付宝支付" />
            <el-option label="现金支付" value="现金支付" />
            <el-option label="银行转账" value="银行转账" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="支付日期">
          <el-date-picker v-model="payForm.paidDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="payForm.remark" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="payDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitPay" :loading="submitting">确认收款</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { billAPI, leaseAPI } from '@/api/modules'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

const loading = ref(false)
const submitting = ref(false)
const tableData = ref([])
const leaseList = ref([])
const viewDialogVisible = ref(false)
const payDialogVisible = ref(false)
const addDialogVisible = ref(false)
const currentBill = ref(null)
const addFormRef = ref(null)

const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

const searchForm = reactive({
  billType: '',
  status: ''
})

const addForm = reactive({
  leaseId: '',
  billType: '',
  amount: 0,
  dueDate: '',
  remark: ''
})

const payForm = reactive({
  paidAmount: 0,
  paymentMethod: '',
  paidDate: '',
  remark: ''
})

const addRules = {
  leaseId: [{ required: true, message: '请选择租约', trigger: 'change' }],
  billType: [{ required: true, message: '请选择账单类型', trigger: 'change' }],
  amount: [{ required: true, message: '请输入金额', trigger: 'blur' }],
  dueDate: [{ required: true, message: '请选择到期日期', trigger: 'change' }]
}

const getStatusType = (status) => {
  const typeMap = {
    '待支付': 'warning',
    '已支付': 'success',
    '逾期': 'danger'
  }
  return typeMap[status] || 'info'
}

const fetchData = async () => {
  try {
    loading.value = true
    const params = {
      page: pagination.page,
      size: pagination.size,
      ...(searchForm.billType && { billType: searchForm.billType }),
      ...(searchForm.status && { status: searchForm.status })
    }
    const res = await billAPI.search(params)
    tableData.value = res?.data?.list ?? []
    pagination.total = res?.data?.total ?? 0
  } catch (error) {
    console.error('Failed to fetch bills:', error)
  } finally {
    loading.value = false
  }
}

const fetchLeaseList = async () => {
  try {
    const res = await leaseAPI.getList({ page: 0, size: 100 })
    leaseList.value = (res?.data?.list ?? []).map(lease => ({
      ...lease,
      propertyAddress: lease.propertyAddress || lease.property_name,
      tenantName: lease.tenantName || lease.tenant_name
    }))
  } catch (error) {
    console.error('Failed to fetch leases:', error)
  }
}

const handleCreate = () => {
  addForm.leaseId = ''
  addForm.billType = ''
  addForm.amount = 0
  addForm.dueDate = ''
  addForm.remark = ''
  addDialogVisible.value = true
}

const handleLeaseChange = (leaseId) => {
  const lease = leaseList.value.find(l => l.id === leaseId)
  if (lease) {
    addForm.amount = lease.rent || 0
  }
}

const handleSubmitAdd = async () => {
  try {
    await addFormRef.value.validate()
    submitting.value = true

    const lease = leaseList.value.find(l => l.id === addForm.leaseId)

    await billAPI.create({
      leaseId: addForm.leaseId,
      propertyId: lease?.propertyId || lease?.property_id,
      tenantId: lease?.tenantId || lease?.tenant_id,
      billType: addForm.billType,
      amount: addForm.amount,
      dueDate: addForm.dueDate,
      remark: addForm.remark,
      status: '待支付'
    })

    ElMessage.success('账单添加成功')
    addDialogVisible.value = false
    fetchData()
  } catch (error) {
    console.error('Failed to add bill:', error)
    ElMessage.error('添加失败')
  } finally {
    submitting.value = false
  }
}

const handleView = (row) => {
  currentBill.value = row
  viewDialogVisible.value = true
}

const handlePay = (row) => {
  currentBill.value = row
  payForm.paidAmount = row.amount
  payForm.paymentMethod = ''
  payForm.paidDate = ''
  payForm.remark = ''
  payDialogVisible.value = true
}

const handleSubmitPay = async () => {
  try {
    submitting.value = true
    await billAPI.recordPayment({
      id: currentBill.value.id,
      paymentData: {
        paidAmount: payForm.paidAmount,
        paymentMethod: payForm.paymentMethod,
        paidDate: payForm.paidDate,
        remark: payForm.remark
      }
    })
    ElMessage.success('收款成功')
    payDialogVisible.value = false
    fetchData()
  } catch (error) {
    console.error('Failed to record payment:', error)
    ElMessage.error('收款失败')
  } finally {
    submitting.value = false
  }
}

const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除这条账单吗？删除后无法恢复。\n\n房源：${row.propertyAddress}\n租客：${row.tenantName}\n金额：¥${row.amount}\n到期日期：${row.dueDate}`,
    '删除确认',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
      draggable: true
    }
  ).then(async () => {
    try {
      await billAPI.delete(row.id)
      ElMessage.success('删除成功')
      fetchData()
    } catch (error) {
      console.error('Failed to delete bill:', error)
      ElMessage.error('删除失败')
    }
  }).catch(() => {})
}

onMounted(() => {
  fetchData()
  fetchLeaseList()
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
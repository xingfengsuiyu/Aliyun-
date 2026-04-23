<template>
  <el-container class="layout-container">
    <el-aside :width="isCollapse ? '64px' : '200px'" class="aside">
      <div class="logo">
        <el-icon v-if="isCollapse" :size="24"><House /></el-icon>
        <h3 v-else>租房管理系统</h3>
      </div>
      <el-menu
        :default-active="route.path"
        router
        :collapse="isCollapse"
        :collapse-transition="false"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
      >
        <el-menu-item index="/">
          <el-icon><House /></el-icon>
          <template #title>仪表盘</template>
        </el-menu-item>

        <el-menu-item index="/properties">
          <el-icon><OfficeBuilding /></el-icon>
          <template #title>房源管理</template>
        </el-menu-item>

        <el-menu-item index="/tenants">
          <el-icon><User /></el-icon>
          <template #title>租客管理</template>
        </el-menu-item>

        <el-menu-item index="/leases">
          <el-icon><Document /></el-icon>
          <template #title>租约管理</template>
        </el-menu-item>

        <el-menu-item index="/bills">
          <el-icon><Money /></el-icon>
          <template #title>账单管理</template>
        </el-menu-item>

        <el-menu-item index="/feedbacks">
          <el-icon><ChatDotRound /></el-icon>
          <template #title>意见反馈</template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="header">
        <div class="header-left">
          <el-icon class="collapse-btn" @click="isCollapse = !isCollapse">
            <Fold v-if="!isCollapse" />
            <Expand v-else />
          </el-icon>
          <span class="page-title">{{ pageTitle }}</span>
        </div>
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              {{ userStore.userInfo?.account || '用户' }}
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人资料</el-dropdown-item>
                <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { House, OfficeBuilding, User, Document, Money, ChatDotRound, ArrowDown, Fold, Expand } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const isCollapse = ref(false)

const pageTitle = computed(() => {
  const titles = {
    '/': '仪表盘',
    '/properties': '房源管理',
    '/tenants': '租客管理',
    '/leases': '租约管理',
    '/bills': '账单管理',
    '/feedbacks': '意见反馈'
  }
  return titles[route.path] || '租房管理系统'
})

const handleCommand = (command) => {
  if (command === 'logout') {
    userStore.logout()
    router.push('/login')
  } else if (command === 'profile') {
    router.push('/profile')
  }
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.aside {
  background-color: #304156;
  color: #fff;
  transition: width 0.3s;
  overflow: hidden;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #2b3a4b;
  color: #fff;
}

.logo h3 {
  margin: 0;
  color: #fff;
  font-size: 18px;
  white-space: nowrap;
}

.el-menu {
  border-right: none;
}

.el-menu:not(.el-menu--collapse) {
  width: 200px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
  padding: 0 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.collapse-btn {
  font-size: 20px;
  cursor: pointer;
  color: #606266;
  transition: color 0.3s;
}

.collapse-btn:hover {
  color: #409EFF;
}

.page-title {
  font-size: 18px;
  font-weight: 500;
  color: #303133;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  color: #606266;
}

.main-content {
  background-color: #f0f2f5;
  padding: 20px;
}
</style>

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authAPI } from '@/api/modules'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || 'null'))
  
  const isLoggedIn = computed(() => !!token.value)
  
  async function login(loginForm) {
    const response = await authAPI.login(loginForm)
    token.value = response.data.token
    userInfo.value = response.data.user

    localStorage.setItem('token', token.value)
    localStorage.setItem('userInfo', JSON.stringify(userInfo.value))

    return response
  }

  async function register(payload) {
    const response = await authAPI.register(payload)
    token.value = response.data.token
    userInfo.value = response.data.user

    localStorage.setItem('token', token.value)
    localStorage.setItem('userInfo', JSON.stringify(userInfo.value))

    return response
  }

  function logout() {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
  }
  
  return {
    token,
    userInfo,
    isLoggedIn,
    login,
    register,
    logout
  }
})

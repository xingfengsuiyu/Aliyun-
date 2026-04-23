import api from './index'

export const authAPI = {
  login(data) {
    return api.post('/auth/login', data)
  },
  register(data) {
    return api.post('/auth/register', data)
  },
  getUserInfo() {
    return api.post('/auth/me')
  },
  updateProfile(data) {
    return api.post('/auth/profile', data)
  }
}

export const propertyAPI = {
  getList(data) {
    return api.post('/properties/list', data)
  },
  search(data) {
    return api.post('/properties/list', data)
  },
  getById(data) {
    return api.post('/properties/get', { id: data })
  },
  create(data) {
    return api.post('/properties', data)
  },
  update(data) {
    return api.post('/properties/update', data)
  },
  delete(data) {
    return api.post('/properties/delete', { id: data })
  },
  updateStatus(data) {
    return api.post('/properties/status', data)
  },
  batchCreate(data) {
    return api.post('/properties/batch/create', data)
  },
  batchUpdate(data) {
    return api.post('/properties/batch/update', data)
  }
}

export const tenantAPI = {
  getList(data) {
    return api.post('/tenants/list', data)
  },
  getById(data) {
    return api.post('/tenants/get', { id: data })
  },
  create(data) {
    return api.post('/tenants', data)
  },
  update(data) {
    return api.post('/tenants/update', data)
  },
  markAsMovedOut(data) {
    return api.post('/tenants/moveout', { id: data })
  }
}

export const leaseAPI = {
  getList(data) {
    return api.post('/leases/list', data)
  },
  search(data) {
    return api.post('/leases/list', data)
  },
  getById(data) {
    return api.post('/leases/get', { id: data })
  },
  create(data) {
    return api.post('/leases', data)
  },
  renew(data) {
    return api.post('/leases/renew', data)
  },
  terminate(data) {
    return api.post('/leases/terminate', data)
  },
  getActiveLeases() {
    return api.post('/leases/active')
  },
  getExpiringLeases() {
    return api.post('/leases/expiring')
  }
}

export const billAPI = {
  getList(data) {
    return api.post('/bills/list', data)
  },
  search(data) {
    return api.post('/bills/list', data)
  },
  getById(data) {
    return api.post('/bills/get', { id: data })
  },
  create(data) {
    return api.post('/bills', data)
  },
  delete(data) {
    return api.post('/bills/delete', { id: data })
  },
  recordPayment(data) {
    return api.post('/bills/pay', data)
  },
  getStatistics() {
    return api.post('/bills/statistics')
  },
  getPendingBills() {
    return api.post('/bills/pending')
  }
}

export const feedbackAPI = {
  getList(data) {
    return api.post('/feedbacks/list', data)
  },
  getById(data) {
    return api.post('/feedbacks/get', { id: data })
  },
  create(data) {
    return api.post('/feedbacks', data)
  },
  reply(data) {
    return api.post('/feedbacks/reply', data)
  },
  close(data) {
    return api.post('/feedbacks/close', { id: data })
  }
}

export const dashboardAPI = {
  getStatistics() {
    return api.post('/dashboard/statistics')
  }
}

export const taskAPI = {
  generateBills() {
    return api.get('/tasks/generate-bills')
  },
  updateOverdueBills() {
    return api.get('/tasks/update-overdue-bills')
  }
}
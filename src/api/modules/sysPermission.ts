import request from './request'

const baseUrl = '/sys-permission'

const sysPermissionApi = {
  ApiPageList: async (params: any) => {
    return await request.post(`${baseUrl}/page`, params)
  },
  ApiGetById: async (id: number | string) => {
    return await request.get(`${baseUrl}/${id}`)
  },
  ApiSaveOrUpdate: async (params: any) => {
    if (params?.id) {
      return await request.put(baseUrl, params)
    }
    return await request.post(baseUrl, params)
  },
  ApiDelete: async (id: number | string) => {
    return await request.delete(`${baseUrl}/${id}`)
  },
  ApiGetByRole: async (roleId: number | string) => {
    return await request.get(`${baseUrl}/role/${roleId}`)
  },
  ApiTree: async () => {
    return await request.get(`${baseUrl}/tree`)
  },
  ApiMenuTree: async () => {
    return await request.get(`${baseUrl}/menu-tree`)
  },
  ApiUserMenuTree: async () => {
    return await request.get(`${baseUrl}/user-menu-tree`)
  },
  ApiButtons: async () => {
    return await request.get(`${baseUrl}/buttons`)
  }
}

export default sysPermissionApi

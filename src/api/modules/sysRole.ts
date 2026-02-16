import request from './request'

const baseUrl = '/sys-role'

const sysRoleApi = {
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
  ApiAssignPermissions: async (params: { roleId: number | string; permissionIds: Array<number | string> }) => {
    return await request.post(`${baseUrl}/assign-permissions`, params)
  },
  ApiGetRolePermissions: async (roleId: number | string) => {
    return await request.get(`${baseUrl}/${roleId}/permissions`)
  }
}

export default sysRoleApi

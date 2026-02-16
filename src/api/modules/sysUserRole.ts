import request from './request'

const baseUrl = '/sys-user-role'

const sysUserRoleApi = {
  ApiAssignRoles: async (params: { userId: number | string; roleIds: Array<number | string> }) => {
    return await request.post(`${baseUrl}/assign-roles`, params)
  },
  ApiGetUserRoles: async (userId: number | string) => {
    return await request.get(`${baseUrl}/${userId}/roles`)
  }
}

export default sysUserRoleApi

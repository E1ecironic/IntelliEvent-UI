import request from './request'
import type { ApiResponse } from '@/types/api'

export default {

  /**
   * 上传文件
   * @param formData - 包含文件的FormData
   * @returns 返回上传结果和URL
   */
uploadAvatar(formData: FormData): Promise<ApiResponse<{ url: string }>> {
    return request.upload('/sys-file/upload', formData)
  },


}
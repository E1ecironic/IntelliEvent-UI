// 基础API响应类型
export interface ApiResponse<T = any> {
  code: number
  message: string
  data?: T
  success?: boolean
}

// 分页响应类型
export interface PageResponse<T = any> {
  records: T[]
  total: number
  size: number
  current: number
  pages: number
}
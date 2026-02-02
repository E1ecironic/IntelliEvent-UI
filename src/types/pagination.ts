// 分页配置类型
export interface PaginationOption {
  page: number
  limit: number
  total: number
  pageSizes?: number[]
  layout?: string
  background?: boolean
  autoScroll?: boolean
  hidden?: boolean
}
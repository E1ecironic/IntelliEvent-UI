// 表格配置类型 - 适配Element Plus表格
export interface TableOption {
  propList: ColumnOption[]
  showIndexColumn?: boolean
  showSelectColumn?: boolean
  showPagination?: boolean
  showSummary?: boolean
  editConfig?: EditConfig
}

export interface ColumnOption {
  prop: string
  label: string
  minWidth?: string | number
  width?: string | number
  align?: 'left' | 'center' | 'right'
  fixed?: 'left' | 'right' | boolean
  sortable?: boolean | 'custom'
  sortMethod?: (a: any, b: any) => number
  sortBy?: string | ((row: any) => any) | string[]
  sortOrders?: ('ascending' | 'descending' | null)[]
  formatter?: (row: any, column: any, cellValue: any, index: number) => string
  render?: (row: any, column: any, cellValue: any, index: number) => any
  slotName?: string
  editable?: boolean
  editType?: 'input' | 'select' | 'datepicker'
  editOptions?: ItemOption[]
  editRules?: Record<string, any>
  editProps?: Record<string, any>
  editSlotName?: string
  headerSlotName?: string
  footerSlotName?: string
  filters?: Array<{ text: string; value: any }>
  filterMultiple?: boolean
  filterMethod?: (value: any, row: any, column: any) => boolean
  filterPlacement?: string
  filteredValue?: any[]
  className?: string | ((params: any) => string)
  labelClassName?: string | ((params: any) => string)
  headerClassName?: string | ((params: any) => string)
  footerClassName?: string | ((params: any) => string)
  showOverflowTooltip?: boolean
  resizable?: boolean
  visible?: boolean
  selectable?: (row: any, index: number) => boolean
  reserveSelection?: boolean
  dragSort?: boolean
  treeNode?: boolean
}

export interface EditConfig {
  trigger: 'click' | 'dblclick'
  mode: 'cell' | 'row'
  showIcon?: boolean
  showStatus?: boolean
  activeMethod?: (params: any) => boolean
}

export interface ItemOption {
  label: string
  value: any
  disabled?: boolean
}

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
  small?: boolean
  disabled?: boolean
}

// 搜索表单配置类型
export interface SearchFormOption {
  formItems: FormOption[]
  showReset?: boolean
  showSearch?: boolean
  inline?: boolean
  labelWidth?: string | number
  size?: 'large' | 'default' | 'small'
}

// 表单配置类型
export interface FormOption {
  field: string
  type: 'input' | 'textarea' | 'number' | 'select' | 'datepicker' | 'timepicker' | 'switch' | 'radio' | 'checkbox' | 'upload'
  label: string
  placeholder?: string
  colSpan?: number
  disabled?: boolean
  options?: ItemOption[]
  rules?: Record<string, any>
  slotName?: string
  isTrim?: boolean
  // 输入框特有属性
  showPassword?: boolean
  prefix?: string
  suffix?: string
  // 数字输入框特有属性
  min?: number
  max?: number
  step?: number
  precision?: number
  controls?: boolean
  // 选择框特有属性
  filterable?: boolean
  collapseTags?: boolean
  clearable?: boolean
  // 日期选择器特有属性
  format?: string
  valueFormat?: string
  dateType?: 'date' | 'datetime' | 'datetimerange' | 'daterange'
  rangeSeparator?: string
  startPlaceholder?: string
  endPlaceholder?: string
  // 开关特有属性
  activeText?: string
  inactiveText?: string
  activeValue?: any
  inactiveValue?: any
  // 文本域特有属性
  rows?: number
  maxlength?: number
  showWordLimit?: boolean
  // 文件上传特有属性
  action?: string
  headers?: Record<string, string>
  data?: Record<string, any>
  multiple?: boolean
  limit?: number
  accept?: string
  drag?: boolean
  listType?: 'text' | 'picture' | 'picture-card'
  showFileList?: boolean
  autoUpload?: boolean
  uploadText?: string
  uploadSlot?: string
  uploadProps?: Record<string, any>
}

// 标签页配置类型
export interface TabOption {
  label: string
  name: string
  disabled?: boolean
  closable?: boolean
  lazy?: boolean
}
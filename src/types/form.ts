// 表单配置类型
export interface FormOption {
  field: string
  type: 'input' | 'textarea' | 'number' | 'select' | 'datepicker' | 'timepicker' | 'switch' | 'radio' | 'checkbox' | 'upload' | 'slot'
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
  dateType?: 'date' | 'datetime' | 'datetimerange' | 'daterange' | 'time' | 'timerange'
  isRange?: boolean
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

export interface ItemOption {
  label: string
  value: any
  disabled?: boolean
}

// 标签页配置类型
export interface TabOption {
  label: string
  name: string
  disabled?: boolean
  closable?: boolean
  lazy?: boolean
}
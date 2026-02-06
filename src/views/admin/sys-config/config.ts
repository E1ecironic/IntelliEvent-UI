import type { TableOption } from '@/types/table'
import type { FormOption } from '@/types/form'
import type { SysConfig } from '@/types/sysConfig'

// 搜索表单配置
export const searchFormConfig: FormOption[] = [
  {
    field: 'configKey',
    type: 'input',
    label: '配置键',
    placeholder: '请输入配置键'
  },
  {
    field: 'description',
    type: 'input',
    label: '描述',
    placeholder: '请输入描述'
  }
]

// 表格配置
export const tableConfig: TableOption = {
  propList: [
    { prop: 'configKey', label: '配置键', minWidth: '180' },
    { prop: 'configValue', label: '配置值', minWidth: '200' },
    { prop: 'description', label: '描述', minWidth: '200' },
    { prop: 'handler', label: '操作', minWidth: '150', fixed: 'right', slotName: 'handler' }
  ],
  showIndexColumn: true,
  showPagination: true,
  rowKey: 'id'
}

// 新增/编辑表单配置
export const formConfig: FormOption[] = [
  {
    field: 'configKey',
    type: 'input',
    label: '配置键',
    placeholder: '请输入配置键',
    rules: [{ required: true, message: '请输入配置键', trigger: 'blur' }]
  },
  {
    field: 'configValue',
    type: 'textarea',
    label: '配置值',
    placeholder: '请输入配置值',
    rules: [{ required: true, message: '请输入配置值', trigger: 'blur' }]
  },
  {
    field: 'description',
    type: 'textarea',
    label: '描述',
    placeholder: '请输入描述'
  }
]

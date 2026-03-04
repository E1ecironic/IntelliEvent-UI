import type { TableOption } from '@/types/table'
import type { FormOption } from '@/types/form'
import type { SysConfig } from '@/types/sysConfig'

export const moduleSearchFormConfig: FormOption[] = [
  {
    field: 'module',
    type: 'input',
    label: '模块',
    placeholder: '请输入模块，例如 ai/system/email'
  }
]

export const moduleTableConfig: TableOption = {
  propList: [
    { prop: 'module', label: '模块', minWidth: '200' },
    { prop: 'count', label: '配置数量', minWidth: '120' },
    { prop: 'handler', label: '操作', minWidth: '150', fixed: 'right', slotName: 'handler' }
  ],
  showIndexColumn: true,
  showPagination: false,
  rowKey: 'module'
}

export const detailTableConfig: TableOption = {
  propList: [
    { prop: 'configKey', label: '配置键', minWidth: '180' },
    { prop: 'configValue', label: '配置值', minWidth: '220' },
    { prop: 'description', label: '描述', minWidth: '200' },
    { prop: 'handler', label: '操作', minWidth: '150', fixed: 'right', slotName: 'detailHandler' }
  ],
  showIndexColumn: true,
  showPagination: true,
  rowKey: 'id'
}

// 新增/编辑表单配置
export const formConfig: FormOption[] = [
  {
    field: 'module',
    type: 'input',
    label: '模块',
    placeholder: '请输入模块，例如 ai/system/email',
    rules: [{ required: true, message: '请输入模块', trigger: 'blur' }]
  },
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

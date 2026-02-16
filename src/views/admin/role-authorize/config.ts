import type { FormOption } from '@/types/form'
import type { TableOption } from '@/types/table'

export interface RoleItem {
  id?: number
  name?: string
  code?: string
  description?: string
  status?: number
}

export const searchFormConfig: FormOption[] = [
  {
    field: 'name',
    type: 'input',
    label: '角色名称',
    placeholder: '请输入角色名称'
  },
  {
    field: 'code',
    type: 'input',
    label: '角色编码',
    placeholder: '请输入角色编码'
  },
  {
    field: 'status',
    type: 'select',
    label: '状态',
    placeholder: '请选择状态',
    options: [
      { label: '正常', value: 1 },
      { label: '禁用', value: 0 }
    ]
  }
]

export const tableConfig: TableOption = {
  propList: [
    { prop: 'name', label: '角色名称', minWidth: '140' },
    { prop: 'code', label: '角色编码', minWidth: '140' },
    { prop: 'description', label: '描述', minWidth: '160' },
    { prop: 'status', label: '状态', minWidth: '90', align: 'center', slotName: 'status' }
  ],
  showIndexColumn: true,
  showPagination: true,
  rowKey: 'id'
}

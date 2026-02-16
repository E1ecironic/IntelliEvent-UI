import type { TableOption } from '@/types/table'
import type { FormOption } from '@/types/form'

export interface Role {
  id?: number
  name?: string
  code?: string
  description?: string
  sort?: number
  status?: number
  createTime?: string
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
    { prop: 'name', label: '角色名称', minWidth: '160' },
    { prop: 'code', label: '角色编码', minWidth: '160' },
    { prop: 'description', label: '描述', minWidth: '200' },
    { prop: 'sort', label: '排序', minWidth: '100', align: 'center' },
    { prop: 'status', label: '状态', minWidth: '100', align: 'center', slotName: 'status' },
    {
      prop: 'handler',
      label: '操作',
      minWidth: '180',
      fixed: 'right',
      align: 'center',
      buttons: [
        {
          label: '编辑',
          type: 'primary',
          plain: true,
          command: 'edit'
        },
        {
          label: '删除',
          type: 'danger',
          plain: true,
          command: 'delete',
          style: { color: '#f56c6c' }
        }
      ]
    }
  ],
  showIndexColumn: true,
  showPagination: true,
  rowKey: 'id'
}

export const formConfig: FormOption[] = [
  {
    field: 'name',
    type: 'input',
    label: '角色名称',
    placeholder: '请输入角色名称',
    colSpan: 24,
    rules: [{ required: true, message: '请输入角色名称', trigger: 'blur' }]
  },
  {
    field: 'code',
    type: 'input',
    label: '角色编码',
    placeholder: '请输入角色编码',
    colSpan: 24,
    rules: [{ required: true, message: '请输入角色编码', trigger: 'blur' }]
  },
  {
    field: 'description',
    type: 'textarea',
    label: '描述',
    placeholder: '请输入描述',
    colSpan: 24,
    rows: 3
  },
  {
    field: 'sort',
    type: 'number',
    label: '排序',
    placeholder: '请输入排序',
    colSpan: 24,
    min: 0,
    controls: true
  },
  {
    field: 'status',
    type: 'radio',
    label: '状态',
    colSpan: 24,
    options: [
      { label: '正常', value: 1 },
      { label: '禁用', value: 0 }
    ],
    rules: [{ required: true, message: '请选择状态', trigger: 'change' }]
  }
]

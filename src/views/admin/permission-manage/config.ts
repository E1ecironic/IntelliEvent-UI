import type { TableOption } from '@/types/table'
import type { FormOption } from '@/types/form'

export interface PermissionItem {
  id?: number
  name?: string
  code?: string
  type?: string
  path?: string
  component?: string
  icon?: string
  method?: string
  api?: string
  visible?: number
  sort?: number
  status?: number
  parentId?: number
  children?: PermissionItem[]
}

export const searchFormConfig: FormOption[] = [
  {
    field: 'name',
    type: 'input',
    label: '权限名称',
    placeholder: '请输入权限名称'
  },
  {
    field: 'code',
    type: 'input',
    label: '权限编码',
    placeholder: '请输入权限编码'
  },
  {
    field: 'type',
    type: 'select',
    label: '类型',
    placeholder: '请选择类型',
    options: [
      { label: '菜单', value: 'MENU' },
      { label: '按钮', value: 'BUTTON' },
      { label: '接口', value: 'API' }
    ]
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
    { prop: 'name', label: '权限名称', minWidth: '180' },
    { prop: 'code', label: '权限编码', minWidth: '180' },
    { prop: 'type', label: '类型', minWidth: '100', align: 'center', slotName: 'type' },
    { prop: 'path', label: '路由地址', minWidth: '180' },
    { prop: 'api', label: '接口地址', minWidth: '200' },
    { prop: 'method', label: '请求方式', minWidth: '120', align: 'center' },
    { prop: 'visible', label: '可见', minWidth: '100', align: 'center', slotName: 'visible' },
    { prop: 'sort', label: '排序', minWidth: '100', align: 'center' },
    { prop: 'status', label: '状态', minWidth: '100', align: 'center', slotName: 'status' },
    {
      prop: 'handler',
      label: '操作',
      width: '180',
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
          command: 'delete',
          type: 'danger'
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
    label: '权限名称',
    placeholder: '请输入权限名称',
    colSpan: 12,
    rules: [{ required: true, message: '请输入权限名称', trigger: 'blur' }]
  },
  {
    field: 'code',
    type: 'input',
    label: '权限编码',
    placeholder: '请输入权限编码',
    colSpan: 12,
    rules: [{ required: true, message: '请输入权限编码', trigger: 'blur' }]
  },
  {
    field: 'type',
    type: 'select',
    label: '类型',
    placeholder: '请选择类型',
    colSpan: 12,
    options: [
      { label: '菜单', value: 'MENU' },
      { label: '按钮', value: 'BUTTON' },
      { label: '接口', value: 'API' }
    ],
    rules: [{ required: true, message: '请选择类型', trigger: 'change' }]
  },
  {
    field: 'parentId',
    type: 'input',
    label: '上级权限',
    colSpan: 12,
    slotName: 'parentSelect'
  },
  {
    field: 'path',
    type: 'input',
    label: '路由地址',
    placeholder: '请输入路由地址',
    colSpan: 12
  },
  {
    field: 'component',
    type: 'input',
    label: '组件路径',
    placeholder: '请输入组件路径',
    colSpan: 12
  },
  {
    field: 'icon',
    type: 'input',
    label: '图标',
    placeholder: '请输入图标',
    colSpan: 12
  },
  {
    field: 'method',
    type: 'select',
    label: '请求方式',
    placeholder: '请选择请求方式',
    colSpan: 12,
    options: [
      { label: 'GET', value: 'GET' },
      { label: 'POST', value: 'POST' },
      { label: 'PUT', value: 'PUT' },
      { label: 'DELETE', value: 'DELETE' }
    ]
  },
  {
    field: 'api',
    type: 'input',
    label: '接口地址',
    placeholder: '请输入接口地址',
    colSpan: 12
  },
  {
    field: 'visible',
    type: 'switch',
    label: '可见',
    colSpan: 12,
    activeValue: 1,
    inactiveValue: 0
  },
  {
    field: 'sort',
    type: 'number',
    label: '排序',
    placeholder: '请输入排序',
    colSpan: 12,
    min: 0,
    controls: true
  },
  {
    field: 'status',
    type: 'radio',
    label: '状态',
    colSpan: 12,
    options: [
      { label: '正常', value: 1 },
      { label: '禁用', value: 0 }
    ],
    rules: [{ required: true, message: '请选择状态', trigger: 'change' }]
  }
]

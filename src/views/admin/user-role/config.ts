import type { FormOption } from '@/types/form'
import type { TableOption } from '@/types/table'

export interface UserItem {
  id?: number
  userName?: string
  realName?: string
  phone?: string
  organizationName?: string
  roleNames?: string
  status?: number
}

export interface RoleItem {
  id?: number
  name?: string
  code?: string
}

export const searchFormConfig: FormOption[] = [
  {
    field: 'userName',
    type: 'input',
    label: '用户名',
    placeholder: '请输入用户名'
  },
  {
    field: 'realName',
    type: 'input',
    label: '真实姓名',
    placeholder: '请输入真实姓名'
  },
  {
    field: 'phone',
    type: 'input',
    label: '手机号',
    placeholder: '请输入手机号'
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
    { prop: 'userName', label: '用户名', minWidth: '160' },
    { prop: 'realName', label: '姓名', minWidth: '140' },
    { prop: 'phone', label: '手机号', minWidth: '150' },
    { prop: 'organizationName', label: '所属组织', minWidth: '160' },
    { prop: 'roleNames', label: '角色', minWidth: '200' },
    { prop: 'status', label: '状态', minWidth: '100', align: 'center', slotName: 'status' },
    {
      prop: 'handler',
      label: '操作',
      width: '160',
      minWidth: '160',
      fixed: 'right',
      align: 'center',
      buttons: [
        {
          label: '分配角色',
          type: 'primary',
          plain: true,
          command: 'assignRole'
        }
      ]
    }
  ],
  showIndexColumn: true,
  showPagination: true,
  rowKey: 'id'
}

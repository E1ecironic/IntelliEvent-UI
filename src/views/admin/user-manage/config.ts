/**
 * 用户管理页面配置文件
 * 定义表格配置、表单配置
 */

import type { TableOption } from '@/types/table'
import type { FormOption } from '@/types/form'

// 用户相关类型
export interface User {
  id?: number
  userName?: string
  realName?: string
  email?: string
  phone?: string
  status?: number
  organizationId?: number
  organizationName?: string
  position?: string
  avatar?: string
  lastLoginAt?: string
  createdAt?: string
  updatedAt?: string
  password?: string
  confirmPassword?: string
}

// 角色相关类型
export interface Role {
  id: number
  name: string
  code: string
  description?: string
  status: number
}

// 搜索表单配置
export const searchFormConfig: FormOption[] = [
  {
    field: 'userName',
    type: 'input',
    label: '用户名',
    placeholder: '请输入用户名',
    colSpan: 8
  },
  {
    field: 'realName',
    type: 'input',
    label: '姓名',
    placeholder: '请输入姓名',
    colSpan: 8
  },
  {
    field: 'status',
    type: 'select',
    label: '状态',
    placeholder: '请选择状态',
    colSpan: 8,
    options: [
      { label: '正常', value: 1 },
      { label: '禁用', value: 0 },
      { label: '待激活', value: 2 }
    ]
  }
]

// 表格配置
export const tableConfig: TableOption = {
  propList: [
    { prop: 'userName', label: '用户名', minWidth: '120', slotName: 'userInfo' },
    { prop: 'realName', label: '姓名', minWidth: '100' },
    { prop: 'email', label: '邮箱', minWidth: '150' },
    { prop: 'phone', label: '手机号', minWidth: '120' },
    { prop: 'organizationName', label: '所属组织', minWidth: '120', slotName: 'organization' },
    { prop: 'status', label: '状态', minWidth: '100', slotName: 'status' },
    { prop: 'lastLoginAt', label: '最后登录', minWidth: '160', slotName: 'lastLogin' },
    { prop: 'handler', label: '操作', minWidth: '180', fixed: 'right', slotName: 'handler' }
  ],
  showIndexColumn: true,
  showSelectColumn: true,
  showPagination: true
}

// 新增/编辑表单配置
export const formConfig: FormOption[] = [
  {
    field: 'userName',
    type: 'input',
    label: '用户名',
    placeholder: '请输入用户名',
    rules: [{ required: true, message: '请输入用户名', trigger: 'blur' }]
  },
  {
    field: 'realName',
    type: 'input',
    label: '真实姓名',
    placeholder: '请输入真实姓名',
    rules: [{ required: true, message: '请输入真实姓名', trigger: 'blur' }]
  },
  {
    field: 'email',
    type: 'input',
    label: '邮箱',
    placeholder: '请输入邮箱',
    rules: [
      { required: true, message: '请输入邮箱', trigger: 'blur' },
      { type: 'email', message: '请输入正确的邮箱格式', trigger: ['blur', 'change'] }
    ]
  },
  {
    field: 'phone',
    type: 'input',
    label: '手机号',
    placeholder: '请输入手机号',
    rules: [
      { required: true, message: '请输入手机号', trigger: 'blur' },
      { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
    ]
  },
  {
    field: 'organizationId',
    type: 'select',
    label: '所属组织',
    placeholder: '请选择组织',
    slotName: 'orgSelect',
    rules: [{ required: true, message: '请选择组织', trigger: 'change' }]
  },
  {
    field: 'status',
    type: 'radio',
    label: '状态',
    options: [
      { label: '正常', value: 1 },
      { label: '禁用', value: 0 },
      { label: '待激活', value: 2 }
    ],
    rules: [{ required: true, message: '请选择状态', trigger: 'change' }]
  }
]

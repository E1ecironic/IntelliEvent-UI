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
  organizationId?: number | string
  organizationName?: string
  orgPathName?: string
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
      { label: '禁用', value: 0 },
      { label: '待激活', value: 2 }
    ]
  },
  {
    field: 'organizationId',
    type: 'slot',
    label: '所属组织',
    placeholder: '请选择组织',
    slotName: 'orgSearch',
    colSpan: 12
  }
]

// 表格配置
export const tableConfig: TableOption = {
  propList: [
    { prop: 'userName', label: '用户名', minWidth: '180', slotName: 'userInfo' },
    { prop: 'realName', label: '姓名', minWidth: '120' },
    { prop: 'email', label: '邮箱', minWidth: '200' },
    { prop: 'phone', label: '手机号', minWidth: '150' },
    { prop: 'organizationName', label: '所属组织', minWidth: '150', slotName: 'organization' },
    { prop: 'status', label: '状态', minWidth: '100', slotName: 'status' },
    { prop: 'lastLoginAt', label: '最后登录', minWidth: '180', slotName: 'lastLogin' },
    {
      prop: 'handler',
      label: '操作',
      width: '240',
      minWidth: '240',
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
          label: '分配角色',
          type: 'warning',
          plain: true,
          command: 'assignRole'
        },
        {
          label: '重置密码',
          command: 'resetPassword'
        },
        {
          label: (row: any) => (row.status === 1 ? '禁用' : '启用'),
          command: 'toggleStatus'
        },
        {
          label: '删除',
          command: 'delete',
          style: { color: '#f56c6c' }
        }
      ]
    }
  ],
  showIndexColumn: true,
  showSelectColumn: false,
  showPagination: true,
  rowKey: 'id'
}

// 新增/编辑表单配置
export const formConfig: FormOption[] = [
  {
    field: 'userName',
    type: 'input',
    label: '用户名',
    placeholder: '请输入用户名',
    colSpan: 24,
    rules: [
      { required: true, message: '用户名不能为空', trigger: 'blur' },
      { pattern: /^[a-zA-Z0-9_]{4,20}$/, message: '用户名只能包含字母、数字和下划线，长度4-20位', trigger: 'blur' }
    ]
  },
  {
    field: 'realName',
    type: 'input',
    label: '真实姓名',
    placeholder: '请输入真实姓名',
    colSpan: 24,
    rules: [{ required: true, message: '真实姓名不能为空', trigger: 'blur' }]
  },
  /* {
    field: 'password',
    type: 'input',
    label: '密码',
    placeholder: '请输入密码',
    showPassword: true,
    colSpan: 24,
    rules: [
      { required: true, message: '密码不能为空', trigger: 'blur' },
      { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,20}$/, message: '密码必须包含大小写字母和数字，长度8-20位', trigger: 'blur' }
    ]
  }, */
  {
    field: 'email',
    type: 'input',
    label: '邮箱',
    placeholder: '请输入邮箱',
    colSpan: 24,
    rules: [
      { required: true, message: '邮箱不能为空', trigger: 'blur' },
      { type: 'email', message: '邮箱格式不正确', trigger: ['blur', 'change'] }
    ]
  },
  {
    field: 'phone',
    type: 'input',
    label: '手机号',
    placeholder: '请输入手机号',
    colSpan: 24,
    rules: [
      { required: true, message: '手机号不能为空', trigger: 'blur' },
      { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
    ]
  },
  {
    field: 'position',
    type: 'input',
    label: '职位',
    placeholder: '请输入职位',
    colSpan: 24
  },
  {
    field: 'organizationId',
    type: 'select',
    label: '所属组织',
    placeholder: '请选择组织',
    slotName: 'orgSelect',
    colSpan: 24,
/*     rules: [{ required: true, message: '请选择组织', trigger: 'change' }] */
  },
  {
    field: 'status',
    type: 'radio',
    label: '状态',
    colSpan: 24,
    options: [
      { label: '正常', value: 1 },
      { label: '禁用', value: 0 },
      { label: '待激活', value: 2 }
    ],
    rules: [{ required: true, message: '请选择状态', trigger: 'change' }]
  }
]

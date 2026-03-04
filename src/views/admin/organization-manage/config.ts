import type { FormOption } from '@/types/form'
import type { ColumnOption } from '@/types/table'
import { User as UserIcon, SwitchButton, Delete } from '@element-plus/icons-vue'

// 组织架构相关类型
export interface Organization {
  id?: number | string
  name?: string
  code?: string
  parentId?: number | string | null
  managerName?: string
  connectPhone?: string
  email?: string
  status?: number
  remark?: string
  fullName?: string
  children?: Organization[]
  level?: number
  hasChildren?: boolean
  createTime?: string
  updateTime?: string
}

// 搜索表单配置
export const searchFormConfig: FormOption[] = [
  {
    field: 'name',
    label: '组织名称',
    type: 'input',
    placeholder: '请输入组织名称'
  },
  {
    field: 'code',
    label: '组织编码',
    type: 'input',
    placeholder: '请输入组织编码'
  },
  {
    field: 'status',
    label: '状态',
    type: 'select',
    options: [
      { label: '正常', value: 1 },
      { label: '禁用', value: 0 }
    ]
  }
]

// 表格配置
export const tableConfig: { propList: ColumnOption[] } & Record<string, any> = {
  customTree: true,
  rowKey: 'id',
  treeProps: { children: 'children' },
  defaultExpandAll: false,
  showSelectionColumn: false,
  showIndexColumn: false,
  showPagination: true,
  propList: [
    {
      prop: 'name',
      label: '组织名称',
      minWidth: '200',
      align: 'left'
    },
    {
      prop: 'code',
      label: '组织编码',
      minWidth: '120',
      align: 'center'
    },
    {
      prop: 'managerName',
      label: '负责人',
      minWidth: '120',
      align: 'center'
    },
    {
      prop: 'connectPhone',
      label: '联系电话',
      minWidth: '120',
      align: 'center'
    },
    {
      prop: 'status',
      label: '状态',
      minWidth: '120',
      align: 'center',
      slotName: 'status'
    },
    {
      prop: 'createdAt',
      label: '创建时间',
      minWidth: '180',
      align: 'center'
    },
    {
      prop: 'handler',
      label: '操作',
      width: '240',
      minWidth: '240',
      fixed: 'right',
      align: 'center',
      buttons: [
        {
          label: '添加下级',
          type: 'primary',
          command: 'addChild',
          link: true
        },
        {
          label: '编辑',
          type: 'primary',
          command: 'edit',
          link: true
        },
        {
          label: '成员',
          icon: UserIcon,
          command: 'members'
        },
        {
          label: (row: any) => (row.status === 1 ? '禁用' : '启用'),
          icon: SwitchButton,
          command: 'toggleStatus'
        },
        {
          label: '删除',
          icon: Delete,
          command: 'delete',
          style: { color: '#f56c6c' }
        }
      ]
    }
  ]
}

export const memberTableColumns: ColumnOption[] = [
  {
    prop: 'realName',
    label: '姓名',
    width: '120'
  },
  {
    prop: 'position',
    label: '职位',
    width: '150'
  },
  {
    prop: 'orgPathName',
    label: '组织',
    minWidth: '280'
  },
  {
    prop: 'email',
    label: '邮箱',
    width: '180'
  },
  {
    prop: 'phone',
    label: '电话',
    width: '180'
  },
  {
    prop: 'handler',
    label: '操作',
    width: '180',
    fixed: 'right',
    slotName: 'handler'
  }
]

// 表单配置
export const formConfig: FormOption[] = [
  {
    field: 'name',
    label: '组织名称',
    type: 'input',
    rules: [
      { required: true, message: '请输入组织名称', trigger: 'blur' },
      { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
    ]
  },
  {
    field: 'code',
    label: '组织编码',
    type: 'input',
    rules: [
      { required: true, message: '请输入组织编码', trigger: 'blur' },
      { pattern: /^[A-Za-z0-9_-]+$/, message: '编码只能包含字母、数字、下划线和短横线', trigger: 'blur' }
    ]
  },
  {
    field: 'parentId',
    label: '上级组织',
    type: 'slot', // 使用插槽自定义 TreeSelect
    slotName: 'parentOrg'
  },
  {
    field: 'managerName',
    label: '负责人',
    type: 'input'
  },
  {
    field: 'connectPhone',
    label: '联系电话',
    type: 'input'
  },
  {
    field: 'email',
    label: '邮箱',
    type: 'input',
    rules: [
      { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
    ]
  },
  {
    field: 'status',
    label: '状态',
    type: 'select',
    options: [
      { label: '正常', value: 1 },
      { label: '禁用', value: 0 }
    ]
  },
  {
    field: 'remark',
    label: '备注',
    type: 'textarea'
  }
]

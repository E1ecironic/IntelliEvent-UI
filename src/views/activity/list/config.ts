/**
 * 活动管理页面配置文件
 * 定义表格配置、表单配置
 */

import type { TableOption } from '@/types/table'
import type { FormOption } from '@/types/form'
import type { Activity } from '@/types/activity'
import type { User } from '@/views/admin/user-manage/config'

// 活动相关类型
export interface ActivityForm extends Activity {
  responsible?: string
}

// 表格配置
export const tableConfig: TableOption = {
  propList: [
    { prop: 'name', label: '活动名称', minWidth: '200' },
    { prop: 'type', label: '类型', minWidth: '100' },
    { prop: 'date', label: '日期', minWidth: '120' },
    { prop: 'location', label: '地点', minWidth: '120' },
    { prop: 'responsibleName', label: '负责人', minWidth: '100' },
    { prop: 'budget', label: '预算', minWidth: '120' },
    { prop: 'status', label: '状态', minWidth: '100' },
    {
      prop: 'handler',
      label: '操作',
      width: '240',
      fixed: 'right',
      align: 'center',
      buttons: [
        {
          label: '详情',
          type: 'primary',
          link: true,
          command: 'detail'
        },
        {
          label: '编辑',
          type: 'primary',
          link: true,
          command: 'edit'
        },
        {
          label: '复制',
          command: 'copy'
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

// 表单配置
export const formConfig: FormOption[] = [
  {
    field: 'name',
    type: 'input',
    label: '活动名称',
    placeholder: '请输入活动名称',
    colSpan: 24,
    rules: [{ required: true, message: '活动名称不能为空', trigger: 'blur' }]
  },
  {
    field: 'type',
    type: 'select',
    label: '活动类型',
    placeholder: '请选择活动类型',
    colSpan: 24,
    options: [
      { label: '团建', value: '团建' },
      { label: '庆典', value: '庆典' },
      { label: '会议', value: '会议' },
      { label: '培训', value: '培训' }
    ],
    rules: [{ required: true, message: '活动类型不能为空', trigger: 'change' }]
  },
  {
    field: 'date',
    type: 'datepicker',
    label: '活动时间',
    placeholder: '选择日期',
    dateType: 'date',
    valueFormat: 'YYYY-MM-DD',
    colSpan: 24,
    rules: [{ required: true, message: '活动日期不能为空', trigger: 'change' }]
  },
  {
    field: 'timeRange',
    type: 'input',
    label: '时间范围',
    placeholder: '请输入时间范围',
    colSpan: 24
  },
  {
    field: 'location',
    type: 'input',
    label: '活动地点',
    placeholder: '请输入活动地点',
    colSpan: 24,
    rules: [{ required: true, message: '活动地点不能为空', trigger: 'blur' }]
  },
  {
    field: 'responsible',
    type: 'select',
    label: '负责人',
    placeholder: '请选择负责人',
    colSpan: 24,
    options: [],
    slotName: 'responsibleSelect',
    rules: [{ required: true, message: '负责人不能为空', trigger: 'change' }]
  },
  {
    field: 'participants',
    type: 'number',
    label: '参与人数',
    placeholder: '请输入参与人数',
    min: 0,
    colSpan: 24
  },
  {
    field: 'budget',
    type: 'number',
    label: '预算',
    placeholder: '请输入预算',
    min: 0,
    step: 1000,
    colSpan: 24
  },
  {
    field: 'status',
    type: 'select',
    label: '状态',
    colSpan: 24,
    options: [
      { label: '待开始', value: '待开始' },
      { label: '进行中', value: '进行中' },
      { label: '已完成', value: '已完成' }
    ]
  },
  {
    field: 'description',
    type: 'textarea',
    label: '活动描述',
    placeholder: '请输入活动描述',
    rows: 3,
    colSpan: 24
  }
]

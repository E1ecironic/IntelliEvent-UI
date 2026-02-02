/**
 * 组织架构管理页面配置文件
 * 包含设计系统变量、样式配置、响应式断点、组件尺寸等配置
 */


// 组织架构相关类型
export interface Organization {
  id?: number
  name?: string
  code?: string
  parentId?: number | null
  managerName?: string
  connectPhone?: string
  email?: string
  status?: number
  remark?: string
  children?: Organization[]
  level?: number
  hasChildren?: boolean
  createTime?: string
  updateTime?: string
}

export interface OrganizationForm {
  id?: number
  name: string
  code: string
  parentId?: number | null
  managerName?: string
  connectPhone?: string
  email?: string
  status?: number
  remark?: string
}


// 设计系统变量
export const designSystem = {
  // 颜色系统
  colors: {
    primary: '#409EFF',
    success: '#67C23A',
    warning: '#E6A23C',
    danger: '#F56C6C',
    info: '#909399',
    text: {
      primary: '#303133',
      regular: '#606266',
      secondary: '#909399',
      placeholder: '#C0C4CC'
    },
    border: {
      base: '#DCDFE6',
      light: '#E4E7ED',
      lighter: '#EBEEF5',
      extraLight: '#F2F6FC'
    },
    background: {
      base: '#FFFFFF',
      page: '#F5F7FA',
      treeCurrent: '#F0F9FF',
      treeTopLevel: '#F5F7FA'
    }
  },

  // 字体系统
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: {
      xs: '10px',
      sm: '12px',
      base: '13px',
      md: '14px',
      lg: '16px',
      xl: '18px',
      '2xl': '20px',
      '3xl': '24px'
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    lineHeight: {
      tight: 1.1,
      normal: 1.2,
      relaxed: 1.5
    }
  },

  // 间距系统
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '32px'
  },

  // 圆角系统
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px'
  },

  // 阴影系统
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 2px 4px 0 rgba(0, 0, 0, 0.1)',
    lg: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    xl: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    card: '0 2px 12px 0 rgba(0, 0, 0, 0.1)'
  }
}

// 页面特定样式配置
export const pageStyles = {
  // 树形控件样式配置
  tree: {
    node: {
      contentHeight: 'auto',
      contentPadding: '4px 8px',
      expandIconSize: '16px',
      expandIconMarginRight: '8px'
    },
    nodeHighlight: {
      backgroundColor: '#F0F9FF'
    },
    topLevelNode: {
      backgroundColor: '#F5F7FA',
      fontWeight: 600
    }
  },

  // 组织节点样式配置
  orgNode: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    padding: '12px 0',
    gap: '12px'
  },

  // 组织名称样式配置
  orgName: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '16px',
    fontWeight: 500,
    color: '#303133',
    marginBottom: '8px',
    iconMarginRight: '8px'
  },

  // 组织元信息样式配置
  orgMeta: {
    display: 'flex',
    gap: '20px',
    fontSize: '13px',
    color: '#909399',
    itemGap: '4px'
  },

  // 节点操作按钮样式配置
  nodeActions: {
    display: 'flex',
    gap: '8px',
    buttonPadding: '4px 8px',
    buttonFontSize: '12px'
  },

  // 卡片样式配置
  card: {
    borderRadius: '8px',
    boxShadow: '0 2px 12px 0 rgba(0, 0, 0, 0.1)',
    padding: '20px',
    marginBottom: '20px'
  },

  // 按钮样式配置
  button: {
    size: {
      small: 'small',
      default: 'default',
      large: 'large'
    },
    spacing: '12px'
  },

  // 表单样式配置
  form: {
    label: {
      fontSize: '13px',
      color: '#606266',
      fontWeight: 500,
      marginBottom: '4px'
    },
    input: {
      size: 'default'
    },
    spacing: {
      item: '8px',
      row: '16px'
    }
  },

  // 组织成员样式配置
  orgUsers: {
    containerPadding: '20px 0',
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '16px',
      fontSize: '16px',
      fontWeight: 500
    },
    userInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    userName: {
      display: 'flex',
      flexDirection: 'column',
      gap: '2px',
      nameFontSize: '14px',
      nameFontWeight: 500,
      nameColor: '#303133',
      positionFontSize: '12px',
      positionColor: '#909399'
    }
  },

  // 分页样式配置
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '20px',
    padding: '20px 0',
    borderTop: '1px solid #E4E7ED'
  }
}

// 响应式断点配置
export const breakpoints = {
  xs: 0,      // 移动设备
  sm: 640,    // 平板设备
  md: 768,    // 小型桌面
  lg: 1024,   // 桌面设备
  xl: 1280,   // 大型桌面
  '2xl': 1536 // 超大型桌面
}

// 页面组件尺寸配置
export const dimensions = {
  // 页面容器
  container: {
    padding: '20px',
    maxWidth: '100%'
  },

  // 页面头部
  header: {
    marginBottom: '20px',
    titleFontSize: '24px',
    subtitleFontSize: '14px'
  },

  // 树形控件区域
  tree: {
    containerPadding: '20px 0',
    minHeight: '400px',
    maxHeight: 'calc(100vh - 400px)'
  },

  // 对话框
  dialog: {
    width: {
      small: '500px',
      medium: '600px',
      large: '800px'
    }
  },

  // 表格列配置
  table: {
    columns: {
      userName: { width: '120px' },
      position: { width: '150px' },
      email: { minWidth: 'auto' },
      phone: { width: '120px' },
      actions: { width: '100px', fixed: true }
    }
  }
}

// 性能相关配置
export const performance = {
  // 防抖延迟时间（毫秒）
  debounceDelay: 300,

  // 虚拟滚动配置
  virtualScroll: {
    enabled: true,
    itemSize: 60,
    threshold: 100 // 超过100条数据启用虚拟滚动
  },

  // 分页配置
  pagination: {
    pageSize: 20,
    pageSizes: [10, 20, 50, 100],
    layout: 'total, sizes, prev, pager, next, jumper'
  }
}

// 业务逻辑配置
export const business = {
  // API 端点
  api: {
    baseUrl: '/api',
    endpoints: {
      organizations: '/organizations',
      users: '/users',
      orgUsers: '/organizations/:id/users'
    }
  },

  // 组织状态配置
  orgStatus: {
    disabled: 0,
    normal: 1
  },

  // 组织层级配置
  orgLevel: {
    topLevel: 1,
    maxDepth: 10
  },

  // 搜索配置
  search: {
    minLength: 2,
    maxLength: 50,
    fields: ['name', 'code']
  },

  // 删除确认配置
  delete: {
    showWarning: true,
    warningMessage: '删除组织同时会删除其子组织',
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }
}

// 移动端检测配置
export const mobile = {
  // 移动端断点
  breakpoint: 768,

  // 移动端特定配置
  header: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '16px'
  },

  orgNode: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '12px'
  },

  orgMeta: {
    flexDirection: 'column',
    gap: '8px'
  },

  nodeActions: {
    flexWrap: 'wrap'
  }
}

// 树形控件图标配置
export const treeIcons = {
  // 不同层级的图标
  level1: 'OfficeBuilding',
  level2: 'Folder',
  level3: 'Folder',
  default: 'Folder'
}

// 表单验证规则配置
export const formValidation = {
  orgName: {
    required: true,
    message: '请输入组织名称',
    trigger: 'blur',
    minLength: 2,
    maxLength: 50,
    messageRange: '长度在 2 到 50 个字符'
  },
  orgCode: {
    required: true,
    message: '请输入组织编码',
    trigger: 'blur',
    minLength: 2,
    maxLength: 20,
    messageRange: '长度在 2 到 20 个字符',
    pattern: /^[A-Za-z0-9_-]+$/,
    patternMessage: '编码只能包含字母、数字、下划线和短横线'
  },
  email: {
    type: 'email',
    message: '请输入正确的邮箱地址',
    trigger: 'blur'
  },
  phone: {
    pattern: /^1[3-9]\d{9}$/,
    message: '请输入正确的手机号码',
    trigger: 'blur'
  }
}

// 导出所有配置
export default {
  designSystem,
  pageStyles,
  breakpoints,
  dimensions,
  performance,
  business,
  mobile,
  treeIcons,
  formValidation
}

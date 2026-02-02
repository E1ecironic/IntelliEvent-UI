/**
 * 用户管理页面配置文件
 * 包含设计系统变量、样式配置、响应式断点、组件尺寸等配置
 */

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
  lastLoginTime?: string
  createTime?: string
  updateTime?: string
  roles?: Role[]
  roleIds?: number[]
  lastLoginAt?: string
  lastLoginIp?: string
  settings?: string
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
  createTime?: string
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
      page: '#F5F7FA'
    }
  },

  // 字体系统
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: {
      xs: '10px',
      sm: '11px',
      base: '12px',
      md: '13px',
      lg: '14px',
      xl: '16px',
      '2xl': '18px',
      '3xl': '20px',
      '4xl': '24px'
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
  // 表格样式配置
  table: {
    header: {
      backgroundColor: '#F5F7FA',
      textColor: '#606266',
      borderColor: '#EBEEF5',
      hoverColor: '#F5F7FA'
    },
    row: {
      hoverBackgroundColor: '#F5F7FA',
      borderColor: '#EBEEF5'
    },
    cell: {
      padding: '12px 0'
    },
    // 表格列配置
    columns: {
      selection: { width: '55px' },
      userInfo: { minWidth: '140px' },
      email: { minWidth: '120px' },
      phone: { minWidth: '80px' },
      organization: { minWidth: '120px' },
      role: { minWidth: '70px' },
      status: { minWidth: '70px' },
      lastLogin: { minWidth: '80px' },
      actions: { minWidth: '100px', fixed: true }
    }
  },

  // 卡片样式配置
  card: {
    borderRadius: '8px',
    boxShadow: '0 2px 12px 0 rgba(0, 0, 0, 0.1)',
    padding: '20px'
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

  // 用户信息样式配置
  userInfo: {
    avatar: {
      size: 32,
      colors: ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399']
    },
    details: {
      gap: '2px'
    },
    name: {
      fontSize: '13px',
      fontWeight: 500,
      color: '#303133'
    },
    username: {
      fontSize: '11px',
      color: '#909399'
    }
  },

  // 角色标签样式配置
  roleTags: {
    maxWidth: '50px',
    fontSize: '10px',
    height: '18px',
    lineHeight: '16px',
    padding: '0 3px',
    gap: '2px'
  },

  // 登录信息样式配置
  loginInfo: {
    fontSize: '10px',
    lineHeight: 1.1,
    gap: '1px'
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
    marginBottom: '16px',
    titleFontSize: '24px',
    subtitleFontSize: '14px'
  },

  // 搜索区域
  search: {
    labelHeight: '20px',
    inputHeight: '32px',
    actionsHeight: '56px',
    buttonWidth: '100%'
  },

  // 表格区域
  table: {
    minHeight: '400px',
    maxHeight: 'calc(100vh - 400px)',
    minWidth: '800px' // 移动端最小宽度
  },

  // 对话框
  dialog: {
    width: {
      small: '500px',
      medium: '600px',
      large: '800px'
    }
  },

  // 头像尺寸
  avatar: {
    small: 24,
    default: 32,
    large: 40
  }
}

// 性能相关配置
export const performance = {
  // 防抖延迟时间（毫秒）
  debounceDelay: 300,

  // 虚拟滚动配置
  virtualScroll: {
    enabled: true,
    itemSize: 50,
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
      users: '/users',
      organizations: '/organizations',
      roles: '/roles'
    }
  },

  // 用户状态配置
  userStatus: {
    disabled: 0,
    normal: 1,
    pending: 2
  },

  // 文件上传配置
  upload: {
    maxSize: 2 * 1024 * 1024, // 2MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif'],
    avatarUrl: '/api/upload/avatar'
  },

  // 搜索配置
  search: {
    minLength: 2,
    maxLength: 50,
    fields: ['username', 'realName', 'email']
  }
}

// 移动端检测配置
export const mobile = {
  // 移动端断点
  breakpoint: 768,

  // 移动端特定配置
  table: {
    minWidth: '800px',
    enableHorizontalScroll: true
  },

  button: {
    small: {
      height: '20px',
      padding: '1px 3px'
    }
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
  mobile
}

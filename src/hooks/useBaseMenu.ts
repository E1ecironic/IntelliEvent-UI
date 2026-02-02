import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

interface MenuItem {
  id: string | number
  name: string
  path: string
  icon?: string
  children?: MenuItem[]
  permission?: string
  hidden?: boolean
}

interface UseBaseMenuOptions {
  // 菜单数据
  menuData?: MenuItem[]
  
  // 权限配置
  checkPermission?: boolean
  
  // 缓存配置
  cacheMenu?: boolean
}

interface UseBaseMenuReturn {
  // 响应式数据
  menuList: Ref<MenuItem[]>
  currentMenu: Ref<MenuItem | null>
  
  // 计算属性
  visibleMenuList: ComputedRef<MenuItem[]>
  breadcrumbList: ComputedRef<MenuItem[]>
  
  // 方法
  setMenuData: (data: MenuItem[]) => void
  getMenuByPath: (path: string) => MenuItem | null
  getMenuById: (id: string | number) => MenuItem | null
  hasPermission: (permission: string) => boolean
  filterMenuByPermission: (menuList: MenuItem[]) => MenuItem[]
  setCurrentMenu: (menu: MenuItem | null) => void
  updateMenu: (id: string | number, updates: Partial<MenuItem>) => void
}

export function useBaseMenu(options: UseBaseMenuOptions = {}): UseBaseMenuReturn {
  const defaultOptions = {
    menuData: [],
    checkPermission: true,
    cacheMenu: true,
    ...options
  }

  // 响应式数据
  const menuList = ref<MenuItem[]>(defaultOptions.menuData)
  const currentMenu = ref<MenuItem | null>(null)
  
  // 用户权限列表（可以从store获取）
  const userPermissions = ref<string[]>([])

  // 计算属性 - 可见菜单
  const visibleMenuList = computed(() => {
    return filterMenuByPermission(menuList.value)
  })

  // 计算属性 - 面包屑
  const breadcrumbList = computed(() => {
    const result: MenuItem[] = []
    
    if (!currentMenu.value) return result
    
    // 递归查找父级菜单
    const findParents = (menu: MenuItem, list: MenuItem[]): MenuItem[] => {
      const parents: MenuItem[] = []
      
      const find = (items: MenuItem[], parent?: MenuItem): boolean => {
        for (const item of items) {
          if (item.id === menu.id) {
            if (parent) parents.unshift(parent)
            return true
          }
          
          if (item.children && item.children.length > 0) {
            if (find(item.children, item)) {
              if (parent) parents.unshift(parent)
              return true
            }
          }
        }
        return false
      }
      
      find(list)
      parents.push(menu)
      return parents
    }
    
    return findParents(currentMenu.value, menuList.value)
  })

  // 设置菜单数据
  const setMenuData = (data: MenuItem[]) => {
    menuList.value = data
    
    if (defaultOptions.cacheMenu) {
      // 可以缓存到localStorage
      localStorage.setItem('menuData', JSON.stringify(data))
    }
  }

  // 根据路径获取菜单
  const getMenuByPath = (path: string): MenuItem | null => {
    const find = (items: MenuItem[]): MenuItem | null => {
      for (const item of items) {
        if (item.path === path) return item
        
        if (item.children && item.children.length > 0) {
          const found = find(item.children)
          if (found) return found
        }
      }
      return null
    }
    
    return find(menuList.value)
  }

  // 根据ID获取菜单
  const getMenuById = (id: string | number): MenuItem | null => {
    const find = (items: MenuItem[]): MenuItem | null => {
      for (const item of items) {
        if (item.id === id) return item
        
        if (item.children && item.children.length > 0) {
          const found = find(item.children)
          if (found) return found
        }
      }
      return null
    }
    
    return find(menuList.value)
  }

  // 检查权限
  const hasPermission = (permission: string): boolean => {
    if (!defaultOptions.checkPermission) return true
    
    // 如果没有设置权限，默认有权限
    if (!permission) return true
    
    // 管理员拥有所有权限
    if (userPermissions.value.includes('*')) return true
    
    return userPermissions.value.includes(permission)
  }

  // 根据权限过滤菜单
  const filterMenuByPermission = (menuList: MenuItem[]): MenuItem[] => {
    if (!defaultOptions.checkPermission) return menuList
    
    return menuList.filter(item => {
      // 检查是否隐藏
      if (item.hidden) return false
      
      // 检查权限
      if (item.permission && !hasPermission(item.permission)) return false
      
      // 递归处理子菜单
      if (item.children && item.children.length > 0) {
        item.children = filterMenuByPermission(item.children)
        return item.children.length > 0
      }
      
      return true
    })
  }

  // 设置当前菜单
  const setCurrentMenu = (menu: MenuItem | null) => {
    currentMenu.value = menu
  }

  // 更新菜单
  const updateMenu = (id: string | number, updates: Partial<MenuItem>) => {
    const update = (items: MenuItem[]): boolean => {
      for (let i = 0; i < items.length; i++) {
        if (items[i].id === id) {
          items[i] = { ...items[i], ...updates }
          return true
        }
        
        if (items[i].children && items[i].children!.length > 0) {
          if (update(items[i].children!)) return true
        }
      }
      return false
    }
    
    update(menuList.value)
  }

  // 设置用户权限
  const setUserPermissions = (permissions: string[]) => {
    userPermissions.value = permissions
  }

  return {
    menuList,
    currentMenu,
    visibleMenuList,
    breadcrumbList,
    setMenuData,
    getMenuByPath,
    getMenuById,
    hasPermission,
    filterMenuByPermission,
    setCurrentMenu,
    updateMenu
  }
}
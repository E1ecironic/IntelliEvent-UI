/**
 * 深拷贝
 * @param obj 要拷贝的对象
 * @returns 拷贝后的对象
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as unknown as T
  if (typeof obj === 'object') {
    const clonedObj = {} as T
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }
  return obj
}

/**
 * 防抖
 * @param func 要执行的函数
 * @param wait 等待时间（毫秒）
 * @param immediate 是否立即执行
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate: boolean = false
): T {
  let timeout: ReturnType<typeof setTimeout> | null = null
  
  return function (this: any, ...args: Parameters<T>) {
    const context = this
    const later = () => {
      timeout = null
      if (!immediate) func.apply(context, args)
    }
    
    const callNow = immediate && !timeout
    
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    
    if (callNow) func.apply(context, args)
  } as T
}

/**
 * 节流
 * @param func 要执行的函数
 * @param wait 等待时间（毫秒）
 * @returns 节流后的函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): T {
  let timeout: ReturnType<typeof setTimeout> | null = null
  let previous = 0
  
  return function (this: any, ...args: Parameters<T>) {
    const context = this
    const now = Date.now()
    const remaining = wait - (now - previous)
    
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout)
        timeout = null
      }
      previous = now
      func.apply(context, args)
    } else if (!timeout) {
      timeout = setTimeout(() => {
        previous = Date.now()
        timeout = null
        func.apply(context, args)
      }, remaining)
    }
  } as T
}

/**
 * 判断是否为外部链接
 * @param path 路径
 * @returns 是否为外部链接
 */
export function isExternal(path: string): boolean {
  return /^(https?:|mailto:|tel:)/.test(path)
}

/**
 * 生成唯一ID
 * @param prefix 前缀
 * @returns 唯一ID
 */
export function generateId(prefix: string = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @returns 格式化后的文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 下载文件
 * @param url 文件URL
 * @param filename 文件名
 */
export function downloadFile(url: string, filename?: string): void {
  const link = document.createElement('a')
  link.href = url
  link.target = '_blank'
  
  if (filename) {
    link.download = filename
  }
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * 复制文本到剪贴板
 * @param text 要复制的文本
 * @returns 是否复制成功
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    } else {
      // 降级方案
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      
      try {
        document.execCommand('copy')
        return true
      } catch (error) {
        console.error('复制失败:', error)
        return false
      } finally {
        textArea.remove()
      }
    }
  } catch (error) {
    console.error('复制失败:', error)
    return false
  }
}

/**
 * 获取URL参数
 * @param url URL字符串
 * @returns 参数对象
 */
export function getQueryParams(url: string = window.location.href): Record<string, string> {
  const params: Record<string, string> = {}
  const search = url.split('?')[1]
  
  if (!search) return params
  
  search.split('&').forEach(param => {
    const [key, value] = param.split('=')
    if (key) {
      params[decodeURIComponent(key)] = decodeURIComponent(value || '')
    }
  })
  
  return params
}

/**
 * 构建URL参数
 * @param params 参数对象
 * @returns URL参数字符串
 */
export function buildQueryParams(params: Record<string, any>): string {
  const searchParams = new URLSearchParams()
  
  Object.keys(params).forEach(key => {
    const value = params[key]
    if (value !== null && value !== undefined && value !== '') {
      searchParams.append(key, String(value))
    }
  })
  
  return searchParams.toString()
}

/**
 * 验证邮箱格式
 * @param email 邮箱地址
 * @returns 是否为有效邮箱
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * 验证手机号格式
 * @param phone 手机号
 * @returns 是否为有效手机号
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^1[3-9]\d{9}$/
  return phoneRegex.test(phone)
}

/**
 * 验证身份证号码
 * @param idCard 身份证号码
 * @returns 是否为有效身份证
 */
export function isValidIdCard(idCard: string): boolean {
  const idCardRegex = /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dX]$/
  
  if (!idCardRegex.test(idCard)) return false
  
  // 验证校验码
  const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
  const checkCodes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2']
  
  let sum = 0
  for (let i = 0; i < 17; i++) {
    sum += parseInt(idCard[i]) * weights[i]
  }
  
  const checkCode = checkCodes[sum % 11]
  return idCard[17].toUpperCase() === checkCode
}

/**
 * 数组分组
 * @param array 数组
 * @param key 分组键
 * @returns 分组后的对象
 */
export function groupBy<T>(array: T[], key: keyof T | ((item: T) => string)): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const groupKey = typeof key === 'function' ? key(item) : String(item[key])
    if (!groups[groupKey]) {
      groups[groupKey] = []
    }
    groups[groupKey].push(item)
    return groups
  }, {} as Record<string, T[]>)
}

/**
 * 数组去重
 * @param array 数组
 * @param key 去重键
 * @returns 去重后的数组
 */
export function unique<T>(array: T[], key?: keyof T | ((item: T) => string)): T[] {
  if (!key) return [...new Set(array)]
  
  const seen = new Set<string>()
  return array.filter(item => {
    const itemKey = typeof key === 'function' ? key(item) : String(item[key])
    if (seen.has(itemKey)) {
      return false
    }
    seen.add(itemKey)
    return true
  })
}

/**
 * 扁平化数组
 * @param array 嵌套数组
 * @returns 扁平化后的数组
 */
export function flatten<T>(array: any[]): T[] {
  return array.reduce((flat, item) => {
    return flat.concat(Array.isArray(item) ? flatten(item) : item)
  }, [])
}

/**
 * 树形结构转扁平数组
 * @param tree 树形数组
 * @param childrenKey 子节点键名
 * @returns 扁平数组
 */
export function treeToArray<T>(tree: T[], childrenKey: keyof T = 'children' as keyof T): T[] {
  const result: T[] = []
  
  const traverse = (nodes: T[]) => {
    nodes.forEach(node => {
      result.push(node)
      const children = node[childrenKey] as unknown as T[]
      if (children && Array.isArray(children)) {
        traverse(children)
      }
    })
  }
  
  traverse(tree)
  return result
}

/**
 * 扁平数组转树形结构
 * @param array 扁平数组
 * @param idKey ID键名
 * @param parentKey 父节点键名
 * @param childrenKey 子节点键名
 * @returns 树形数组
 */
export function arrayToTree<T extends Record<string, any>>(
  array: T[],
  idKey: keyof T = 'id' as keyof T,
  parentKey: keyof T = 'parentId' as keyof T,
  childrenKey: keyof T = 'children' as keyof T
): T[] {
  const result: T[] = []
  const map: Record<string, T> = {}
  
  // 创建ID映射
  array.forEach(item => {
    const id = String(item[idKey])
    map[id] = item
  })
  
  // 构建树形结构
  array.forEach(item => {
    const parentId = String(item[parentKey])
    
    if (parentId && map[parentId]) {
      // 有父节点，添加到父节点的children中
      const parent = map[parentId]
      if (!parent[childrenKey]) {
        parent[childrenKey] = [] as unknown as T[keyof T]
      }
      (parent[childrenKey] as unknown as T[]).push(item)
    } else {
      // 没有父节点，作为根节点
      result.push(item)
    }
  })
  
  return result
}
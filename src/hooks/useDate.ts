import { ref, computed } from 'vue'

interface UseDateOptions {
  // 默认格式
  defaultFormat?: string
  
  // 时区配置
  timezone?: string
}

interface UseDateReturn {
  // 响应式数据
  currentDate: Ref<Date>
  
  // 计算属性
  formattedDate: ComputedRef<string>
  
  // 方法
  formatDate: (date: Date | string | number, format?: string) => string
  parseDate: (dateString: string, format?: string) => Date
  addDays: (date: Date, days: number) => Date
  addMonths: (date: Date, months: number) => Date
  addYears: (date: Date, years: number) => Date
  getWeekStart: (date: Date) => Date
  getWeekEnd: (date: Date) => Date
  getMonthStart: (date: Date) => Date
  getMonthEnd: (date: Date) => Date
  getYearStart: (date: Date) => Date
  getYearEnd: (date: Date) => Date
  isSameDay: (date1: Date, date2: Date) => boolean
  isSameWeek: (date1: Date, date2: Date) => boolean
  isSameMonth: (date1: Date, date2: Date) => boolean
  isSameYear: (date1: Date, date2: Date) => boolean
  getRelativeTime: (date: Date | string | number) => string
  getTimeAgo: (date: Date | string | number) => string
}

export function useDate(options: UseDateOptions = {}): UseDateReturn {
  const defaultOptions = {
    defaultFormat: 'YYYY-MM-DD HH:mm:ss',
    timezone: 'UTC',
    ...options
  }

  // 响应式数据
  const currentDate = ref(new Date())

  // 计算属性
  const formattedDate = computed(() => {
    return formatDate(currentDate.value, defaultOptions.defaultFormat)
  })

  // 格式化日期
  const formatDate = (date: Date | string | number, format: string = defaultOptions.defaultFormat): string => {
    const d = new Date(date)
    
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    const seconds = String(d.getSeconds()).padStart(2, '0')
    
    return format
      .replace('YYYY', String(year))
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds)
  }

  // 解析日期字符串
  const parseDate = (dateString: string, format: string = defaultOptions.defaultFormat): Date => {
    // 简单的日期解析，可以根据需要扩展
    if (dateString.includes('-')) {
      return new Date(dateString.replace(/-/g, '/'))
    }
    return new Date(dateString)
  }

  // 添加天数
  const addDays = (date: Date, days: number): Date => {
    const result = new Date(date)
    result.setDate(result.getDate() + days)
    return result
  }

  // 添加月数
  const addMonths = (date: Date, months: number): Date => {
    const result = new Date(date)
    result.setMonth(result.getMonth() + months)
    return result
  }

  // 添加年数
  const addYears = (date: Date, years: number): Date => {
    const result = new Date(date)
    result.setFullYear(result.getFullYear() + years)
    return result
  }

  // 获取周开始日期（周一）
  const getWeekStart = (date: Date): Date => {
    const result = new Date(date)
    const day = result.getDay()
    const diff = result.getDate() - day + (day === 0 ? -6 : 1) // 调整为周一
    result.setDate(diff)
    result.setHours(0, 0, 0, 0)
    return result
  }

  // 获取周结束日期（周日）
  const getWeekEnd = (date: Date): Date => {
    const result = getWeekStart(date)
    result.setDate(result.getDate() + 6)
    result.setHours(23, 59, 59, 999)
    return result
  }

  // 获取月开始日期
  const getMonthStart = (date: Date): Date => {
    const result = new Date(date.getFullYear(), date.getMonth(), 1)
    result.setHours(0, 0, 0, 0)
    return result
  }

  // 获取月结束日期
  const getMonthEnd = (date: Date): Date => {
    const result = new Date(date.getFullYear(), date.getMonth() + 1, 0)
    result.setHours(23, 59, 59, 999)
    return result
  }

  // 获取年开始日期
  const getYearStart = (date: Date): Date => {
    const result = new Date(date.getFullYear(), 0, 1)
    result.setHours(0, 0, 0, 0)
    return result
  }

  // 获取年结束日期
  const getYearEnd = (date: Date): Date => {
    const result = new Date(date.getFullYear(), 11, 31)
    result.setHours(23, 59, 59, 999)
    return result
  }

  // 判断是否为同一天
  const isSameDay = (date1: Date, date2: Date): boolean => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate()
  }

  // 判断是否为同一周
  const isSameWeek = (date1: Date, date2: Date): boolean => {
    const weekStart1 = getWeekStart(date1)
    const weekStart2 = getWeekStart(date2)
    return isSameDay(weekStart1, weekStart2)
  }

  // 判断是否为同一月
  const isSameMonth = (date1: Date, date2: Date): boolean => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth()
  }

  // 判断是否为同一年
  const isSameYear = (date1: Date, date2: Date): boolean => {
    return date1.getFullYear() === date2.getFullYear()
  }

  // 获取相对时间
  const getRelativeTime = (date: Date | string | number): string => {
    const d = new Date(date)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    const months = Math.floor(days / 30)
    const years = Math.floor(days / 365)
    
    if (years > 0) return `${years}年前`
    if (months > 0) return `${months}个月前`
    if (days > 0) return `${days}天前`
    if (hours > 0) return `${hours}小时前`
    if (minutes > 0) return `${minutes}分钟前`
    if (seconds > 0) return `${seconds}秒前`
    
    return '刚刚'
  }

  // 获取时间差（更详细）
  const getTimeAgo = (date: Date | string | number): string => {
    return getRelativeTime(date)
  }

  // 定时更新当前时间
  let timer: number | null = null
  
  const startTimer = () => {
    if (timer) clearInterval(timer)
    timer = window.setInterval(() => {
      currentDate.value = new Date()
    }, 1000)
  }
  
  const stopTimer = () => {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  }

  return {
    currentDate,
    formattedDate,
    formatDate,
    parseDate,
    addDays,
    addMonths,
    addYears,
    getWeekStart,
    getWeekEnd,
    getMonthStart,
    getMonthEnd,
    getYearStart,
    getYearEnd,
    isSameDay,
    isSameWeek,
    isSameMonth,
    isSameYear,
    getRelativeTime,
    getTimeAgo
  }
}
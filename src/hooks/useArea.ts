import { ref, computed } from 'vue'

interface AreaItem {
  code: string
  name: string
  children?: AreaItem[]
}

interface UseAreaOptions {
  // 地区数据
  areaData?: AreaItem[]
  
  // 默认值
  defaultProvince?: string
  defaultCity?: string
  defaultDistrict?: string
}

interface UseAreaReturn {
  // 响应式数据
  provinceCode: Ref<string>
  cityCode: Ref<string>
  districtCode: Ref<string>
  
  // 计算属性
  provinceList: ComputedRef<AreaItem[]>
  cityList: ComputedRef<AreaItem[]>
  districtList: ComputedRef<AreaItem[]>
  selectedArea: ComputedRef<string>
  selectedAreaCode: ComputedRef<string>
  
  // 方法
  setProvince: (code: string) => void
  setCity: (code: string) => void
  setDistrict: (code: string) => void
  setArea: (provinceCode: string, cityCode: string, districtCode: string) => void
  clearArea: () => void
  getAreaName: (code: string) => string
  getAreaPath: (code: string) => string[]
}

export function useArea(options: UseAreaOptions = {}): UseAreaReturn {
  const defaultOptions = {
    areaData: [],
    defaultProvince: '',
    defaultCity: '',
    defaultDistrict: '',
    ...options
  }

  // 响应式数据
  const provinceCode = ref(defaultOptions.defaultProvince)
  const cityCode = ref(defaultOptions.defaultCity)
  const districtCode = ref(defaultOptions.defaultDistrict)
  
  // 地区数据
  const areaData = ref<AreaItem[]>(defaultOptions.areaData)

  // 计算属性 - 省份列表
  const provinceList = computed(() => areaData.value)

  // 计算属性 - 城市列表
  const cityList = computed(() => {
    if (!provinceCode.value) return []
    const province = areaData.value.find(item => item.code === provinceCode.value)
    return province?.children || []
  })

  // 计算属性 - 区县列表
  const districtList = computed(() => {
    if (!cityCode.value) return []
    const cities = cityList.value
    const city = cities.find(item => item.code === cityCode.value)
    return city?.children || []
  })

  // 计算属性 - 选中的地区名称
  const selectedArea = computed(() => {
    const names: string[] = []
    
    if (provinceCode.value) {
      const province = getAreaName(provinceCode.value)
      if (province) names.push(province)
    }
    
    if (cityCode.value) {
      const city = getAreaName(cityCode.value)
      if (city) names.push(city)
    }
    
    if (districtCode.value) {
      const district = getAreaName(districtCode.value)
      if (district) names.push(district)
    }
    
    return names.join(' / ')
  })

  // 计算属性 - 选中的地区代码
  const selectedAreaCode = computed(() => {
    if (districtCode.value) return districtCode.value
    if (cityCode.value) return cityCode.value
    if (provinceCode.value) return provinceCode.value
    return ''
  })

  // 设置省份
  const setProvince = (code: string) => {
    if (provinceCode.value !== code) {
      provinceCode.value = code
      cityCode.value = ''
      districtCode.value = ''
    }
  }

  // 设置城市
  const setCity = (code: string) => {
    if (cityCode.value !== code) {
      cityCode.value = code
      districtCode.value = ''
    }
  }

  // 设置区县
  const setDistrict = (code: string) => {
    districtCode.value = code
  }

  // 设置完整地区
  const setArea = (provinceCode: string, cityCode: string, districtCode: string) => {
    provinceCode.value = provinceCode
    cityCode.value = cityCode
    districtCode.value = districtCode
  }

  // 清空地区
  const clearArea = () => {
    provinceCode.value = ''
    cityCode.value = ''
    districtCode.value = ''
  }

  // 获取地区名称
  const getAreaName = (code: string): string => {
    const findArea = (items: AreaItem[]): string => {
      for (const item of items) {
        if (item.code === code) return item.name
        
        if (item.children && item.children.length > 0) {
          const name = findArea(item.children)
          if (name) return name
        }
      }
      return ''
    }
    
    return findArea(areaData.value)
  }

  // 获取地区路径
  const getAreaPath = (code: string): string[] => {
    const path: string[] = []
    
    const findPath = (items: AreaItem[], currentPath: string[] = []): boolean => {
      for (const item of items) {
        const newPath = [...currentPath, item.name]
        
        if (item.code === code) {
          path.push(...newPath)
          return true
        }
        
        if (item.children && item.children.length > 0) {
          if (findPath(item.children, newPath)) return true
        }
      }
      return false
    }
    
    findPath(areaData.value)
    return path
  }

  // 设置地区数据
  const setAreaData = (data: AreaItem[]) => {
    areaData.value = data
  }

  return {
    provinceCode,
    cityCode,
    districtCode,
    provinceList,
    cityList,
    districtList,
    selectedArea,
    selectedAreaCode,
    setProvince,
    setCity,
    setDistrict,
    setArea,
    clearArea,
    getAreaName,
    getAreaPath
  }
}
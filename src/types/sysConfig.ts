export interface SysConfig {
  id?: string
  configKey: string
  configValue: string
  description?: string
  module?: string
  createdAt?: string
  updatedAt?: string
}

export interface SysConfigModule {
  module: string
  count: number
}

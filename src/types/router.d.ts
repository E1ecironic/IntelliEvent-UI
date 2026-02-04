import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    description?: string
    icon?: string
    isShow?: boolean
    hidden?: boolean
    roles?: string[]
  }
}

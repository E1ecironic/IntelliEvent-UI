import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import pinia from './store'
import router from './router'
import App from './App.vue'
import { registerDirectives } from '@/js/directives'
import * as AimiComponents from '@/components/Aimi'
// 注意：element-plus样式要在base.css之前加载，避免被覆盖
import '@/assets/style/element-plus.scss'
import '@/assets/style/base.css'

const app = createApp(App)

// 注册Element Plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 注册自定义指令
registerDirectives(app)

// 注册Aimi公共组件
for (const [key, component] of Object.entries(AimiComponents)) {
  app.component(key, component)
}

app.use(ElementPlus)
app.use(pinia)
app.use(router)

app.mount('#app')
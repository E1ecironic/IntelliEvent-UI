import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import pinia from './store'
import router from './router'
import App from './App.vue'
import { registerDirectives } from '@/js/directives'
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

app.use(ElementPlus)
app.use(pinia)
app.use(router)

app.mount('#app')
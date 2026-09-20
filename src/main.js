import './assets/imports.css'
import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { VueQueryPlugin } from '@tanstack/vue-query'

import queryClientConfig from '@/shared/query/queryClientConfig.js'
import App from './App.vue'
import router from './router'

const app = createApp(App)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(createPinia())
app.use(ElementPlus)
app.use(VueQueryPlugin, queryClientConfig)
app.use(router)

app.mount('#app')

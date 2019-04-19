import Vue from 'vue'

import 'normalize.css/normalize.css' // A modern alternative to CSS resets
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import locale from 'element-ui/lib/locale/lang/zh-CN' // lang i18n

import '@/styles/index.scss' // global css

import iView from 'iview'
import axios from 'axios'
import 'iview/dist/styles/iview.css'
import App from './App'
import router from './router'
import store from './store'

import '@/icons' // icon
import './permission' // permission control

Vue.use(iView)
Vue.use(ElementUI, { locale })
Vue.config.productionTip = false
const instance = axios.create({
  baseURL: 'http://localhost:3000/api/base/'// api 的 base_url

})
Vue.prototype.$http = instance

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})

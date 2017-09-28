import Vue from 'vue'
import App from './App'
import store from './vuex/store'
import lazyload from './utils/lazyload'
import browser from './utils/browser'

try {
  window.ipcRenderer && window.ipcRenderer.send('user-logged') // 通知 electron 加载完所有js
} catch (err) {
  console && console.log(err)
}

browser({
  browserSupport: {
    'Chrome': 37, // Includes Chrome for mobile devices
    'IE': 10,
    'Safari': 7,
    'Mobile Safari': 7,
    'Firefox': 32
  },
  language: 'cn'
})

Vue.use(require('vue-resource'))

Vue.use(lazyload, {
  fadein: true, // 是否开启淡入效果的全局选项
  nohori: false, // 是否忽略横向懒加载的全局选项
  speed: 20 // 对屏幕滚动的速度的阈值，滚动速度高于此值时，不加载图片
})

/* eslint-disable no-new */
new Vue({
  el: 'body',
  store,
  components: { App }
})

// window.store = store


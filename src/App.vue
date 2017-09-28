<style lang="scss">
  .global-error-tip {
    position: absolute;
    top: 30px;
    width: 100%;
    text-align: center;
    z-index: 100;

    > span {
      padding: 10px 15px;
      color: #fff;
      background: #9C9EA1;
    }
  }

  #main-begin{
    ul{ height:50px; width:200px; left:50%; margin-left:-100px;position:absolute; top:50%; margin-top:-50px;}
    li{ text-align:center; color:#9b9b9b; line-height:25px; }
  }
</style>

<template>
  <div id="app">
    <div class="global-error-tip" v-show="showErrorTip">
      <span>网络连接已断开，请检查网络配置</span>
    </div>
    <repair-page v-if="isPC" :remove-loading="removeLoading"></repair-page>
    <!-- <login-and-container v-if="isPC" :remove-loading="removeLoading"></login-and-container> -->
    <div id="main-begin" v-else>
      <ul id="message">
        <li>暂仅支持在电脑端显示</li>
        <li>建议使用 chrome 浏览器</li>
      </ul>
    </div>
  </div>
</template>

<script>
  import $ from 'jquery'
  // import LoginAndContainer from './components/modules/LoginAndContainer/'
  import RepairPage from './components/layouts/RepairPage/'

  export default {
    data () {
      return {
        showErrorTip: false,
        isPC: true,
        removeLoading () { //  移除初始化loading
          let loading = $('.loading-container')
          loading.animate({
            opacity: 0
          }, 200, () => {
            loading.remove()
          })
        }
      }
    },
    components: {
      // LoginAndContainer
      RepairPage
    },
    created () {
      this.isPC = this.ISPC()
    },
    ready () {
      window.addEventListener('online', () => {
        this.showErrorTip = false
      })

      window.addEventListener('offline', () => {
        this.showErrorTip = true
      })

      !this.isPC && $('body').css('background', '#ececec') && this.removeLoading()

      $(document).on({
        dragleave (e) { // 拖离
          e.preventDefault()
        },
        drop (e) { // 拖后放
          e.preventDefault()
        },
        dragenter (e) { // 拖进
          e.preventDefault()
        },
        dragover (e) { // 拖来拖去
          e.preventDefault()
        }
      })
    },
    methods: {
      ISPC () {
        let userAgentInfo = navigator.userAgent
        let Agents = ['Android', 'iPhone', 'SymbianOS', 'Windows Phone', 'iPad', 'iPod']
        let falg = true
        for (let item of Agents) {
          if (userAgentInfo.indexOf(item) > 0) {
            falg = false
            break
          }
        }
        return falg
      }
    }
  }
</script>

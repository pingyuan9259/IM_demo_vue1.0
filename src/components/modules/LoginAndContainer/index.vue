<style lang="scss">
  @import "../../../styles/base/reset";
  @import "../../../styles/base/normalize";
  @import "../../../styles/tooltip/index";
  @import "../../../styles/nprogress/index";
  @import "../../../styles/browser/index";
  @import "../../../styles/hint/index";
</style>

<template>
  <login v-if="!needLogin || !loaded"></login>
  <container v-if="needLogin"></container>
</template>

<script>
  import storage from '../../../utils/storage'
  import { ENV, TOKEN, TOP_LEVEL_HOST } from '../../../configs/'
  import Login from '../../../components/modules/Login/'
  import Container from '../../../components/layouts/Container/'
  import { getDeviceId } from '../../../vuex/actions'

  export default {
    data () {
      return {
        loaded: false
      }
    },
    props: {
      removeLoading: {
        type: Function,
        required: true
      }
    },
    components: {
      Login,
      Container
    },
    vuex: {
      actions: {
        getDeviceId
      },
      getters: {
        isLogin: state => state.login.isLogin
      }
    },
    computed: {
      needLogin () {
        if (TOKEN) {
          return this.goToPost()
        }
        if (this.isLogin) {
          return this.goToPost()
        } else {
          storage.clear()
          return false
        }
      }
    },
    events: {
      initCompleted () {
        this.removeLoading()
      },
      loginWithLoadingComplete () {
        this.loaded = true
      }
    },
    ready () {
      if (!this.needLogin) {
        this.removeLoading()
      }
    },
    methods: {
      goToPost () {
        let hash = window.location.hash
        let env = ENV === 'dev' ? '-dev' : ''

        if (hash.indexOf('post_login') !== -1) {
          window.location.href = `//post${env}.${TOP_LEVEL_HOST}`
          return false
        } else if (hash.indexOf('cms_login') !== -1) {
          window.location.href = `//cms-saas${env}.${TOP_LEVEL_HOST}`
          return false
        }
        return true
      }
    }
  }
</script>

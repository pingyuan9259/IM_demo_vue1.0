<style lang="scss">
  @import "./index";
  @import "../../../styles/base/reset";
  @import "../../../styles/base/normalize";
  @import "../../../styles/tooltip/index";
  @import "../../../styles/nprogress/index";
  @import "../../../styles/browser/index";
  @import "../../../styles/hint/index";
</style>

<template>
  <div class="repair-box" v-if="!token">
    <div class="bg-image">
      <img src="//o4a7cbihz.qnssl.com/cover/927dc849-80a3-41ea-8613-60ed03e74ed6">
    </div>
    <a
    class="read-post"
    v-if="showWriteLink"
    target="_blank"
    @click="writeLink">
      <img src="//o4a7cbihz.qnssl.com/cover/ebbfdaa6-8935-49cb-b943-85bd7dcdc294">
    </a>
  </div>
  <login v-if="token"></login>
</template>

<script>
  import Login from '../../modules/Login/'
  import { TOP_LEVEL_HOST, ENV, APP_ID } from '../../../configs/'
  import APP_MAP from '../../../configs/appMap'
  import PersonProfile from '../../modules/PersonProfile/'
  import ChannelList from '../../modules/ChannelList/'
  import cookie from '../../../utils/cookie'
  import request from '../../../utils/request'

  const cenv = ENV === 'dev' ? '_dev' : ''
  const isDev = ENV.indexOf('dev') !== -1 ? '-dev' : ''
  export default {
    data () {
      return {
        showWriteLink: APP_MAP[APP_ID].showWriteLink,
        token: false
      }
    },
    components: {
      PersonProfile,
      ChannelList,
      Login
    },
    created () {
      let hash = window.location.hash
      if (hash.indexOf('post_login') !== -1) {
        this.token = true
      }
    },
    methods: {
      writeLink () {
        if (cookie.getCookie('_app_token' + cenv)) {
          request.get({
            url: '/v3/user/detail'
          }).then(
            (data) => {
              if (data !== '') {
                window.location.href = `//post${isDev}.${TOP_LEVEL_HOST}`
              }
            },
            (err) => {
              console.log(err)
              window.alert(err)
            }
          )
          setTimeout(function () {
            this.token = true
          }, 500)
        } else {
          this.token = true
        }
      }
    }
  }
</script>

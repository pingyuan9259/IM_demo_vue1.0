<style lang="scss">
  @import "./index";
</style>

<template>
  <div class="layout-channels">
    <person-profile></person-profile>
    <channel-list></channel-list>
    <a v-if="showWriteLink" class="write-link" target="_blank" :href="writeLink"><i class="icon"></i><span>开始写作</span></a>
  </div>
</template>

<script>
  import { TOP_LEVEL_HOST, ENV, APP_ID } from '../../../configs/'
  import APP_MAP from '../../../configs/appMap'
  import PersonProfile from '../../modules/PersonProfile/'
  import ChannelList from '../../modules/ChannelList/'

  const isDev = ENV.indexOf('dev') !== -1 ? '-dev' : ''
  export default {
    data () {
      return {
        writeLink: `//post${isDev}.${TOP_LEVEL_HOST}`,
        showWriteLink: APP_MAP[APP_ID].showWriteLink
      }
    },
    components: {
      PersonProfile,
      ChannelList
    }
  }
</script>

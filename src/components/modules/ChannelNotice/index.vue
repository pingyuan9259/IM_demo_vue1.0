<style lang="scss">
  @import "./index";
</style>

<template>
  <div class="module-channel-notice" v-if="showNotice">
    <div class="channel-notice-title">群公告</div>
    <hr>
    <div class="channel-notice-content">{{ curChannel.announcement || '暂无公告' }}</div>
    <i class="close-notice icon" @click="showNotice = false"></i>
  </div>
</template>

<script>
  export default {
    data () {
      return {
        showNotice: false,
        curChannel: {}
      }
    },

    events: {
      openChannelNotice () {
        this.showNotice = true
      },
      colseChannelNotice () {
        this.showNotice = false
      }
    },

    vuex: {
      getters: {
        curChannelId: state => state.channel.curChannelId,
        channels: state => state.channel.channels
      }
    },

    watch: {
      curChannelId () {
        this.curChannel = this.channels[this.curChannelId]
      }
    }
  }
</script>

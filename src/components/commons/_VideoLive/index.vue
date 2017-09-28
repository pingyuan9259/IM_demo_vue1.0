<style lang="scss">
  .video-con {
    position: relative;

    .video-hide {
      visibility: hidden;
    }
    .video-tip {
      position: absolute;
      top: 10px;
      left: 10px;
      color: #fff;
      font-size: 14px;
      z-index: 2;
     }
  }
</style>

<template>
  <div class="video-con" :class="{'video-hide': hideVideo}" v-html="videoHtml"></div>
</template>

<script>
  import $ from 'jquery'
  export default {
    data () {
      return {
        videoHtml: '',
        videoTpl: (url) => `<video data-setup='{"preload": "auto", "controls": false, "autoplay": true, "controlBar": { "muteToggle": false }}' id="liveVideo" class="video-js vjs-default-skin" width="349" height="200" poster=""><source src="${url}" type="rtmp/flv" /><p class="vjs-no-js">error!</p></video>`,
        PLAYER: null,
        hideVideo: true
      }
    },
    props: {
      cover: {
        type: String
      },
      url: {
        type: String,
        twoWay: true,
        default: ''
      }
    },
    ready () {
      window.videojs.options.flash.swf = 'https://o3pvuu23u.qnssl.com/swf/video-js.swf'
      this.playVideo()
    },
    vuex: {
      getters: {
        curChannelId: state => state.channel.curChannelId,
        channels: state => state.channel.channels
      }
    },
    watch: {
      curChannelId () {
        if (this.channels[this.curChannelId].live_play_url) {
          this.playVideo()
        } else if (this.PLAYER) {
          this.PLAYER.dispose()
          this.PLAYER = null
          this.videoHtml = ''
        }
      }
    },
    methods: {

      playVideo () {
        if (this.PLAYER) {
          this.PLAYER.dispose()
        }
        this._play()
      },

      _play () {
        this.videoHtml = this.videoTpl(this.url)

        this.$nextTick(() => {
          this.PLAYER = window.videojs($('#liveVideo')[0])
        })
      }
    }
  }
</script>

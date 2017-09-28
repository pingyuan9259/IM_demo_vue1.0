<style lang="scss">
  @import './index';
</style>

<template>
  <div class="module-black-board">
    <div id="moduleBlackBoard" v-if="showBlackBoard">
      <div class="board-head">小黑板</div>
      <div class="board-container">
        <img class="board-bg" src="//o3pvuu23u.qnssl.com/image/blackBoard.png">
        <div class="board-content">
          <pre v-if="showText" v-html="content | emojiReplace"></pre>
          <img v-if="showImg" :src="imgUrl" @click="dialogImg = imgUrl, showDialog = true">
        </div>
      </div>
    </div>

    <div id="moduleLive">
      <div class="board-audio">语音直播</div>
      <div class="board-foot audio">
        <x-video
          :url.sync="videoUrl"
          :mic.sync="videoMic"
          ></x-video>
      </div>
    </div>

    <dialog :show.sync="showDialog">
      <img :src="dialogImg">
    </dialog>
  </div>
</template>

<script>
  import emojiReplace from '../../../filters/emojiReplace'
  import XVideo from '../../commons/Video'
  import constants from '../../../constants/'
  import Dialog from '../../commons/Dialog/'

  export default {
    components: {
      Dialog,
      XVideo
    },
    data () {
      return {
        dialogImg: '',
        showDialog: false,
        showText: false,
        content: '',
        showImg: false,
        imgUrl: '',
        showBlackBoard: false
      }
    },
    filters: {
      emojiReplace
    },
    props: {
      videoUrl: {
        type: String,
        twoWay: true
      },
      videoMic: {
        type: Boolean,
        twoWay: true
      }
    },
    created () {
      let liveChannel = (this.channelsLive && this.channelsLive[this.curChannelId]) || this.channels[this.curChannelId]
      this.showBlackBoard = liveChannel.blackboard_status === 1
    },
    vuex: {
      getters: {
        channels: state => state.channel.channels,
        channelsLiveStatus: state => state.channel.channelsLiveStatus,
        curChannelId: state => state.channel.curChannelId,
        channelsLive: state => state.channel.channelsLive,
        blackBoardMessage: state => state.message.blackBoardMessage
      }
    },
    watch: {
      curChannelId () {
        const liveChannel = this.channelsLive[this.curChannelId]
        if (!liveChannel) {
          return
        }
        this.content = ''
        this.imgUrl = ''
        this.showBlackBoard = liveChannel.blackboard_status
      },

      blackBoardMessage () {
        let mes = this.blackBoardMessage
        if (!mes) {
          return
        }
        if (mes.media_type === constants.MEDIA_TEXT) {
          this.showText = true
          this.showImg = false
          this.content = mes.content
        } else if (mes.media_type === constants.MEDIA_PHOTO) {
          this.showText = false
          this.showImg = true
          this.imgUrl = mes.content
        }
      },

      channelsLiveStatus () {
        const liveChannel = this.channelsLive[this.curChannelId]
        if (!liveChannel) {
          return
        }

        const liveUrl = liveChannel.live_play_url
        const liveMicState = liveChannel.live_mic_status
        this.showBlackBoard = liveChannel.blackboard_status

        if (liveChannel && liveUrl) {
          this.$dispatch('openRightPannel') // to components/layouts/Container
          this.$dispatch('openLiveVideo', liveUrl, liveMicState) // to components/layouts/Container/
        } else {
          this.$dispatch('closeRightPannel')
        }
      }
    }
  }
</script>

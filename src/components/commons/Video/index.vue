<style lang="scss">
  @import './index';
</style>

<template>
  <div class="xvideo-module">
    <div id="playerContainer"></div>
    <div class="player-tip" v-if="showPlayerTip">{{ playerTip }}</div>

    <dialog :show.sync="showDialog">
      <div class="dialog-tip-con">
        <div class="dialog-tip-head">
          <span>提示</span>
        </div>
        <i class="close-notice icon" @click="showDialog = false"></i>
        <hr class="line">
        <div class="dialog-tip-body">直播已经开始，请点击右侧的<span>「播放按钮」</span>进行收听吧~</div>
      </div>
    </dialog>
  </div>
</template>

<script>
  import cyberPlayer from './cyberplayer'
  import array from 'lodash/array'
  import Dialog from '../Dialog/'
  import { ENV, USER_INFO_KEY } from '../../../configs/'
  import logger from '../../../utils/logger'
  import storage from '../../../utils/storage'
  import constants from '../../../constants/'

  export default {
    data () {
      return {
        player: null,
        showDialog: false,
        showPlayerTip: false,
        playerTip: '主讲人关闭了麦克风，请稍等...'
      }
    },
    components: {
      Dialog
    },
    props: {
      url: {
        type: String,
        twoWay: true,
        required: true
      },
      mic: {
        type: Boolean,
        twoWay: true,
        required: true
      }
    },
    ready () {
      let curChannel = this.channelsLive[this.curChannelId]

      if (this.player) {
        this.player = null
      }
      // console.log(this.url, this.mic)
      if (this.url && this.mic) {
        if (this._getRoleStatus && this.deviceId === curChannel.live_device_id) {
          try {
            window.mymedia.openMicClicked(this.url)
          } catch (err) {
            console && console.log(err)
          }

          this.playerTip = '您已开启了麦克风，请直播吧~'
          this.showPlayerTip = true
          return
        }
        this.showDialog = true
        logger.print('live url: ', this.url)
        this.playVideo(this.url)
      } else {
        this.showPlayerTip = true
      }
    },
    vuex: {
      getters: {
        deviceId: state => state.globals.deviceId,
        curChannelId: state => state.channel.curChannelId,
        channels: state => state.channel.channels,
        channelsLive: state => state.channel.channelsLive,
        channelRoleInfo: state => state.channel.channelRoleInfo
      }
    },
    watch: {
      url () {
        let curChannel = this.channelsLive[this.curChannelId]

        if (!this.mic) {
          this.player && this.player.remove()
          this.playerTip = '主讲人关闭了麦克风，请稍等...'
          this.showPlayerTip = true
          return
        }
        if (this._getRoleStatus && this.deviceId === curChannel.live_device_id) {
          this.playerTip = '您已开启了麦克风，请直播吧~'
          this.showPlayerTip = true
          return
        }
        this.showPlayerTip = false
        this.playVideo(this.url)
        logger.print('live url: ', this.url)
        ENV.indexOf('dev') === -1 && window.sa.track('evt_join_live')
      },
      mic () {
        let curChannel = this.channelsLive[this.curChannelId]

        if (this.mic) {
          if (this._getRoleStatus && this.deviceId === curChannel.live_device_id) {
            this.playerTip = '您已开启了麦克风，请直播吧~'
            this.showPlayerTip = true
            return
          }
          this.playVideo(this.url)
          this.showPlayerTip = false
          this.showDialog = true
        } else {
          this.player && this.player.remove()
          this.playerTip = '主讲人关闭了麦克风，请稍等...'
          this.showPlayerTip = true
        }
      },
      curChannelId () {
        let curChannel = this.channelsLive[this.curChannelId]
        if (curChannel && curChannel.live_play_url && curChannel.live_mic_status) {
          this.playVideo(curChannel.live_play_url)
          logger.print('live url: ', curChannel.live_play_url)
          ENV.indexOf('dev') === -1 && window.sa.track('evt_join_live')
        } else if (this.player) {
          this.player.remove()
        }
      }
    },
    methods: {
      playVideo (url) {
        this.player = cyberPlayer('playerContainer').setup({
          flashplayer: 'https://o3pvuu23u.qnssl.com/swf/cyberplayer.flash.swf',
          width: 349,
          height: 200,
          autostart: true,
          stretching: 'none',
          file: url,
          ak: 'b2d09fbd6b774177957fb4c3aa6f53f6',
          autoStart: true,
          repeat: false,
          volume: 100,
          rtmp: {
            reconnecttime: 5
          }
        })
        this.player.on('complete', () => { // 当发生流断了以后，需要重新连接上。
          this.player.play()
        })
      },

      _getRoleStatus () {
        let roles = []
        let isGrouper = false
        let isReporter = false
        let data = this.channels[this.curChannelId]
        let user = storage.get(USER_INFO_KEY)
        let userId = user.id // 当前登录的用户ID
        let channelId = data.id   // 当前的channelId
        let roleInfo = this.channelRoleInfo[channelId]
        roles = array.concat(roles, roleInfo.permanent, roleInfo.temporary)

        for (let item of roles) {
          if (item.user_id === userId && (
              item.role_code === constants.ROLE_OWNER ||
              item.role_code === constants.ROLE_ADMIN)
            ) {
            isGrouper = true
          }

          if (item.user_id === userId && (
              item.role_code === constants.ROLE_SPEAKER_MASTER)
            ) {
            isReporter = true
          }
        }
        return isGrouper || isReporter
      }
    }
  }
</script>

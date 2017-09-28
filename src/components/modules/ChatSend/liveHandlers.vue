<template>
  <div class="chat-handle-input">
    <i
      title="上传录音"
      class="chat-upload-mp3 icon"
      v-if="showLiveActive && showMicActive">
      <i
        class="forbidden-mask cursor-forbidden"
        v-bind:class="{'hide': showMicActive}"
        ></i>
      <upload-mp3 :callback.sync="sendMp3File"></upload-mp3>
    </i>
    <a
      class="chat-live-handle hint--top"
      href="javascript:void(0)"
      aria-label="{{ !showLiveActive ? '开启' : '关闭' }}直播"
      v-if="isGrouper"
      v-bind:class="{'active': showLiveActive}"
      @click="openDialog('直播')">
      <i class="icon"></i>
    </a>
    <a
      class="chat-blackboard-handle hint--top"
      href="javascript:void(0)"
      aria-label="{{ !showBlackBoardActive ? '开启' : '关闭' }}小黑板"
      v-if="showLiveActive && isReporter"
      v-bind:class="{'active': showBlackBoardActive, 'cursor-forbidden': !showLiveActive}"
      @click="openDialog('小黑板')">
      <i class="icon"></i>
    </a>
    <a
      class="chat-mic-handle hint--top"
      href="javascript:void(0)"
      aria-label="{{ !showMicActive ? '开启' : '关闭' }}麦克风"
      v-if="showLiveActive"
      v-bind:class="{'active': showMicActive, 'cursor-forbidden': !showLiveActive}"
      @click="openDialog('麦克风')">
      <i class="icon"></i>
    </a>
    <a
      class="chat-can-handle hint--top"
      href="javascript:void(0)"
      aria-label="{{ !showCanChatActive ? '开启' : '关闭' }}全体禁言"
      v-if="isReporter || isGrouper"
      v-bind:class="{'active': showCanChatActive}"
      @click="openDialog('全体禁言')">
      <i class="icon"></i>
    </a>

    <dialog :show.sync="showDialog">
      <div class="dialog-tip-con">
        <div class="dialog-tip-head">
          <span>提示</span>
        </div>
        <i class="close-notice icon" @click="showDialog = false"></i>
        <hr class="line">
        <div class="dialog-tip-body">
          <div class="content">{{ dialogContent }}</div>
          <div class="tip">{{ dialogTip }}</div>
          <div class="submit">
            <a href="javascript:void(0)" @click="dialogSubmit">{{ dialogSubmitText }}</a>
          </div>
        </div>
      </div>
    </dialog>

    <dialog :show.sync="showTip">
      <div class="dialog-tip-con">
        <div class="dialog-tip-head">
          <span>提示</span>
        </div>
        <i class="close-notice icon" @click="showTip = false"></i>
        <hr class="line">
        <div class="dialog-tip-body">
          <div class="content">{{ tipContent }}</div>
          <div class="tip"></div>
        </div>
      </div>
    </dialog>

  </div>
</template>

<script>
  import $ from 'jquery'
  import UploadMp3 from '../../commons/UploadMp3/'
  import Dialog from '../../commons/Dialog/'
  import {
    toggleLive,
    toggleMic,
    sendFile,
    toggleCanChat,
    toggleBlackBoard
  } from '../../../vuex/actions'

  export default {
    data () {
      return {
        dialogContent: '',
        dialogTip: '',
        dialogSubmitType: '',
        dialogSubmitText: '确定',
        dialogSubmiting: false,
        showDialog: false,
        liveTitle: '',
        micTitle: '',
        blackBoardTitle: '',
        canChatTitle: '',
        showTip: false,
        tipContent: ''
      }
    },
    props: {
      isGrouper: {
        type: Boolean,
        required: true,
        twoWay: true
      },
      isReporter: {
        type: Boolean,
        required: true,
        twoWay: true
      },
      showLiveActive: {
        type: Boolean,
        required: true,
        twoWay: true
      },
      showMicActive: {
        type: Boolean,
        required: true,
        twoWay: true
      },
      showBlackBoardActive: {
        type: Boolean,
        required: true,
        twoWay: true
      },
      showCanChatActive: {
        type: Boolean,
        required: true,
        twoWay: true
      }
    },
    components: {
      UploadMp3,
      Dialog
    },
    vuex: {
      actions: {
        toggleLive,
        toggleMic,
        sendFile,
        toggleCanChat,
        toggleBlackBoard
      },
      getters: {
        channels: state => state.channel.channels,
        channelsLive: state => state.channel.channelsLive,
        curChannelId: state => state.channel.curChannelId,
        handlerStatus: state => state.channel.handlerStatus,
        channelsLiveStatus: state => state.channel.channelsLiveStatus,
        chatForbiddenStatus: state => state.channel.chatForbiddenStatus
      }
    },
    watch: {
      curChannelId () {
        const curLiveChannel = this.channels[this.curChannelId]
        this.showCanChatActive = curLiveChannel.mute_anything === 1 // 全体禁言 0：关闭， 1：开启。禁言未开启 或者
      },
      chatForbiddenStatus () {
        const curLiveChannel = this.channels[this.curChannelId]
        this.showCanChatActive = curLiveChannel.mute_anything === 1 // 全体禁言 0：关闭， 1：开启。禁言未开启 或者
      }
    },
    methods: {
      _toggleLiveBoard () {
        const liveStatus = !this.showLiveActive
        const toggleLiveStatus = (data) => {
          this.showLiveActive = liveStatus
          if (!liveStatus) { // 关闭直播，也需要自动关闭麦克风和小黑板
            this.showMicActive = false
            this.showBlackBoardActive = false
          } else {
            const liveUrl = data.live_play_url
            const liveMicState = data.live_mic_status
            !!liveUrl && this.$dispatch('openRightPannel') && this.$dispatch('openLiveVideo', liveUrl, liveMicState)
          }
          this.showDialog = false
          setTimeout(() => {
            this.dialogSubmiting = false
            this.dialogSubmitText = '确定'
          }, 1000)
        }
        this.toggleLive(liveStatus, toggleLiveStatus)
      },

      _toggleMicBoard () {
        const micStatue = !this.showMicActive
        const toggleMicStatus = () => {
          this.showMicActive = micStatue
          this.showDialog = false
          setTimeout(() => {
            this.dialogSubmiting = false
            this.dialogSubmitText = '确定'
          }, 1000)
        }
        const curLiveChannel = this.channelsLive[this.curChannelId]
        this.toggleMic(micStatue, toggleMicStatus, curLiveChannel.rtmp_publish_url)
      },

      _toggleBlackBoardActive () {
        const blackBoardStatus = !this.showBlackBoardActive
        const toggleBlackBoardStatus = () => {
          this.showBlackBoardActive = blackBoardStatus
          this.showDialog = false
          setTimeout(() => {
            this.dialogSubmiting = false
            this.dialogSubmitText = '确定'
          }, 1000)
          blackBoardStatus ? $('#moduleBlackBoard').show() : $('#moduleBlackBoard').hide()
        }
        this.toggleBlackBoard(blackBoardStatus, toggleBlackBoardStatus)
      },

      _toggleCanChatActive () {
        const canChatStatue = !this.showCanChatActive
        const toggleCanChatStatus = () => {
          this.showCanChatActive = canChatStatue
          this.showDialog = false
          setTimeout(() => {
            this.dialogSubmiting = false
            this.dialogSubmitText = '确定'
          }, 1000)
        }
        this.toggleCanChat(canChatStatue, toggleCanChatStatus)
      },

      openDialog (type) {
        let handler = ''
        let tip = ''

        switch (type) {
          case '直播':
            if (!this.isGrouper) {
              this.showTip = true
              this.tipContent = '只有群主和管理员可以关闭直播'
              return
            }
            handler = this.showLiveActive ? '关闭' : '开启'
            this.liveTitle = `${handler}${type}`
            break
          case '麦克风':
            if (!this.showLiveActive) {
              return
            }
            if (!this.isReporter && !this.showMicActive) {
              this.showTip = true
              this.tipContent = '只有演讲者可以开启麦克风'
              return
            }
            handler = this.showMicActive ? '关闭' : '开启'
            this.micTitle = `${handler}${type}`
            if (!this.showMicActive) {
              tip = ''
            }
            break
          case '小黑板':
            if (!this.showLiveActive) {
              return
            }
            if (!this.isReporter) {
              return
            }
            handler = this.showBlackBoardActive ? '关闭' : '开启'
            this.blackBoardTitle = `${handler}${type}`
            break
          case '全体禁言':
            handler = this.showCanChatActive ? '关闭' : '开启'
            this.canChatTitle = `${handler}${type}`
            break
        }

        this.dialogContent = `您确定${handler}${type}？`
        this.dialogTip = tip
        this.dialogSubmitType = type
        this.showDialog = true
      },

      dialogSubmit () {
        if (this.dialogSubmiting) {
          return
        }

        this.dialogSubmiting = true
        this.dialogSubmitText = '正在处理...'

        switch (this.dialogSubmitType) {
          case '直播':
            this._toggleLiveBoard()
            break
          case '麦克风':
            this._toggleMicBoard()
            break
          case '小黑板':
            this._toggleBlackBoardActive()
            break
          case '全体禁言':
            this._toggleCanChatActive()
            break
        }
      },

      sendMp3File (filePath) {
        const initLiveChannel = this.channels[this.curChannelId]
        const curLiveChannel = this.channelsLive[this.curChannelId]
        let liveUrl = ''
        if (curLiveChannel) {
          liveUrl = curLiveChannel.rtmp_publish_url
        } else {
          liveUrl = initLiveChannel.rtmp_publish_url
        }
        this.sendFile(filePath, liveUrl)
      }
    }
  }
</script>
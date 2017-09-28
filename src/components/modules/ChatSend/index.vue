<style lang="scss">
  @import "./index";
</style>

<template>
  <div class="modules-chat-send" v-if="showChatSend">
    <div class="chat-forbidden" v-show="showChatForbidden">
      <div><i class="icon"></i>当前为全体禁言模式，不能说话</div>
    </div>
    <div class="chat-forbidden" v-show="showPublicForbidden">
      <div><i class="icon"></i>{{ textPublicForbidden }}</div>
    </div>
    <div class="chat-forbidden" v-show="showAuthForbidden">
      <div><i class="icon"></i>请先使用手机端进行实名认证</div>
    </div>
    <div class="chat-handle">
      <i title="表情" class="chat-emoji icon" @click="showEmoji = true"></i>
      <i title="上传图片" class="chat-upload-img icon" @click='uploadChannelId = curChannelId'><upload-img :channel-id.sync="uploadChannelId"></upload-img></i>
      <emoji :show.sync="showEmoji" :choose-word="ChooseWordEmoji"></emoji>
      <live-handlers
        v-if="isElectronClient && (isGrouper || isReporter)"
        :is-grouper.sync="isGrouper"
        :is-reporter.sync="isReporter"
        :show-live-active.sync="showLiveActive"
        :show-mic-active.sync="showMicActive"
        :show-black-board-active.sync="showBlackBoardActive"
        :show-can-chat-active.sync="showCanChatActive"
      ></live-handlers>
    </div>
    <textarea class="chat-box" placeholder="说点儿什么…" v-model="messageText" @keydown.enter="sendText($event)"></textarea>
  </div>
</template>

<script>
  import $ from 'jquery'
  import xss from 'xss'
  import NProgress from 'nprogress'
  import Emoji from '../Emoji/'
  import array from 'lodash/array'
  import storage from '../../../utils/storage'
  // import pasteImg from '../../../utils/pasteImg'
  import emojiUtil from '../../../utils/emoji'
  import constants from '../../../constants/'
  import { USER_INFO_KEY } from '../../../configs/'
  import {
    sendMessage,
    destoryFriendStatus,
    toggleMic,
    setChannelForbiddenNow
  } from '../../../vuex/actions'
  import LiveHandlers from './liveHandlers'
  import UploadImg from '../../commons/UploadImg/'

  export default {
    data () {
      return {
        uploadChannelId: '',
        showAuthForbidden: false,
        showPublicForbidden: false,
        textPublicForbidden: '',
        showChatForbidden: false,
        showEmoji: false,
        showChatSend: false,
        messageText: '',
        showHandleLive: false,
        isGrouper: false,
        isReporter: false,
        showLiveActive: false,
        showMicActive: false,
        showBlackBoardActive: false,
        isElectronClient: false,
        sending: false
      }
    },
    components: {
      UploadImg,
      Emoji,
      LiveHandlers
    },
    vuex: {
      actions: {
        sendMessage,
        destoryFriendStatus,
        toggleMic,
        setChannelForbiddenNow
      },
      getters: {
        curChannelFriendStatus: state => state.channel.curChannelFriendStatus,
        channels: state => state.channel.channels,
        channelsLiveStatus: state => state.channel.channelsLiveStatus,
        channelsLive: state => state.channel.channelsLive,
        chatForbiddenStatus: state => state.channel.chatForbiddenStatus,
        channelRoleInfo: state => state.channel.channelRoleInfo,
        curChannelId: state => state.channel.curChannelId,
        handlerStatus: state => state.channel.handlerStatus
      }
    },
    created () {
      try {
        if (window.clientInfo) {
          this.isElectronClient = window.clientInfo.getVersion()
        } else if (window.localStorage.getItem('tinfinite-electron') === '*') {
          this.isElectronClient = true
        }
      } catch (err) {
        console && console.log(err)
      }
    },
    ready () {
      // pasteImg((imgBase64) => {
        // console.log(imgBase64) // 这里需要做图片焦点判断
      // })
    },
    events: {
      hideEmojiPannel () { // from components/layouts/Container/
        this.showEmoji = false
      },
      uploadHide () {
        $('#nprogress').hide()
        NProgress.done()
      },
      uploadBefore (extend) {
        $('#nprogress').show()
        NProgress.configure({ parent: '.modules-chat-send' }).start()
      },
      uploadFail () { // 发送失败
        $('#nprogress').hide()
        NProgress.done()
      },
      uploadComplete (uploadChannelId, data, extend) { // from components/commons/UploadImg
        this.sendMessage('photo', uploadChannelId, data.photo, extend, (res) => {
          NProgress.done()
          if (+res.code === 270000005) { // 当前为禁言模式
            this.showChatForbidden = true
            this.setChannelForbiddenNow()
            this.sending = false
            window.alert(res.message)
            return
          }
        })
      }
    },
    watch: {
      curChannelId () {
        this.showChatSend = true
        let userInfo = storage.get(USER_INFO_KEY)
        let curChannel = this.channels[this.curChannelId]

        if (userInfo.verify && userInfo.verify.status !== 1) {
          this.showAuthForbidden = true
          return
        }

        if (curChannel.type === constants.GROUP_CHANNEL) { // 群聊的时候不用走好友关系验证逻辑
          this.showPublicForbidden = false
        }

        this._listenLiveStatus()
      },

      chatForbiddenStatus () {
        this._dealForbidden(this.channels[this.curChannelId])
      },

      curChannelFriendStatus () {
        if (this.curChannelFriendStatus === null) {
          return
        }

        switch (this.curChannelFriendStatus) {
          case constants.IS_FRIEND: // 好友
            this.showPublicForbidden = false
            break
          case constants.NO_FRIEND: // 不是好友
          case constants.DELETED_FRIEND: // 我已经被删除
            this.showPublicForbidden = true
            this.textPublicForbidden = '您还不是 TA 的朋友，请通过手机 APP 添加对方为好友吧'
            break
          case constants.APPLYING_FRIEND: // 正在申请中
            this.showPublicForbidden = true
            this.textPublicForbidden = '您已发送好友申请，请等待对方验证通过'
            break
          case constants.APPLYED_FRIEND: // 对方向我发送邀请，我还未接受
            this.showPublicForbidden = true
            this.textPublicForbidden = '对方已向您发送了好友申请，请通过手机 APP 验证通过吧'
            break
        }
        this.destoryFriendStatus()
      },

      handlerStatus () { // 演讲者状态发生改变
        try {
          if (this.isReporter) {
            window.mymedia.stopRecordClicked()
          }
        } catch (err) {
          console && console.log(err)
        }

        this._listenLiveStatus()
      },
      channelsLiveStatus () {
        this._listenLiveStatus()
      }
    },
    methods: {
      _listenLiveStatus () {
        if (!this.curChannelId) {
          return
        }
        const curChannel = this.channels[this.curChannelId] || this.channelsLive[this.curChannelId]
        if (!curChannel) {
          return
        }
        this.isGrouper = false
        this.isReporter = false
        this._dealForbidden(curChannel)
        this._showHandleBtns(curChannel)
        this._updateHandlerBtns()
      },
      ChooseWordEmoji (word) {
        this.messageText += word
        $('.chat-box').focus()
      },
      sendText (event) {
        if (this.sending) {
          window.alert('系统繁忙！')
          event.preventDefault()
          return
        }
        if ($('.global-error-tip').css('display') !== 'none') {
          event.preventDefault()
          return
        }
        if (event.shiftKey) {
          return
        } else {
          if ($.trim(this.messageText) === '') {
            return
          }
          let text = $('<div/>').text($.trim(this.messageText)).html()
          let xssText = xss(text, {
            whiteList: [],
            stripIgnoreTag: true,
            stripIgnoreTagBody: ['script']
          })
          if (!xssText) {
            window.alert('文本中包含非法字符，请重新输入！')
            return
          }
          this.sending = true
          this.sendMessage('text', this.curChannelId, emojiUtil.replace_colons_ex(text), {}, (res) => {
            this.$dispatch('handChatSend')
            if (+res.code === 270000005) { // 当前为禁言模式
              this.showChatForbidden = true
              this.setChannelForbiddenNow()
              this.sending = false
              window.alert(res.message)
              return
            }
            this.sending = false
            this.messageText = ''
          })
        }
      },
      _dealForbidden (data) { // 只有演讲者可以发送信息
        this.showChatForbidden = false // 不显示禁言遮罩
        if (!data.id) {
          return
        }
        if (data.mute_anything !== 1) { // 全体禁言 0：关闭， 1：开启。禁言未开启 或者 设置禁言关闭
          return
        }
        let roles = []
        let user = storage.get(USER_INFO_KEY)
        let userId = user.id // 当前登录的用户ID
        let channelId = data.id   // 当前的channelId
        let roleInfo = this.channelRoleInfo[channelId]
        let flag = false
        roles = array.concat(roles, roleInfo.permanent, roleInfo.temporary)

        for (let item of roles) {
          if (item.unUsed) { // 废弃的
            continue
          }

          if (item.user_id === userId && (
              item.role_code === constants.ROLE_OWNER ||
              item.role_code === constants.ROLE_ADMIN ||
              item.role_code === constants.ROLE_SPEAKER_DEFAULT ||
              item.role_code === constants.ROLE_SPEAKER ||
              item.role_code === constants.ROLE_SPEAKER_MASTER)
            ) {
            flag = true // （群主 || 管理员 || 演讲者）
            break
          }
        }
        this.showChatForbidden = !flag
      },
      _showHandleBtns (data) {
        let roles = []
        let repoterFlag = false // 第一次打开直播的时候，后端不会吐出演讲者数据，默认为群主，这里需要标记判断
        let user = storage.get(USER_INFO_KEY)
        let userId = user.id // 当前登录的用户ID
        let channelId = data.id   // 当前的channelId
        let roleInfo = this.channelRoleInfo[channelId] || {permanent: [], temporary: []}
        roles = array.concat(roles, roleInfo.permanent, roleInfo.temporary)

        for (let item of roles) {
          if (item.unUsed) { // 废弃的
            continue
          }

          if (item.user_id === userId && (
              item.role_code === constants.ROLE_OWNER ||
              item.role_code === constants.ROLE_ADMIN)
            ) {
            this.isGrouper = true
          }

          if (item.user_id === userId && (
              item.role_code === constants.ROLE_SPEAKER_MASTER ||
              item.role_code === constants.ROLE_SPEAKER_DEFAULT ||
              item.role_code === constants.ROLE_SPEAKER)
            ) {
            this.isReporter = true
          }

          if (item.role_code === constants.ROLE_SPEAKER_MASTER ||
              item.role_code === constants.ROLE_SPEAKER_DEFAULT ||
              item.role_code === constants.ROLE_SPEAKER) {
            repoterFlag = true
          }
        }

        if (!repoterFlag && this.isGrouper) { // 如果没有演讲者数据，且当前用户为群主或管理员，则默认为该用户为演讲者
          this.isReporter = true
        }
      },
      _updateHandlerBtns () {
        const curChannel = this.channels[this.curChannelId]
        const curLiveChannel = this.channelsLive[this.curChannelId] || curChannel

        this.showLiveActive = !!curLiveChannel.live_play_url
        this.showMicActive = curLiveChannel.live_mic_status === 1
        this.showBlackBoardActive = curLiveChannel.blackboard_status === 1
        this.showCanChatActive = curChannel.mute_anything === 1 // 全体禁言 0：关闭， 1：开启。禁言未开启 或者
      }
    }
  }
</script>
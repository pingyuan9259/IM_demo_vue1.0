<template>
  <div
    class="message-text-con"
    v-if="message._status !== -1"
    v-bind:class="{'black-board-active': isReporter}"
    >
    <div
      class="message-item-avatar"
      @click="showNameCard = true">
      <img class="message-avatar-img"
        :src="user && user[message.creator || message.user_id] && imgProtocol((user[message.creator || message.user_id].avatar || defaultAvatar)) + '?imageMogr2/thumbnail/160'">
      <name-card
        :pre-show.sync="showNameCard"
        :user="user && user[message.creator || message.user_id]"></name-card>
    </div>

    <div class="message-item-info">
      <div class="message-name-datetime">
        <span class="message-item-name"><span class="flag-grouper flag-user" v-if=" channelsGroupPr && channelsGroupPr[message.creator || message.user_id] === isGrouper">群主</span><span class="flag-manager flag-user" v-if="channelsGroupPr && channelsGroupPr[message.creator || message.user_id] === isMananger">管理员</span> {{ user && user[message.creator || message.user_id] && user[message.creator || message.user_id].fullname }}</span>
        <span class="message-item-datetime">{{ message.created_at | dateFormat 'HH:mm:ss'}}</span>
        <div class="message-handlers" v-if="(message.media_type === media_text || message.media_type === media_photo) && showBlackBoardActive && isElectronClient">
          <span class="send-black-board" @click="showMessageMenu($event)">∙∙∙
          </span>
          <ul class="message-menus">
            <li @click="sendBlackBoard(message.id)">发送小黑板</li>
          </ul>
        </div>
      </div>

      <div class="message-item-content">
        <pre
          v-if="message.media_type === media_text"
          :data-tseq="message.tseq"
          data-html="{{ message.content }}" v-html="message.content | linkReplace | emojiReplace">
        </pre>

        <img
          height="{{ relativeWH(message.extend, 'h') }}"
          v-if="message.media_type === media_photo" v-lazyload="message.content && imgProtocol(message.content)"
          src="//o3pvuu23u.qnssl.com/image/loading.gif"
          @click="dialogImg = message.content, showDialog = true">

        <a
          v-if="message.media_type === media_link"
          target="_blank"
          :href="message.content">{{ message.content }}
        </a>

        <div
          v-if="message.media_type !== media_text && message.media_type !== media_photo && message.media_type !== media_link">
          <span class="no-support-message">当前版本暂不支持，请在手机上查看</span>
        </div>
      </div>
    </div>
  </div>

  <dialog :show.sync="showDialog">
    <img :src="dialogImg" alt="">
  </dialog>
</template>

<script>
  import $ from 'jquery'
  import array from 'lodash/array'
  import storage from '../../../utils/storage'
  import constants from '../../../constants/'
  import NameCard from '../NameCard/'
  import Dialog from '../../commons/Dialog/'
  import dateFormat from '../../../filters/dateFormat'
  import linkReplace from '../../../filters/linkReplace'
  import imgProtocol from '../../../filters/imgProtocol'
  import emojiReplace from '../../../filters/emojiReplace'
  import { DEFAULT_GROUP_AVATAR, USER_INFO_KEY } from '../../../configs/'

  import { arrToObjByKey } from '../../../utils/enhance'
  import {
      sendMesToBlackBoard
  } from '../../../vuex/actions'

  $(document.body).delegate('.message-menus', 'mouseout', (event) => {
    $(event.target).parents('ul').hide()
  })

  export default {
    data () {
      return {
        isReporter: false,
        dialogImg: '',
        showDialog: false,
        media_text: constants.MEDIA_TEXT,
        media_photo: constants.MEDIA_PHOTO,
        media_link: constants.MEDIA_LINK,
        showNameCard: false,
        defaultAvatar: DEFAULT_GROUP_AVATAR,
        imgProtocol,
        showBlackBoardActive: false,
        isGrouper: constants.ROLE_OWNER,
        isMananger: constants.ROLE_ADMIN,
        isElectronClient: false
      }
    },

    components: {
      NameCard,
      Dialog
    },

    vuex: {
      actions: {
        sendMesToBlackBoard
      },

      getters: {
        curChannelId: state => state.channel.curChannelId,
        channels: state => state.channel.channels,
        channelRoleInfo: state => state.channel.channelRoleInfo,
        messageStatus: state => state.message.messageStatus,
        modifiedMessage: state => state.message.modifiedMessage,
        user: state => arrToObjByKey('id', state.user.usersInfoStorage),
        handlerStatus: state => state.channel.handlerStatus,
        channelsLiveStatus: state => state.channel.channelsLiveStatus,
        channelsLive: state => state.channel.channelsLive,
        channelsGroupPr: state => state.channel.channelsGroupPr[state.channel.curChannelId]
      }
    },

    created () {
      const curLiveChannel = this.channelsLive[this.curChannelId]
      const curChannel = this.channels[this.curChannelId]
      this.showBlackBoardActive = curLiveChannel ? curLiveChannel.blackboard_status === 1 : curChannel.blackboard_status === 1

      if (window.clientInfo) {
        this.isElectronClient = window.clientInfo.getVersion()
      } else if (window.localStorage.getItem('tinfinite-electron') === '*') {
        this.isElectronClient = true
      }

      this.judgeReporter(curChannel)
    },

    props: {
      message: {
        type: Object,
        required: true,
        twoWay: true
      }
    },

    filters: {
      dateFormat,
      linkReplace,
      emojiReplace
    },

    watch: {
      curChannelId () {
        this.judgeReporter(this.channels[this.curChannelId])
      },
      handlerStatus () {
        this.judgeReporter(this.channels[this.curChannelId])
      },
      messageStatus () {
        if (this.message.id === this.modifiedMessage.id) {
          this.message = this.modifiedMessage
        }
      },
      channelsLiveStatus () {
        const curLiveChannel = this.channelsLive[this.curChannelId]
        this.showBlackBoardActive = curLiveChannel.blackboard_status === 1
      }
    },

    methods: {
      relativeWH (extend, type) {
        if (!extend || !type) {
          return ''
        }

        let w = extend.img_w
        let h = extend.img_h

        if (!w || !h) {
          return ''
        }

        let maxWidth = 400
        let width = 0
        let height = 0

        if (w <= maxWidth) {
          width = w
          height = h
        } else {
          width = maxWidth
          height = h * maxWidth / w
        }

        if (type === 'w') {
          return width
        } else if (type === 'h') {
          return height
        }
      },

      sendBlackBoard (messageId) {
        this.sendMesToBlackBoard(this.curChannelId, messageId, () => {
          $('.message-menus').hide()
        })
      },

      showMessageMenu (event) {
        $(event.target).next().show()
      },

      judgeReporter (data) {
        let roles = []
        let user = storage.get(USER_INFO_KEY)
        let userId = user.id // 当前登录的用户ID
        let channelId = data.id   // 当前的channelId
        let roleInfo = this.channelRoleInfo[channelId] || {permanent: [], temporary: []}
        roles = array.concat(roles, roleInfo.permanent, roleInfo.temporary)

        this.isReporter = false

        for (let item of roles) {
          if (item.unUsed) { // 废弃的
            continue
          }

          if (item.user_id === userId && (
              item.role_code === constants.ROLE_SPEAKER_MASTER ||
              item.role_code === constants.ROLE_SPEAKER_DEFAULT ||
              item.role_code === constants.ROLE_SPEAKER)
            ) {
            this.isReporter = true
          }
        }
      }
    }
  }
</script>

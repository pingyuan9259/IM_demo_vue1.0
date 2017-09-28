<style lang="scss">
  @import './index';
</style>

<template>
  <div class="module-channel-list">
    <ul class="channel-list-con">
      <li
        class="channel-list-item"
        data-item="{{ key }}"
        v-bind:class="{ 'active': activeIndex === $index, 'to-top': channelsLocal[key] && channelsLocal[key].is_top === 1 }"
        v-for="key in channelsIndex"
        track-by= "$index"
        @click="changeChannel($event, $index, key)"
      >
        <div class="channel-item-avatar">
          <div v-if="channelsLocal[key] && channelsLocal[key].unRead !== undefined && channelsLocal[key].unRead !== 0">
            <span v-if="channelsLocal[key] && channelsLocal[key].notification !== 1" class="message-unread-disturb"></span>
            <span v-else class="message-unread" :class="{'one': channelsLocal[key] && channelsLocal[key].unRead < 10, 'two': channelsLocal[key] && channelsLocal[key].unRead >= 10, 'more': channelsLocal[key] && channelsLocal[key].unRead > 99}">{{ channelsLocal[key] && channelsLocal[key].unRead > 99 ? '...' : (channelsLocal[key] && channelsLocal[key].unRead) }}</span>
          </div>
          <div class="item-avatar-con">
            <img v-if="channelsLocal[key] && channelsLocal[key].type === gourpChannel" :src="channelsLocal[key] && imgProtocol((channelsLocal[key].avatar || defaultPersonAvatar) + '?imageMogr2/thumbnail/160')">
            <img v-else :src="(channelsLocal[key] && imgProtocol(channelsLocal[key].avatar) || (channelsLocal[key] && user && user[channelsLocal[key].user_id] && imgProtocol(user[channelsLocal[key].user_id].avatar) || defaultGrouplAvatar) + '?imageMogr2/thumbnail/160')">
          </div>
        </div>
        <div class="channel-item-info">
          <div class="item-info">{{ channelsLocal[key] && (channelsLocal[key].name || (user && user[channelsLocal[key].user_id] && user[channelsLocal[key].user_id].fullname)) || '公开会议室' }}</div>
          <div class="item-info last-message" v-html="getLastMessageHtml(key)"></div>
          <i v-if="channelsLocal[key] && channelsLocal[key].notification !== 1" class="icon"></i>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
  import $ from 'jquery'
  import array from 'lodash/array'
  import constants from '../../../constants/'
  import emoji from '../../../utils/emoji'
  import imgProtocol from '../../../filters/imgProtocol'
  import { DEFAULT_PERSON_AVATAR, DEFAULT_GROUP_AVATAR } from '../../../configs/'
  import { arrToObjByKey } from '../../../utils/enhance'

  import {
    getChannels,
    switchChannel,
    getFriendStatus,
    setSeqOfChannel,
    getUserInfoByIds,
    clearPostsByChannelId,
    clearPostsOfPerson,
    getRoleInfoOfChannels,
    changeRenderMessageSource,
    toggleMic
  } from '../../../vuex/actions'

  export default {
    data () {
      return {
        hasLive: false,
        lastChannelId: '',
        channelsLocal: {},
        defaultPersonAvatar: DEFAULT_PERSON_AVATAR,
        defaultGrouplAvatar: DEFAULT_GROUP_AVATAR,
        nowLastMessages: [],
        activeIndex: -1,
        gourpChannel: constants.GROUP_CHANNEL,
        imgProtocol
      }
    },
    vuex: {
      getters: {
        curChannelId: state => state.channel.curChannelId,
        channelRoleInfo: state => state.channel.channelRoleInfo,
        channels: state => state.channel.channels,
        channelsLive: state => state.channel.channelsLive,
        channelsIndex: state => state.channel.channelsIndex,
        channelIndexActive: state => state.channel.channelIndexActive,
        usersInfoStorage: state => state.user.usersInfoStorage,
        lastMessages: state => state.message.lastMessages,
        curChannelIdFromSingleChat: state => state.channel.curChannelIdFromSingleChat,
        user: state => arrToObjByKey('id', state.user.usersInfoStorage),
        deviceId: state => state.globals.deviceId
      },
      actions: {
        toggleMic,
        switchChannel,
        setSeqOfChannel,
        getChannels,
        getFriendStatus,
        getRoleInfoOfChannels,
        getUserInfoByIds,
        clearPostsByChannelId,
        clearPostsOfPerson,
        changeRenderMessageSource
      }
    },
    computed: {
      channelsLocal () {
        return this.channels
      }
    },
    created () {
      this.getChannels()
    },
    watch: {
      curChannelId () {
        this.setActive()
      },
      channelsIndex () {
        // $('.module-channel-list').scrollTop(0)
      },
      channels () {
        let groupChannelIds = []
        // 获取每个 channel 最后一条 message
        for (let key in this.channels) {
          let item = this.channels[key]

          if (item.type === this.gourpChannel) {
            groupChannelIds.push(item.id)
          }
        }

        // 获取新用户信息
        let newUserIds = this._getNewUserIds(this.channels)
        if (newUserIds.length > 0) {
          this.getUserInfoByIds(newUserIds)
        }

        // 获取每个群的角色信息
        this.getRoleInfoOfChannels(groupChannelIds)

        this.channelsLocal = this.channels

        this.$nextTick(() => {
          if (!this.curChannelId) {
            return
          }
          if (this.channels[this.curChannelId].is_top === 1) {
            // $('.module-channel-list').scrollTop(0)
          } else {
            // let index = array.findIndex(this.channelsIndex, (o) => o === this.curChannelId)
            // let scrollDis = $('.channel-list-item').height() * (index + 1) + 20 // heights + padding top & bottom
            // $('.module-channel-list').scrollTop(scrollDis)
          }
        })

        this.$dispatch('initCompleted')
        this.$dispatch('loginWithLoadingComplete')
      },
      lastMessages () {
        this.nowLastMessages = this.lastMessages
      },
      channelIndexActive () {
        let index = array.findIndex(this.channelsIndex, (o) => o === this.curChannelId)
        this.activeIndex = index
        // let scrollDis = $('.channel-list-item').height() * (index + 1)
        // $('.module-channel-list').scrollTop(scrollDis)
        // $('.module-channel-list').scrollTop(0)
        setTimeout(() => {
          if ($('.module-channel-list').scrollTop() !== 0) {
            $('.module-channel-list').scrollTop(0)
          }
        }, 50)
      }
    },
    methods: {
      changeChannel (event, index, key) {
        let isLeave = true
        let id = this.channels[key].id
        let userId = this.channels[key].user_id
        let channelType = this.channels[key].type
        let latestReadTseq = this.channels[key].latest_read_tseq

        if (this.curChannelIdFromSingleChat) { // 当在群成员列表中切换聊天信息时
          this.lastChannelId = this.curChannelId
        }

        if (this.curChannelId === id) {
          return
        }

        if (this.lastChannelId) { // 更新切换过去 channel 的 live 状态
          this.hasLive = this.channelsLive[this.lastChannelId] ? !!this.channelsLive[this.lastChannelId].live_play_url : false
        }

        if (this.hasLive) {
          isLeave = window.confirm('当前群组正在直播，确定离开吗？')
        }

        if (!isLeave) {
          return
        } else if (this.hasLive && this.deviceId === this.channelsLive[this.curChannelId].live_device_id) {
          const curLiveChannel = this.channelsLive[this.curChannelId]
          this.toggleMic(false, () => {}, curLiveChannel.rtmp_publish_url)
          try {
            window.mymedia && window.mymedia.stopRecordClicked()
          } catch (err) {
            console && console.log(err)
          }
          window.sa.track('evt_leave_live')
        }

        this.lastChannelId = key
        this.setActive(index)
        channelType !== this.gourpChannel && this.getFriendStatus(userId) // 获取当前单聊用户是否为好友
        this.changeRenderMessageSource(constants.RENDER_FIRST) // 标记当前消息为首次渲染
        this.switchChannel(id)
        this.setSeqOfChannel(id, latestReadTseq)
        this._hideUnRead(event)
        this._hideBlankChat()
        this.clearPostsByChannelId()
        this.clearPostsOfPerson()
        this.$dispatch('colseChannelNotice')

        // 清空聊天框中的文字
        $('.chat-box').val('')
        // 重置chathead上的图标状态
        $('.group-channel-handler .post-list').removeClass('active')
      },
      getLastMessageHtml (key) {
        let lastMssage = this.channelsLocal[key] && this._getLastMessage(this.channelsLocal[key].id)
        if (lastMssage) {
          return emoji.replace_colons(lastMssage)
        }
      },
      _getNewUserIds (channels) {
        let userIds = []
        for (let item in channels) {
          let channel = channels[item]
          if (channel.type !== constants.SINGLE_CHANNEL || array.findIndex(this.usersInfoStorage, {id: channel.user_id}) !== -1) { // 单聊需要查询改用户信息
            continue
          }
          if (channel.user_id) {
            userIds.push(channel.user_id)
          }
        }
        return userIds
      },
      _hideUnRead (e) {
        $(e.target).parents('.channel-list-item').find('.message-unread, .message-unread-disturb').remove()
      },
      _hideBlankChat () {
        $('.chat-body-blank').hide()
      },
      setActive (index) {
        let i = 0
        for (let key of this.channelsIndex) {
          if (this.curChannelId && key === this.curChannelId) {
            this.activeIndex = i
            return
          }
          i++
        }
        if (index) {
          this.activeIndex = index
        }
      },
      _getLastMessage (id) {
        let lastMessage = this.nowLastMessages[id]

        if (!lastMessage) {
          return ''
        }

        if (lastMessage.message_type === constants.MESSAGE_SERVICE) {
          return lastMessage.content
        }

        switch (lastMessage.media_type) {
          case constants.MEDIA_TEXT:
            return lastMessage.content
          case constants.MEDIA_LINK:
            return '[链接]'
          case constants.MEDIA_PHOTO:
            return '[图片]'
          default: return '[暂不支持]'
        }
      }
    }
  }
</script>

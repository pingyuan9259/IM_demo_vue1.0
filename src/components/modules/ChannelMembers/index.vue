<style lang="scss">
  @import "./index";
</style>

<template>
  <dialog :show.sync="showDialog">
    <div class="channel-members-con">
      <div class="channel-members-head">
        <span>群成员（{{ count }}人）</span>
        <div class="members-search">
          <i class="search-icon icon"></i>
          <input type="text" class="search-member" v-model="searchVal" @keyup.enter="searchMember" placeholder="搜索联系人">
          <i class="search-close icon" v-show="showSearchClose" @click="clearSearch"></i>
        </div>
      </div>
      <hr class="line">
      <div class="members-loading" v-show="showMemberLoading">
        <div class="v-pulse v-pulse1" style="animation-fill-mode: both; animation-timing-function: cubic-bezier(0.2, 0.68, 0.18, 1.08); animation-iteration-count: infinite; animation-duration: 0.75s; animation-name: v-pulseStretchDelay; display: inline-block; border-radius: 100%; margin: 2px; height: 15px; width: 15px; animation-delay: 0.12s; background-color: rgb(4, 201, 191);">
        </div>
        <div class="v-pulse v-pulse2" style="animation-fill-mode: both; animation-timing-function: cubic-bezier(0.2, 0.68, 0.18, 1.08); animation-iteration-count: infinite; animation-duration: 0.75s; animation-name: v-pulseStretchDelay; display: inline-block; border-radius: 100%; margin: 2px; height: 15px; width: 15px; animation-delay: 0.24s; background-color: rgb(4, 201, 191);">
        </div>
        <div class="v-pulse v-pulse3" style="animation-fill-mode: both; animation-timing-function: cubic-bezier(0.2, 0.68, 0.18, 1.08); animation-iteration-count: infinite; animation-duration: 0.75s; animation-name: v-pulseStretchDelay; display: inline-block; border-radius: 100%; margin: 2px; height: 15px; width: 15px; animation-delay: 0.36s; background-color: rgb(4, 201, 191);">
        </div>
      </div>
      <div class="members-list-con" v-show="showChannelMembers" @scroll="scrollLoadMembers">
        <ul class="channle-members-list">
          <li v-for="item in channelMembers" @click="createSingleChat(item.id)">
            <img class="channel-members-avatar" :src="imgProtocol(item.avatar || defaultPersonAvatar) + '?imageMogr2/thumbnail/160'" alt="{{ item.fullname }}">
            <div class="channel-members-name">{{ item.fullname }}</div>
          </li>
        </ul>
      </div>
      <div class="members-search-con" v-show="!showChannelMembers" @scroll="scrollLoadSearch">
        <ul class="search-members-list">
          <li v-for="item in searchMembers" @click="createSingleChat(item.id)">
            <img class="search-members-avatar" :src="(item.avatar || defaultPersonAvatar) + '?imageMogr2/thumbnail/160'" alt="{{ item.fullname }}">
            <div class="search-members-name">{{ item.fullname }}</div>
            <a href="javascript:void(0)" class="search-members-chat">聊天</a>
          </li>
        </ul>
      </div>
      </div>
    </div>
  </dialog>
</template>

<script>
  import $ from 'jquery'
  import storage from '../../../utils/storage'
  import array from 'lodash/array'
  import { USERS_LIMIT } from '../../../configs/index'
  import Dialog from '../../commons/Dialog/'
  import imgProtocol from '../../../filters/imgProtocol'
  import { DEFAULT_PERSON_AVATAR, USER_INFO_KEY } from '../../../configs/'
  import {
    getUsersOfChannel,
    searchUsersOfChannel,
    singleChat,
    getFriendStatus,
    toggleMic
  } from '../../../vuex/actions'

  export default {
    data () {
      return {
        showMemberLoading: false,
        defaultPersonAvatar: DEFAULT_PERSON_AVATAR,
        showSearchClose: false,
        showDialog: false,
        channelMembers: [],
        count: 0,
        page: 0,
        searchVal: '',
        searchCount: 0,
        searchPage: 0,
        searchMembers: [],
        showChannelMembers: true,
        scrollLoading: false,
        imgProtocol
      }
    },
    components: {
      Dialog
    },
    events: {
      openChannelMembers () { // from components/modules/ChatHead
        this.openMembersDialog()
      }
    },
    vuex: {
      getters: {
        curChannelId: state => state.channel.curChannelId,
        channels: state => state.channel.channels,
        channelsLive: state => state.channel.channelsLive,
        membersOfChannel: state => state.user.membersOfChannel,
        membersOfSearch: state => state.user.membersOfSearch,
        deviceId: state => state.globals.deviceId
      },
      actions: {
        getUsersOfChannel,
        searchUsersOfChannel,
        singleChat,
        getFriendStatus,
        toggleMic
      }
    },
    watch: {
      open () {
        if (this.open) {
          this.openMembersDialog()
        }
      },
      curChannelId () {
        this.channelMembers = []
        this.searchMembers = []
      },
      membersOfChannel: {
        handler () {
          let memberData = this.membersOfChannel[this.curChannelId]
          this.channelMembers = array.concat(this.channelMembers, memberData.data)
          this.count = memberData.pagination.count
          this.scrollLoading = false

          this.$nextTick(() => {
            this.showMemberLoading = false
          })
        },
        deep: true
      },
      membersOfSearch: {
        handler () {
          let memberData = this.membersOfSearch[this.curChannelId]
          this.searchMembers = array.concat(this.searchMembers, memberData.data)
          this.searchCount = memberData.pagination.count
          this.scrollLoading = false

          this.$nextTick(() => {
            this.showMemberLoading = false
          })
        },
        deep: true
      }
    },
    methods: {
      openMembersDialog () {
        this.showDialog = true
        this.page = 0
        this.channelMembers = []
        this.showMemberLoading = true
        this.getUsersOfChannel(this.curChannelId, this.page++)
      },
      searchMember () {
        this.showChannelMembers = false
        this.showSearchClose = true
        this.searchPage = 0
        this.searchMembers = []
        this.showMemberLoading = true
        this.searchUsersOfChannel(this.curChannelId, this.searchVal, this.searchPage++)
      },
      clearSearch () {
        this.showSearchClose = false
        this.showChannelMembers = true
        this.searchVal = ''
      },
      scrollLoadMembers () {
        if (this.scrollLoading || this.page >= Math.ceil(this.count / USERS_LIMIT)) {
          return
        }
        let outter = $('.channle-members-list').height()
        let inner = $('.members-list-con').height()
        let scrollTop = $('.members-list-con').scrollTop()

        if (scrollTop > outter - inner - 20) {
          this.scrollLoading = true
          this.getUsersOfChannel(this.curChannelId, this.page++)
        }
      },
      scrollLoadSearch () {
        if (this.scrollLoading || this.searchPage >= Math.ceil(this.searchCount / USERS_LIMIT)) {
          return
        }
        let outter = $('.search-members-list').height()
        let inner = $('.members-search-con').height()
        let scrollTop = $('.members-search-con').scrollTop()

        if (scrollTop > outter - inner - 20) {
          this.scrollLoading = true
          this.searchUsersOfChannel(this.curChannelId, this.searchVal, this.searchPage++)
        }
      },
      createSingleChat (id) {
        let userInfo = storage.get(USER_INFO_KEY)
        if (id === userInfo.id) {
          return
        }

        let isLeave = true
        let curChannel = this.channels[this.curChannelId]
        let hasLive = !!curChannel.live_play_url

        if (hasLive) {
          isLeave = window.confirm('当前群组正在直播，确定离开吗？')
        }

        if (!isLeave) {
          return
        } else if (hasLive && this.deviceId === this.channelsLive[this.curChannelId].live_device_id) {
          const curLiveChannel = this.channelsLive[this.curChannelId]
          this.toggleMic(false, () => {}, curLiveChannel.rtmp_publish_url)
          try {
            window.mymedia.stopRecordClicked()
          } catch (err) {
            console && console.log(err)
          }
          window.sa.track('evt_leave_live')
        }

        this.getFriendStatus(id)
        this.singleChat(id)
        this.showDialog = false
      }
    }
  }
</script>

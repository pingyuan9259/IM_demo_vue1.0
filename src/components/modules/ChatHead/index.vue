<style lang="scss">
  @import "./index";
</style>

<template>
  <div class="modules-chat-head">
    <div class="chat-head-name" @click="showGroupMenu = !showGroupMenu">{{ getChatTitle() }}<i v-if="curChannel && curChannel.type === group_channel" class="icon chat-title" :class="{'active': showGroupMenu}"></i>
      <div class="group-menu-dialog" v-if="curChannel && curChannel.type === group_channel && showGroupMenu">
        <ul>
          <li><a href="javascript:void(0)" @click="openChannelMembers"><i class="icon menu-group-members"></i>群成员</a></li>
          <li><a href="javascript:void(0)" @click="openChannelNotice"><i class="icon menu-group-notice"></i>群公告</a></li>
        </ul>
      </div>
    </div>
    <div class="group-channel-handler">
      <a class="hint--bottom" aria-label="群成员" href="javascript:void(0)" v-if="showChannelMembers"><i class="icon group-channel-members" @click="openChannelMembers"></i></a>
      <a class="hint--bottom" aria-label="文章" v-show='!isSudoboot' href="javascript:void(0)" v-if="showPostHandler"><i class="icon post-list" @click="togglePostsList($event)"></i></a>
      <a class="hint--bottom search" aria-label="搜索" v-show='!isSudoboot' href="javascript:void(0)" v-if="showPostHandler">
        <i class="icon post-search" @click="openPostSearch($event)"></i><input type="text" class="input-post-search" placeholder="搜索全部文章" v-model='searchVal' @blur="closePostSearch($event, searchVal)" @keydown.enter='searchAllPosts(searchVal)'>
      </a>
    </div>
    <channel-members></channel-members>
    <channel-notice></channel-notice>
  </div>
</template>

<script>
  import $ from 'jquery'
  import ChannelMembers from '../ChannelMembers/'
  import ChannelNotice from '../ChannelNotice/'
  import { arrToObjByKey } from '../../../utils/enhance'
  import constants from '../../../constants/'
  import {
    getChannelMembersCount,
    getPostsByChannelId,
    getSearchPosts,
    clearPostsOfSearch,
    openPostList
  } from '../../../vuex/actions'

  export default {
    data () {
      return {
        isSudoboot: false,        // 判断是否为风利登录
        postsListLimit: 20,
        postsListPage: 1,
        searchVal: '',
        groupMembersCount: '',
        group_channel: constants.GROUP_CHANNEL,
        showGroupMenu: false,
        showChannelMembers: false,
        showPostHandler: false
      }
    },
    components: {
      ChannelMembers,
      ChannelNotice
    },
    events: {
      hideGroupMenu () { // from components/modules/Container
        this.showGroupMenu = false
      }
    },
    vuex: {
      getters: {
        channelsMembersCount: state => state.channel.channelsMembersCount,
        curChannelId: state => state.channel.curChannelId,
        channels: state => state.channel.channels,
        user: (state) => {
          return arrToObjByKey('id', state.user.usersInfoStorage)
        }
      },
      actions: {
        getChannelMembersCount,
        getPostsByChannelId,
        getSearchPosts,
        clearPostsOfSearch,
        openPostList
      }
    },
    created () {
      let hostname = window.location.hostname
      if (hostname.indexOf('sudoboot') !== -1) {
        this.isSudoboot = true
      }
    },
    watch: {
      curChannelId () {
        if (this.curChannelId) {
          this.showPostHandler = true
        }

        let curChannel = this.channels[this.curChannelId]
        let isGroupChannel = curChannel.type === this.group_channel
        let groupMembersCount = this.channelsMembersCount[this.curChannelId]
        this.showChannelMembers = isGroupChannel

        if (isGroupChannel && !groupMembersCount) {
          this.getChannelMembersCount(this.curChannelId)
        } else {
          this.groupMembersCount = groupMembersCount
        }
      },
      channelsMembersCount () {
        this.groupMembersCount = this.channelsMembersCount[this.curChannelId]
      }
    },
    computed: {
      curChannel () {
        if (this.curChannelId) {
          return this.channels[this.curChannelId]
        }
        return null
      }
    },
    methods: {
      openChannelMembers () {
        this.$broadcast('openChannelMembers') // to component/modules/ChannelMembers
      },

      openChannelNotice () {
        this.$broadcast('openChannelNotice') // to component/modules/ChannelNotice
      },

      togglePostsList (event) {
        let target = $(event.currentTarget)
        target.toggleClass('active')

        if (!target.hasClass('active')) {
          this.$dispatch('closeRightPannel')
          this.$dispatch('removePostsList')

          // 如果当前 channel 有直播需要还原回去
          let curChannel = this.channels[this.curChannelId]
          let liveUrl = curChannel.live_play_url
          let liveMicState = curChannel.live_mic_status

          if (liveUrl) {
            this.$dispatch('openRightPannel')
            this.$dispatch('openLiveVideo', liveUrl, liveMicState)
          }
        } else {
          this.$dispatch('openRightPannel')
          this.$dispatch('addPostsList')
          this.openPostList()
        }
      },

      openPostSearch (event) {
        let target = $(event.currentTarget)
        let parent = target.parents('a')
        let input = parent.find('input')
        let icon = target
        for (let item of [parent, input, icon]) {
          item.addClass('active')
        }
        input.focus()
      },

      closePostSearch (event, searchVal) {
        let target = $(event.currentTarget) // 这里需要重新优化，只是用css
        let parent = target.parents('a')
        let input = target
        let icon = parent.find('i')

        if (searchVal) {
          return
        }
        for (let item of [parent, input, icon]) {
          item.removeClass('active')
        }
      },

      searchAllPosts (searchVal) {
        this.$dispatch('openRightPannel')
        this.$dispatch('searchPostsList')
        $('.group-channel-handler .post-list').removeClass('active')
        this.clearPostsOfSearch()
        this.getSearchPosts(searchVal)
      },

      getChatTitle () {
        let name = ''
        let title = ''

        if (!this.curChannel) {
          return ''
        }

        if (this.curChannel.name) {
          name = this.curChannel.name
        } else {
          name = this.user && this.user[this.curChannel.user_id] && this.user[this.curChannel.user_id].fullname || '公开会议室'
        }

        if (this.curChannel.type === this.group_channel && !!this.groupMembersCount) {
          title = `${name}（${this.groupMembersCount}）`
        } else {
          title = name
        }

        return title
      }
    }
  }
</script>

<style lang="scss">
  @import './index';
</style>

<template>
  <div class="module-posts-list">

    <div class="nav-posts" v-if="showChannelNav">
      <a href="javascript:void(0)" v-bind:class="{'active': showChannelActive}" @click="showChannelActive = true, showALLActive = false">群文章</a><a href="javascript:void(0)" v-bind:class="{'active': !showChannelActive}" @click="showChannelActive = false, showALLActive = true, getAllPostsList()">全部文章</a>
    </div>

    <div class="nav-posts" v-if="showPersonNav">
      <a href="javascript:void(0)" v-bind:class="{'active': showPersonActive}" @click="showPersonActive = true, showALLActive = false">TA的文章</a><a href="javascript:void(0)" v-bind:class="{'active': !showPersonActive}" @click="showPersonActive = false, showALLActive = true, getAllPostsList()">全部文章</a>
    </div>

    <div class="nav-posts" v-if="showSearchNav">
      <div class="search-post-nav">搜索列表<i class="search-close icon" @click="colseSearch"></i></div>
    </div>

    <div class="posts-list-con channel" v-if="showChannelActive" @scroll="channelPostsLoad">
      <div class="no-posts" v-if="showNullChannelPosts">
        <i class="icon no-posts-icon"></i>
        <div class="no-posts-tip">未发表文章</div>
      </div>
      <ul class="posts-list channel-posts-list">
        <li v-for="item in channelPosts">
          <a href="{{ item.public_link }}" target="_blank">
            <img :src="imgProtocol(item.cover) + '?imageMogr2/thumbnail/160'">
            <div class="detail-post-item">
              <div class="post-title">{{ item.title }}</div>
              <div class="post-author">{{ item.author }}</div>
            </div>
          </a>
        </li>
      </ul>
    </div>

    <div class="posts-list-con person" v-if="showPersonActive" @scroll="personPostsLoad">
      <div class="no-posts" v-if="showNullPersonPosts">
        <i class="icon no-posts-icon"></i>
        <div class="no-posts-tip">未发表文章</div>
      </div>
      <ul class="posts-list channel-posts-list">
        <li v-for="item in personPosts">
          <a href="{{ item.public_link }}" target="_blank">
            <img :src="imgProtocol(item.cover) + '?imageMogr2/thumbnail/160'">
            <div class="detail-post-item">
              <div class="post-title">{{ item.title }}</div>
              <div class="post-author">{{ item.author }}</div>
            </div>
          </a>
        </li>
      </ul>
    </div>

    <div class="posts-list-con all" v-if="showALLActive" @scroll="allPostsLoad">
      <ul class="posts-list all-posts-list">
        <li v-for="item in allPosts">
          <a href="{{ item.public_link }}" target="_blank">
            <img :src="imgProtocol(item.cover) + '?imageMogr2/thumbnail/160'">
            <div class="detail-post-item">
              <div class="post-title">{{ item.title }}</div>
              <div class="post-author">{{ item.author }}</div>
            </div>
          </a>
        </li>
      </ul>
    </div>

    <div class="posts-list-con search" v-if="showSearchActive" @scroll="searchPostsLoad">
      <div class="no-posts" v-if="showNullSearchPosts">
        <i class="icon no-posts-icon"></i>
        <div class="no-posts-tip">没有搜到相关文章</div>
      </div>
      <ul class="posts-list channel-posts-list">
        <li v-for="item in searchPosts">
          <a href="{{ item.public_link }}" target="_blank">
            <img :src="imgProtocol(item.cover) + '?imageMogr2/thumbnail/160'" alt="{{ item.title }}">
            <div class="detail-post-item">
              <div class="post-title">{{ item.title }}</div>
              <div class="post-author">{{ item.author }}</div>
            </div>
          </a>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
  import $ from 'jquery'
  import imgProtocol from '../../../filters/imgProtocol'
  import constants from '../../../constants/'
  import {
    getAllPosts,
    getPostsByChannelId,
    getPostsByPersonId,
    getSearchPosts
  } from '../../../vuex/actions'

  export default {
    data () {
      return {
        showPersonNav: false,
        showChannelNav: false,
        showSearchNav: false,

        showChannelActive: false,
        showPersonActive: false,
        showALLActive: false,
        showSearchActive: false,

        channelLimit: 20,
        channelPage: 1,

        allLimit: 20,
        allPage: 1,

        personLimit: 20,
        personPage: 1,

        searchLimit: 20,
        searchPage: 1,

        scrolling: false,

        showNullPersonPosts: false,
        showNullChannelPosts: false,
        showNullSearchPosts: false,
        imgProtocol
      }
    },
    props: {
      isSearch: {
        type: Boolean,
        twoWay: true
      }
    },
    vuex: {
      actions: {
        getAllPosts,
        getSearchPosts,
        getPostsByChannelId,
        getPostsByPersonId
      },
      getters: {
        channels: state => state.channel.channels,
        curChannelId: state => state.channel.curChannelId,
        curChannel: state => state.channel.channels[state.channel.curChannelId],

        allPosts: state => state.post.allPosts,
        allPagination: state => state.post.allPagination,

        channelPosts: state => state.post.channelPosts,
        channelPagination: state => state.post.channelPagination,

        personPosts: state => state.post.personPosts,
        personPagination: state => state.post.personPagination,

        searchPosts: state => state.post.searchPosts,
        searchPagination: state => state.post.searchPagination,

        openPostStatus: state => state.post.openPostStatus
      }
    },
    ready () {
      this._postNavShow()
    },
    watch: {
      curChannelId () {
        this._postNavShow()
      },
      personPosts () {
        this.showNullPersonPosts = this.personPosts.length === 0
        this.scrolling = false
      },
      channelPosts () {
        this.showNullChannelPosts = this.channelPosts.length === 0
        this.scrolling = false
      },
      searchPosts () {
        this._init()
        this.showSearchNav = true
        this.showSearchActive = true
        this.showNullSearchPosts = this.searchPosts.length === 0
      },
      allPosts () {
        this.scrolling = false
      },
      openPostStatus () {
        this._cancelInputActive()
        this._postNavShow()
      }
    },
    methods: {
      _init () {
        this.showPersonNav = false
        this.showChannelNav = false
        this.showSearchNav = false

        this.showALLActive = false
        this.showChannelActive = false
        this.showPersonActive = false
        this.showSearchActive = false

        this.channelPage = 1
        this.personPage = 1
        this.searchPage = 1
        this.scrolling = false
      },
      _postNavShow () {
        this._init()

        if (this.isSearch) {
          this.showSearchNav = true
          this.showSearchActive = true
          return
        }

        this.showSearchNav = false
        this.showSearchActive = false

        if (this.curChannel.type !== constants.GROUP_CHANNEL) { // 单聊
          this.showPersonNav = true
          this.showChannelNav = false

          this.showChannelActive = false
          this.showPersonActive = true
          this.getPostsByPersonId(this.curChannel.user_id, this.personLimit, this.personPage)
        } else { // 群聊
          this.showPersonNav = false
          this.showChannelNav = true

          this.showChannelActive = true
          this.showPersonActive = false
          this.getPostsByChannelId(this.curChannelId, this.channelLimit, this.channelPage)
        }
      },

      getAllPostsList () {
        if (this.allPosts.length === 0) {
          this.getAllPosts(this.allimit, this.allPage)
        }
      },

      personPostsLoad () {
        if (this.personPosts.length >= this.personPagination.count) {
          return
        }

        let el = $('.posts-list-con.person')
        let scrollTop = el.scrollTop()
        let scrollLine = el.find('.posts-list').height() - el.height() - 50

        if (scrollTop >= scrollLine && !this.scrolling) {
          this.scrolling = true
          this.getPostsByPersonId(this.curChannel.user_id, this.personLimit, ++this.personPage)
        }
      },

      channelPostsLoad () {
        if (this.channelPosts.length >= this.channelPagination.count) {
          return
        }

        let el = $('.posts-list-con.channel')
        let scrollTop = el.scrollTop()
        let scrollLine = el.find('.posts-list').height() - el.height() - 50

        if (scrollTop >= scrollLine && !this.scrolling) {
          this.scrolling = true
          this.getPostsByChannelId(this.curChannelId, this.channelLimit, ++this.channelPage)
        }
      },

      allPostsLoad () {
        if (this.allPosts.length >= this.allPagination.count) {
          return
        }
        let el = $('.posts-list-con.all')
        let scrollTop = el.scrollTop()
        let scrollLine = el.find('.posts-list').height() - el.height() - 50

        if (scrollTop >= scrollLine && !this.scrolling) {
          this.scrolling = true
          this.getAllPosts(this.allLimit, ++this.allPage)
        }
      },

      searchPostsLoad () {
        if (this.searchPosts.length >= this.searchPagination.count) {
          return
        }
        let el = $('.posts-list-con.search')
        let scrollTop = el.scrollTop()
        let scrollLine = el.find('.posts-list').height() - el.height() - 50

        if (scrollTop >= scrollLine && !this.scrolling) {
          this.scrolling = true
          this.getSearchPosts(this.searchLimit, ++this.searchPage)
        }
      },

      colseSearch () {
        this.showSearchNav = false
        this.showSearchActive = false
        this._cancelInputActive()

        // 如果当前 channel 有直播需要还原回去
        let liveUrl = this.curChannel.live_play_url
        let liveMicState = this.curChannel.live_mic_status

        if (liveUrl) {
          this.$dispatch('openLiveVideo', liveUrl, liveMicState)
        } else {
          this.$dispatch('closeRightPannel')
        }
      },

      _cancelInputActive () {
        let input = $('.input-post-search')
        let parent = input.parents('a')
        let icon = parent.find('i')
        for (let item of [parent, input, icon]) {
          item.removeClass('active')
        }
        input.val('')
        this.isSearch = false
      }
    }
  }
</script>

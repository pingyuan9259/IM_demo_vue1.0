<style lang="scss">
  @import './index';
</style>

<template>
  <div class="layout-right">
    <posts-list :is-search.sync="isSearch" v-if="showPostsList"></posts-list>
    <black-board
      :video-url.sync="videoUrl"
      :video-mic.sync="micState"
      v-if="showBlackBoard"></black-board>
  </div>
</template>

<script>
  import BlackBoard from '../../modules/BlackBoard'
  import PostsList from '../../modules/PostsList'

  export default {
    data () {
      return {
        videoUrl: '',
        micState: false,
        isSearch: false,
        showBlackBoard: false,
        showPostsList: false
      }
    },
    components: {
      BlackBoard,
      PostsList
    },
    vuex: {
      getters: {
        curChannelId: state => state.channel.curChannelId,
        channelsLive: state => state.channel.channelsLive,
        channelsLiveStatus: state => state.channel.channelsLiveStatus
      }
    },
    ready () {
      // console.log(123)
    },
    watch: {
      channelsLiveStatus () {
        // let liveChannel = this.channelsLive[this.curChannelId]
        // this.showBlackBoard = liveChannel.blackboard_status === 1
        // if (this.showBlackBoard) {
        //   this.videoUrl = liveChannel.live_play_url
        //   this.micState = liveChannel.live_mic_status === 1
        // }
      }
    },
    events: {
      showLiveVideo (url, mic) {
        this.showBlackBoard = true
        this.showPostsList = false
        this.videoUrl = url
        this.micState = !!mic
      },
      hideLiveVideo () {
        this.showBlackBoard = false
        this.showPostsList = true
      },
      addPostsList () {
        this.showPostsList = true
        this.showBlackBoard = false
      },
      searchPostsList () {
        this.showPostsList = true
        this.showBlackBoard = false
        this.isSearch = true
      },
      removePostsList () {
        this.showPostsList = false
        this.showBlackBoard = true
      }
    }
  }
</script>

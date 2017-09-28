<style lang="scss">
  @import './index';
</style>

<template>
  <div class="scroll-con" @scroll="scrollToTop($event)">
    <div class="scroll-content-con">
      <slot>null</slot>
    </div>
  </div>
</template>

<script>
  import $ from 'jquery'

  export default {
    props: {
      loadMore: {
        type: Function,
        required: true
      },
      loadingHtml: {
        type: String,
        default: '<div class="loading">loading...</div>'
      }
    },

    events: {
      startLoading () {
        $('.message-loading').length === 0 && this.contentEle.prepend(this.loadingHtml)
        this.contentEle.find('.module-message-item').hide()
      },
      endLoading () {
        setTimeout(() => {
          $('.message-loading').remove()
          this.contentEle.find('.module-message-item').show()
        }, 0)
      }
    },

    data () {
      return {
        lastScrollTop: 0,
        showLoading: true
      }
    },

    ready () {
      // init to bottom
      this.scrollEle = $('.scroll-con')
      this.contentEle = $('.scroll-content-con')
    },

    methods: {
      _loadMore () {
        this.loadMore(this.scrollEle, this.contentEle)
      },

      scrollToTop (event) {
        let target = event.target
        if (target.scrollTop === 0) {
          $('.message-loading').length === 0 && this.contentEle.prepend(this.loadingHtml)
          this._loadMore()
        }
      }
    }
  }
</script>

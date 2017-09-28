<style lang="scss">
  @import './index';
</style>

<template>
  <div class="layout-body">
    <chat-head></chat-head>
    <div class="chat-body-con" :class="{'active-right': openRight}">
      <div class="chat-body-blank">
        <i class="icon"></i>
        <span>未选择会话</span>
      </div>
      <div class="chat-body-main">
        <chat-body></chat-body>
        <chat-send></chat-send>
      </div>
      <right-pannel></right-pannel>
    </div>
  </div>
</template>

<script>
  import ChatHead from '../../modules/ChatHead/'
  import ChatBody from '../../modules/ChatBody/'
  import ChatSend from '../../modules/ChatSend/'
  import RightPannel from '../RightPannel/'

  export default {
    props: {
      openRight: {
        type: Boolean,
        twoWay: true
      }
    },
    components: {
      ChatHead,
      ChatBody,
      ChatSend,
      RightPannel
    },
    events: {
      handChatSend () {
        this.$broadcast('isHandSend')
      }
    }
  }
</script>

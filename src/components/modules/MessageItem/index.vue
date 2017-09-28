<style lang="scss">
  @import "./index";
</style>

<template>
  <div class="module-message-item" >
    <div v-if="message.message_type === message_service && (message.readLimit === undefined || message.readLimit.length === 0 || message.readLimit[0] === userId)" class="message-service">
      <div class="service-content">{{ message.content }}</div>
    </div>

    <!--   <div class="message-date"> // 时间分界线
      <hr/>
      <div class="date-content"><span>今天</span></div>
    </div> -->

    <plain-message v-if="message.message_type === message_plain && (message.readLimit === undefined || message.readLimit.length === 0 || message.readLimit[0] === userId)" :message.sync="message"></plain-message>

    <!-- <non-support-message  :message.sync="message"></non-support-message> -->
  </div>

</template>

<script>
  import constants from '../../../constants/'
  import PlainMessage from './plainMessage'
  import storage from '../../../utils/storage'
  import { USER_INFO_KEY } from '../../../configs/'
  import nonSupportMessage from './nonSupportMessage'

  export default {
    data () {
      return {
        message_service: constants.MESSAGE_SERVICE,
        message_plain: constants.MESSAGE_PLAIN,
        userId: storage.get(USER_INFO_KEY).id // 当前登录的用户ID
      }
    },
    components: {
      PlainMessage,
      nonSupportMessage
    },
    props: {
      message: {
        type: Object,
        required: true,
        twoWay: true
      }
    }
  }
</script>

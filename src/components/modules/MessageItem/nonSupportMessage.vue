<template>
  <div class="message-item-avatar"><img :src="user && user[message.creator] && (user[message.creator].avatar || defaultAvatar)"></div>
  <div class="message-item-info">
    <div class="message-name-datetime">
      <span class="message-item-name">{{ user && user[message.creator] && user[message.creator].fullname }}</span>
      <span class="message-item-datetime">{{ message.created_at | dateFormat 'HH:mm:ss'}}</span>
    </div>
    <div class="message-item-content">
      <pre>暂不支持</pre>
    </div>
  </div>
</template>

<script>
  import dateFormat from '../../../filters/dateFormat'
  import { arrToObjByKey } from '../../../utils/enhance'
  import { DEFAULT_PERSON_AVATAR } from '../../../configs/'

  export default {
    data () {
      return {
        defaultAvatar: DEFAULT_PERSON_AVATAR
      }
    },
    vuex: {
      getters: {
        user: (state) => {
          return arrToObjByKey('id', state.user.usersInfoStorage)
        }
      }
    },
    props: {
      message: {
        type: Object,
        required: true,
        twoWay: true
      }
    },
    filters: {
      dateFormat
    }
  }
</script>

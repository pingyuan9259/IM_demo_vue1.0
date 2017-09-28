<style lang="scss">
  @import './index';
</style>
<template>
  <div class="modules-name-card" v-if="show">
    <div class="card-avatar-con"><img class="card-avatar" :src="imgProtocol((userInfo && userInfo.avatar) || defaultAvatar) + '?imageMogr2/thumbnail/320'" alt=""></div>
    <div class="card-info">
      <div class="card-name">{{ userInfo && userInfo.fullname }} <i class="icon" :class="{'card-man': userInfo.gender === 1, 'card-woman': userInfo.gender === 0}"></i><i class="icon" :class="{'vip': userInfo.is_member, 'no-vip': !userInfo.is_member}"></i></div>
      <div>地区：{{ userInfo && userInfo.city }}<span class="no-value" v-if="userInfo && !userInfo.city">未填写</span></div>
      <div class="card-intro">个人简介：{{ userInfo && userInfo.introduce }}<span class="no-value" v-if="userInfo && !userInfo.introduce">未填写</span></div>
    </div>
    <i class="card-auth icon" v-if="userInfo && userInfo.verify && userInfo.verify.status === 1"></i>
    <!-- <i class="go-chat icon" v-if="showNameCardChat" @click="createSingleChat(userInfo.id)"></i> -->
  </div>
</template>
<script>
  import $ from 'jquery'
  import storage from '../../../utils/storage'
  import imgProtocol from '../../../filters/imgProtocol'
  import {
    getUserDetail,
    singleChat
  } from '../../../vuex/actions'
  import { DEFAULT_GROUP_AVATAR, USER_INFO_KEY } from '../../../configs/'

  export default {
    data () {
      return {
        showNameCardChat: true,
        userInfo: {},
        show: false,
        defaultAvatar: DEFAULT_GROUP_AVATAR,
        imgProtocol
      }
    },
    events: {
      hideNameCard () {
        this.preShow = false
      }
    },
    props: {
      preShow: {
        type: Boolean,
        default: false,
        twoWay: true
      },
      user: {
        type: Object
      }
    },
    vuex: {
      actions: {
        getUserDetail,
        singleChat
      },
      getters: {
        userDetail: state => state.user.userDetail
      }
    },
    watch: {
      'preShow' () {
        console.log(this.user)
        $('.modules-name-card').hide()

        if (this.userDetail[this.user.id]) {
          this.userInfo = this.userDetail[this.user.id]
          this.show = this.preShow
        } else {
          this.getUserDetail(this.user.id)
        }
      },
      userDetail () {
        this.userInfo = this.userDetail[this.user.id]
        this.show = this.preShow
      }
    },
    methods: {
      createSingleChat (id) {
        let userInfo = storage.get(USER_INFO_KEY)
        if (id === userInfo.id) {
          return
        }
        this.singleChat(id)
      }
    }
  }
</script>

<style lang="scss">
  @import "./index";
</style>

<template>
  <div class="module-profile">
    <div class="profile-avatar" @click="showProfileDetail = true"><img :src="imgProtocol(userInfo.avatar || defaultPersonAvatar)" alt="{{ userInfo.fullname }}"></div>
    <div class="profile-info" @click="showProfileDetail = true">
      <span class="profile-name">{{ userInfo.fullname }}</span>
    </div>
    <div class="profile-dialog" v-show="showProfileDetail">
      <div class="dialog-avatar">
        <img class="dialog-avatar-img" :src=" userProfile && imgProtocol(userProfile.avatar || defaultPersonAvatar)" alt="{{ userInfo.fullname }}">
        <i class="dialog-auth icon" v-if="userProfile && userProfile.verify && userProfile.verify.status === 1"></i>
      </div>
      <div class="info dialog-name">{{ userProfile && userProfile.fullname }} <i class="icon" :class="{'vip': userProfile.is_member, 'no-vip': !userProfile.is_member}"></i></div>
      <div class="info dialog-area">地区：{{ userProfile && userProfile.city }}<span class="no-value" v-if="userProfile && !userProfile.city">未填写</span></div>
      <div class="info dialog-intro">个人简介：{{ userProfile && userProfile.introduce }}<span v-if="userProfile && !userProfile.introduce">未填写</span></div>
      <hr>
      <div class="logout"><a href="javascript:void(0)" @click="logout"><i class="icon logout-icon"></i>退出登录</a></div>
    </div>
  </div>
</template>

<script>
  import object from 'lodash/object'
  import cookie from '../../../utils/cookie'
  import storage from '../../../utils/storage'
  import imgProtocol from '../../../filters/imgProtocol'
  import { TOP_LEVEL_HOST, APP_TOKEN_KEY, DEFAULT_PERSON_AVATAR, USER_INFO_KEY } from '../../../configs/'
  import { getUserDetail } from '../../../vuex/actions'

  export default {
    data () {
      return {
        userInfo: {},
        userProfile: {},
        defaultPersonAvatar: DEFAULT_PERSON_AVATAR,
        showProfileDetail: false,
        imgProtocol
      }
    },

    events: {
      hideProfileDialog () { // from components/layouts/Container
        this.showProfileDetail = false
      }
    },

    vuex: {
      actions: {
        getUserDetail
      },
      getters: {
        userDetail: state => state.user.userDetail
      }
    },

    watch: {
      userDetail () {
        let loginUserInfo = storage.get(USER_INFO_KEY)
        this.userProfile = object.assignIn(loginUserInfo, this.userDetail[this.userInfo.id])
        storage.set(USER_INFO_KEY, this.userProfile)
      }
    },

    created () {
      this.userInfo = storage.get(USER_INFO_KEY)
      if (!this.userInfo) {
        storage.clear()
        cookie.delCookie(APP_TOKEN_KEY, TOP_LEVEL_HOST)
        window.history.go(0)
        return
      }
      this.getUserDetail(this.userInfo.id)
    },

    methods: {
      logout () {
        storage.clear()
        cookie.delCookie('_app_token', TOP_LEVEL_HOST)
        window.history.go(0)
      }
    }
  }
</script>

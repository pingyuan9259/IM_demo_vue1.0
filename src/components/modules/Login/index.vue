<style lang="scss">
  @import "./index";
</style>

<template>
  <div class="module-login">
    <div class="wrap">
      <div class="bg" :style="App.bg"></div>
      <div class="index_logo">
        <img :src="App.logo" alt="logo">
      </div>
      <div class="load">
        <div v-show="showLogin" class="loading">
          <div v-show="showQRCodeBox" class="QR_create">
            <div v-show="showLoadingQRCode" class="load_box"><img src="../../../assets/loading.gif" alt="" /></div>
            <div v-show="showQRCode" id="qrcode" class="QR_code"></div>
            <p class="QR_p">扫描登录{{ App.name }}</p>
          </div>
          <div v-show="showRenovate" class="QR_renovate">
            <div><a @click="cancelLogin" href="javascript:;">刷新</a></div>
            <p>校验二维码失败，请刷新</p>
          </div>
          <div class="massage">
            <div class="install">
              <div class="mobile_icon">
                <img src="../../../assets/xs_m.png" alt="">
              </div>
                <div class="install_title">
                  <p class="massage_p">打开手机{{ App.name }}</p>
                  <p class="massage_s">手机上<a class="massage_a" target="_blank" :href="App.website">安装</a>并登录{{ App.name }}</p>
                </div>
              </div>
            <i class="adown_tip"></i>
            <div class="sweep">
              <div class="sweep_icon">
                <img src="../../../assets/xs_s.png" alt="">
              </div>
              <div class="sweep_title">
                <p class="massage_p">进入「扫一扫」</p>
                <p class="massage_s">从"发现"进入扫一扫，扫码登录Web{{ App.name }}</p>
              </div>
            </div>
          </div>
          <a class="tab_btn hint--top hint--always" aria-label="验证码登录" href="javascript:;" @click="tabLoginStyle"></a>
        </div>
          <!--扫描成功-->
        <div v-show="showScanSuccess" class="success">
          <div class="user">
            <img id="avatar" src="../../../assets/user_avatar.png" alt="头像">
          </div>
          <div v-if="loginedSuccess">
            <p class="success_massage1">正在进入...</p>
          </div>
          <div v-else>
            <p class="success_massage1">扫描成功</p>
            <p class="success_massage2">请在手机上点击确认已登陆</p>
          </div>
          <button class="success_btn" @click="cancelLogin">返回</button>
        </div>
      </div>
      <div class="phone_login">
        <div class="phone_box">
          <div class="txt_box">
            <p>手机号：</p>
            <input class="phone_num" type="text" placeholder="请输入手机号" />
          </div>
          <div class="txt_box">
            <p>验证码：</p>
            <div>
              <input class="identify_code" type="text" placeholder="请输入验证码" />
              <a class="indentify_btn" href="javascript:;" @click="getCode">获取验证码</a>
            </div>
          </div>
          <a class="phonic_tip" href="javascript:;" @click="Voice">未收到短信？获取语音验证码</a>
          <a class="login_btn" href="javascript:;" @click="SignIn">登录</a>
        </div>
        <a class="tab_btn hint--top hint--always" aria-label="扫码登录" href="javascript:;" @click="tabLoginStyle"></a>
      </div>
      <span class="foot_title">{{ App.copyright }}</span>
    </div>
  </div>
</template>

<script>
  import $ from 'jquery'
  import {
    getQr,
    getIdentifyingCode,
    getVoice,
    socketInit,
    getDeviceId,
    saveUserInfo,
    loginSuccess,
    phoneLogin,
    deleteDeviceId,
    checkClientSubmitLogin
  } from '../../../vuex/actions'
  import imgProtocol from '../../../filters/imgProtocol'
  import { URI_PREFIX, APP_ID } from '../../../configs/index'
  import appMap from '../../../configs/appMap'

  export default {
    data () {
      return {
        showLogin: true,          // 登录模块
        showScanSuccess: false,   // 登录成功模块
        showQRCodeBox: true,      // 创建二维码成功后显示的状态
        showRenovate: false,      // 创建二维码失败后显示的状态
        showLoadingQRCode: true,  // 二维码加载之前状态
        showQRCode: false,        // 二维码显示
        LoginStatus: false,       // 切换二维码和手机号码登录状态
        IdentifyStatus: false,    // 验证码发送状态
        App: appMap[APP_ID],
        loginedSuccess: false
      }
    },
    vuex: {
      actions: {
        getQr,
        getIdentifyingCode,       // 获取手机验证码key方法
        getVoice,                 // 获取语音验证码方法
        socketInit,
        getDeviceId,
        saveUserInfo,
        loginSuccess,
        phoneLogin,               // 手机号码登录方法
        deleteDeviceId,
        checkClientSubmitLogin
      },
      getters: {
        qr: state => state.login.qr,
        identifyingCode: state => state.login.identifyingCode,
        qrStatus: state => state.login.qrStatus,
        deviceId: state => state.globals.deviceId,
        checkSubmitLogin: state => state.login.checkSubmitLogin,
        checkSublimeStatus: state => state.login.checkSublimeStatus
      }
    },
    created () {
      // 判断是新生大学登录还是风利登录，替换title和icon
      var oIcon = document.getElementById('icon')
      var oTitle = document.getElementsByTagName('title')[0]
      oIcon.setAttribute('href', this.App.icon)
      oTitle.innerHTML = this.App.title
      this.getDeviceId()
    },
    watch: {
      deviceId () {
        this.getQr()
      },
      qrStatus () {
        if (this.qrStatus) {
          this.showQRCodeBox = true
          this.showRenovate = false
        } else {
          this.showQRCodeBox = false
          this.showRenovate = true
        }
      },
      qr () {
        let qrCodeEle = $('#qrcode')[0]
        if (!qrCodeEle) {
          return
        }
        $('#qrcode').html('')
        /* eslint-disable no-new */
        new window.QRCode(qrCodeEle, {
          text: 'http:' + URI_PREFIX + '/v3/r?qr=' + this.qr,
          width: 196,
          height: 196,
          colorDark: '#000000',
          colorLight: '#ffffff',
          correctLevel: window.QRCode.CorrectLevel.H
        })
        this.showLoadingQRCode = false
        this.showQRCode = true
        this.checkClientSubmitLogin()
      },
      checkSublimeStatus () {
        let data = this.checkSubmitLogin
        switch (data.code) {
          case 100:   // 等待扫码时轮询超时，需重新发起轮询
            this.checkClientSubmitLogin()
            break
          case 101:   // 移动端扫码成功，需重新发起轮训等待移动端确认登录
            this.showLogin = false
            this.showScanSuccess = true
            this.showLoadingQRCode = true
            this.showQRCode = false
            $('#qrcode').html('')
            let avatar = data.data.avatar
            if (avatar) {
              $('#avatar').attr('src', imgProtocol(avatar))
            }
            this.checkClientSubmitLogin()
            break
          case 200:   // 等待确认轮训超时，需重新发起轮询
            this.checkClientSubmitLogin()
            break
          case 201:   // 移动端确认登录
            this.saveUserInfo(data.data)
            this.loginedSuccess = true
            this.loginSuccess()
            this.socketInit(data.data)
            break
          case 204:   // 移动端取消登录，需重新创建二维码
            this.showLogin = true
            this.showScanSuccess = false
            this.getQr()
            break
        }
      }
    },
    methods: {
      cancelLogin () {
        this.showLogin = true
        this.showScanSuccess = false
        this.showRenovate = false
        this.showQRCodeBox = true
        this.getQr()
      },
      tabLoginStyle () {
        if (!this.LoginStatus) {
          $('.load').css({'opacity': '0', 'zIndex': '-1'})
          $('.phone_login').css({'opacity': '1', 'zIndex': '1'})
          $('.tab_btn').css('backgroundPosition', '0 0')
        } else {
          $('.phone_login').css({'opacity': '0', 'zIndex': '-1'})
          $('.load').css({'opacity': '1', 'zIndex': '1'})
          $('.tab_btn').css('backgroundPosition', '-40px -40px')
        }
        this.LoginStatus = !this.LoginStatus
      },
      getCode () {
        if (!this.IdentifyStatus) {
          let phone = $('.phone_num').val()

          if (!(/^1[3|4|5|7|8]\d{9}$/.test(phone))) {
            window.alert('手机号码有误，请重填!')
            return false
          }
          this.getIdentifyingCode(phone, this._checkIdentifyStatus())
        }
      },
      _checkIdentifyStatus () {
        this.IdentifyStatus = true
        let i = 60
        let timer = setInterval(() => {
          $('.indentify_btn').html(i + '秒后重新获取')
          $('.indentify_btn').css('opacity', '.55')
          i--
          if (i === 45) {
            $('.phonic_tip').css('display', 'block')
          }
          if (i === 0) {
            clearInterval(timer)
            this.IdentifyStatus = false
            $('.indentify_btn').css('opacity', '1')
            $('.indentify_btn').html('获取验证码')
          }
        }, 1000)
      },
      SignIn () {
        let phone = $('.phone_num').val()
        let code = $('.identify_code').val()

        if (!phone || !code) {
          window.alert('请输入手机号或验证码！')
          return false
        }

        let data = { code: code,
                     phone: phone,
                     key: this.identifyingCode,
                     device_id: this.deviceId,
                     country_code: 'CN'
                    }
        this.phoneLogin(data, this._checkSignIn)
      },
      _checkSignIn () {
        let data = this.checkSubmitLogin
        this.saveUserInfo(data.result)
        this.socketInit(data.result)
        $('.login_btn').text('正在进入...')
        // this.loginSuccess()
      },
      Voice () {
        let phone = $('.phone_num').val()
        $('.phonic_tip').css('display', 'none')
        this.getVoice(phone)
      }
    }
  }
</script>

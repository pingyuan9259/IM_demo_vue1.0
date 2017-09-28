<style>
  .upload-input {
    position: absolute;
    left: 0;
    top: 0;
    opacity: 0;
    width: 100%;
    height: 100%;
    cursor: pointer;
  }
</style>

<template>
  <input type="file" class="upload-input" v-on:change="upload">
</template>

<script>
  import request from '../../../utils/request'
  import log from '../../../utils/logger'

  export default {
    props: {
      channelId: {
        type: String
      }
    },
    data () {
      return {
        uploading: false,
        abortFile: null,
        inputHtml: ''
      }
    },
    vuex: {
      getters: {
        curChannelId: state => state.channel.curChannelId
      }
    },
    ready () {
      this.inputHtml = this.inputUpload
    },
    watch: {
      curChannelId () {
        if (this.uploading) {
          this.$dispatch('uploadHide')
          this.inputHtml = this.inputUpload
        }
      }
    },
    methods: {
      upload () {
        this.uploading = true
        this.inputHtml = ''
        let file = this.$el.files[0]
        if (file === null || file === '') {
          window.alert('请选择要上传的图片!')
          return
        }
        let allImgExt = '.jpg|.jpeg|.gif|.bmp|.png|'
        let extName = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
        if (allImgExt.indexOf(extName + '|') === -1) {
          let errMsg = '该文件类型不允许上传。请上传 ' + allImgExt + ' 类型的文件，当前文件类型为' + extName
          window.alert(errMsg)
          return
        }

        let data = new window.FormData()
        data.append('photo', file)

        window.addEventListener('offline', () => this._offLine(file))

        if (file) {
          this.$dispatch('uploadBefore')
        }

        this._uploadImg(data, file)
      },

      _offLine (file) {
        this.abortFile = file
        this.$dispatch('uploadFail')
        this.inputHtml = this.inputUpload
      },

      _uploadImg (data, file) {
        request.post({
          url: '/v3/upload/picture',
          data: data
        }).then(
          (res) => {
            if (this.abortFile === file) {
              this.abortFile = null
              return
            }
            if (res.code !== 1) {
              log.error('upload img:', res)
              return
            }
            let data = res.result
            let url = data.photo
            let img = new window.Image()
            img.onload = () => {
              this.$dispatch('uploadComplete', this.channelId, data, {
                img_w: img.width,
                img_h: img.height
              })
            }
            img.src = url
            this.inputHtml = this.inputUpload
            this.uploading = false
          },
          (err) => {
            log.error('upload img fail:', err)
            this.$dispatch('uploadFail')
          }
        )
      }
    }
  }

</script>
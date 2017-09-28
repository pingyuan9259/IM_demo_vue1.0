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
  <div v-on:change='upload' v-html='inputHtml'></div>
</template>

<script>
  export default {
    props: {
      callback: {
        type: Function
      }
    },
    data () {
      return {
        uploading: false,
        abortFile: null,
        inputHtml: '',
        inputUpload: '<input type="file" class="upload-input" accept="audio/*">'
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
        let file = this.$el.querySelector('input').files[0]
        if (!file) {
          return
        }
        this.uploading = true
        this.inputHtml = ''
        this.callback(file.path)

        setTimeout(() => {
          this.inputHtml = this.inputUpload
        }, 0)
      }
    }
  }

</script>
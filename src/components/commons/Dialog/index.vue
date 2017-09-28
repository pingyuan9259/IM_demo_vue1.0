<style lang="scss">
  @import './index';
</style>

<template>
  <div class="modal-mask" v-show="show" transition="modal" @click="onClick($event)">
    <div class="modal-wrapper">
      <slot>body</slot>
    </div>
  </div>
</template>

<script>
  export default {
    props: {
      show: {
        type: Boolean,
        required: true,
        twoWay: true,
        default: false
      }
    },
    methods: {
      onClick (event) {
        let target = event.target
        if (target.className.indexOf('modal-wrapper') !== -1) {
          this.show = false
        }
      }
    }
  }
</script>

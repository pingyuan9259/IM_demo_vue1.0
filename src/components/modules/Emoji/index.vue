<style lang="scss">
  @import './index';
</style>

<template>
  <div class="module-emoji" v-if="show">
    <ul class="emoji-tab-list">
      <li class="emoji-item emoji-nav-item" :class="{'active': curEmojiIndex === $index }" v-for="tab in emojiTabList" @click="switchEmojiTab($key, $index)">{{ tab }}</li>
    </ul>

    <div class="emoji-data-list-con">
      <ul class="emoji-data-list">
        <li class="emoji-item" v-for="item in curEmojiList" v-html="item.html" track-by="$index" @click="chooseWord(item.word)"></li>
      </ul>
    </div>
  </div>
</template>

<script>
  import collection from 'lodash/collection'
  import emoji from '../../../utils/emoji'

  let emojiData = window.emoji_data

  export default {
    props: {
      show: {
        type: Boolean,
        required: true,
        twoWay: true,
        default: false
      },
      chooseWord: {
        type: Function
      }
    },

    data () {
      return {
        emoji: emoji,
        emojiDataGrouped: null,
        curEmojiIndex: 0,
        curEmojiList: [],
        emojiTabList: {
          People: '人物',
          Nature: '自然',
          Foods: '食物',
          Activity: '活动',
          Places: '地点',
          Objects: '物体',
          Symbols: '符号',
          Flags: '旗帜'
        }
      }
    },

    ready () {
      this._init().switchEmojiTab('People', 0)
    },

    methods: {
      _init () {
        this.emojiDataGrouped = collection.groupBy(emojiData, 'c')
        return this
      },

      switchEmojiTab (key, index) {
        this.curEmojiList = []
        this.curEmojiIndex = index
        collection.forEach(this.emojiDataGrouped[key], (value) => {
          let word = `:${value.s}:`
          this.curEmojiList.push({
            word: word,
            html: this.emoji.replace_colons(word)
          })
        })
      }
    }
  }
</script>
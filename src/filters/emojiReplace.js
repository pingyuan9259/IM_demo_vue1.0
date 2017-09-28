import emoji from '../utils/emoji'

// emoji 过程
// emoji 文本代号 ---->(replace_colons_ex)----> emoji 字符    [上传 message with emoji]
// emoji 字符    ---->(replace_unified)---->   emoji 文本代号 [web 端显示]
// emoji 代号    ---->(replace_colons)---->    emoji 图片dom  [web 端显示]

export default (value) => {
  if (!value) {
    return ''
    // throw new Error('filter emojiReplace is lack of Value!')
  }
  return emoji.replace_unified(emoji.replace_colons(value))
}

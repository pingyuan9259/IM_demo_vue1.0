// 增强业务的函数库

import $ from 'jquery'

const scrollBottom = (el) => {
  let height = parseInt($(el).css('height'), 10)
  let borderTopSize = parseInt($(el).css('border-top'), 10)
  let borderBottomSize = parseInt($(el).css('border-bottom'), 10)
  let scrollBtm = el.scrollHeight - (height - borderTopSize - borderBottomSize)
  $(el).scrollTop(scrollBtm)
  return scrollBtm
}

const arrToObjByKey = (key, arr) => {
  if (!key) {
    throw new Error('arrToObjByKey in enhance.js is lack of key')
  }
  if (typeof key !== 'string') {
    throw new Error('arrToObjByKey in enhance.js, key should be string')
  }
  let result = {}
  for (let item of arr) {
    if (item[key]) {
      result[item[key]] = item
    }
  }
  return result
}

export {
  scrollBottom,
  arrToObjByKey
}

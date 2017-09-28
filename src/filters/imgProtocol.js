export default (value) => {
  if (!value) {
    return value
  }
  let res = value.match(/^(?:[^\/]*)\/\/(.+)/)
  res = res ? ('//' + res[1]) : ''

  if (res.indexOf('wx.img.tinfinite.com') !== -1) { // for https
    res = res.replace('wx.img', 'wx-img')
  }
  return res
}

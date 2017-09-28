export default (value) => {
  if (!value) {
    return ''
    // throw new Error('filter linkRelace is lack of Value!')
  }
  let RegUrl = new RegExp()
  let urlList = []

  RegUrl.compile('[h][t][t][p]+[s]?://[A-Za-z0-9-_]+\\.[A-Za-z0-9-_%&\?#\/.=]+[A-Za-z0-9]+/?', 'g') // eslint-disable-line
  urlList = value.match(RegUrl)

  if (!urlList || urlList.length === 0) {
    return value
  }

  for (let item of urlList) {
    value = value.replace(item, `<a href="${item}" target="_blank">${item}</a>`)
  }
  return value
}

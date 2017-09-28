let doc = document
let win = window

// demo 程序将粘贴事件绑定到 document 上
let pasteImg = (callback) => {
  doc.addEventListener('paste', (e) => {
    let cbd = e.clipboardData
    let ua = win.navigator.userAgent

    // 如果是 Safari 直接 return
    if (!(e.clipboardData && e.clipboardData.items)) {
      return
    }

    // Mac平台下Chrome49版本以下 复制Finder中的文件的Bug Hack掉
    if (cbd.items && cbd.items.length === 2 && cbd.items[0].kind === 'string' && cbd.items[1].kind === 'file' && cbd.types && cbd.types.length === 2 && cbd.types[0] === 'text/plain' && cbd.types[1] === 'Files' && ua.match(/Macintosh/i) && Number(ua.match(/Chrome\/(\d{2})/i)[1]) < 49) {
      return
    }

    for (let item of cbd.items) {
      if (item.kind === 'file') {
        let blob = item.getAsFile()

        if (blob.size === 0) {
          return
        }

        if (blob.type.indexOf('image') === -1) {
          return
        }

        if (!win.FileReader) {
          return
        }

        let reader = new win.FileReader()
        reader.onload = (e) => {
          let base64 = e.target.result
          base64 = base64.replace(/^data:image\/(png|jpg);base64,/, '')
          callback(base64)
        }
        reader.readAsDataURL(blob)
      }
    }
  }, false)
}

export default pasteImg

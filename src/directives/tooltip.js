import Tooltip from 'tether-tooltip'

export default {
  params: ['position', 'content'],
  bind () {
    let oOption = {
      target: this.el,
      position: this.params.position || 'top center',
      content: this.params.content || '',
      constrainToWindow: false
    }
    /* eslint-disable no-new */
    new Tooltip(oOption)
  }
}

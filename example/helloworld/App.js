import { h } from '../../lib/mini-vue.esm.js'

window.self = null
export const App = {
  render() {
    window.self = this
    // TODO: 第二个参数不传报错问题
    // return h('div', {}, 'hi,mini-vue')
    return h('div', { id: 'root', class: ['sayori', 'qwq'] }, [
      h('p', { class: 'red' }, 'hi,mini-vue'),
      h('p', {}, 'this.msg' + this.msg),
    ])
  },

  setup() {
    return {
      msg: 'mini-vue',
    }
  },
}

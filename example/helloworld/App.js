import { h } from '../../lib/mini-vue.esm'
export const App = {
  render() {
    return h('div', 'hi,mini-vue' + this.msg)
  },

  setup() {
    return {
      msg: 'mini-vue',
    }
  },
}

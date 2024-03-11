import { h } from '../../lib/mini-vue.esm.js'
import { Foo } from './foo.js'
window.self = null
export const App = {
  name: 'App',
  render() {
    window.self = this

    return h('div', {}, [
      h('div', {}, 'hi,mini-vue'),
      h(Foo, {
        onAdd() {
          console.log('onAdd')
        },
      }),
    ])
  },

  setup() {
    return {
      msg: 'mini-vue',
    }
  },
}

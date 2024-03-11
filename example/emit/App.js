import { h } from '../../lib/mini-vue.esm.js'
import { Foo } from './foo.js'

export const App = {
  name: 'App',
  render() {
    return h('div', {}, [
      h('div', {}, 'hi,mini-vue'),
      h(Foo, {
        onAdd(a, b) {
          console.log('onAdd', a + b)
        },
        onAddFoo() {
          console.log('onAddFoo')
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

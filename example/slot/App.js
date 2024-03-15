import { h } from '../../lib/mini-vue.esm.js'
import { Foo } from './foo.js'

export const App = {
  name: 'App',
  render() {
    const app = h('div', {}, 'app')
    const foo = h(Foo, {}, [h('p', {}, 'foo'), h('p', {}, 'foo2')])
    return h('div', {}, [app, foo])
  },

  setup() {
    return {
      msg: 'mini-vue',
    }
  },
}

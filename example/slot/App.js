import { h, createTextVNode } from '../../lib/mini-vue.esm.js'
import { Foo } from './foo.js'

export const App = {
  name: 'App',
  render() {
    const app = h('div', {}, 'app')
    // const foo = h(Foo, {}, [h('p', {}, '123'), h('p', {}, '456')])
    // 优化成对象形式，可以精确对应元素，以控制渲染的位置
    // 优化成func，以带props参数（作用域插槽）
    const foo = h(
      Foo,
      {},
      {
        header: ({ fooage }) => [
          h('h1', {}, 'header' + fooage),
          createTextVNode('文本节点'),
        ],
        footer: () => h('h1', {}, 'footer'),
      }
    )
    return h('div', {}, [app, foo])
  },

  setup() {
    return {
      msg: 'mini-vue',
    }
  },
}

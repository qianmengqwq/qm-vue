import {
  h,
  createTextVNode,
  getCurrentInstance,
  inject,
  provide,
} from '../../lib/mini-vue.esm.js'
// import { Foo } from './foo.js'
const Consumer = {
  name: 'Consumer',
  setup() {
    const foo = inject('foo')
    const bar = inject('bqwe', () => 'barDefault')
    return {
      foo,
      bar,
    }
  },
  render() {
    return h('div', {}, 'consumer' + this.foo + this.bar)
  },
}
export const App = {
  name: 'App',
  render() {
    const app = h('div', {}, 'app')
    // const foo = h(Foo, {}, [h('p', {}, '123'), h('p', {}, '456')])
    // 优化成对象形式，可以精确对应元素，以控制渲染的位置
    // 优化成func，以带props参数（作用域插槽）
    // const foo = h(
    //   Foo,
    //   {},
    //   {
    //     header: ({ fooage }) => [
    //       h('h1', {}, 'header' + fooage),
    //       createTextVNode('文本节点'),
    //     ],
    //     footer: () => h('h1', {}, 'footer'),
    //   }
    // )
    // return h('div', {}, [app, foo])
    return h('div', {}, [h('p', {}, 'provider'), h(mid)])
  },

  setup() {
    // const instance = getCurrentInstance()
    // console.log('app-instance', instance)
    // return {
    //   instance,
    // }
    provide('foo', 'fooValue')
    provide('bar', 'barValue')

    return {}
  },
}

const mid = {
  name: 'mid',
  render() {
    return h('div', {}, [h(Consumer)])
  },

  setup() {
    return {}
  },
}

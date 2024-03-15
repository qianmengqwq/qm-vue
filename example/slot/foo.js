import { h } from '../../lib/mini-vue.esm.js'
export const Foo = {
  name: 'Foo',
  setup(props, { emit }) {
    return {}
  },
  render() {
    const foo = h('div', {}, 'foo')
    return h('div', {}, [foo, h('div', {}, this.$slots)])
  },
}

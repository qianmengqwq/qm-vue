import { getCurrentInstance, h, renderSlots } from '../../lib/mini-vue.esm.js'
export const Foo = {
  name: 'Foo',
  setup() {
    const instance = getCurrentInstance()
    console.log('foo-instance', instance)
    return {}
  },
  render() {
    console.log('this.$slots', this.$slots)
    const foo = h('p', {}, 'foo组件')
    // return h('div', {}, [foo, h('div',{},this.$slots)])
    const fooage = 20
    return h('div', {}, [
      renderSlots(this.$slots, 'header', { fooage }),
      foo,
      renderSlots(this.$slots, 'footer'),
    ])
  },
}

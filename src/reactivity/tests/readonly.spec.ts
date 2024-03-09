import { readonly } from '../index'
import {
  isReactive,
  isReadonly,
  reactive,
  shallowReadonly,
  isProxy,
} from '../reactive'
describe('readonly', () => {
  it('happy path', () => {
    const original = { foo: 1 }
    const observed = readonly(original)
    expect(observed).not.toBe(original)
    expect(observed.foo).toBe(1)
  })

  it('isReadOnly', () => {
    const original = { foo: [{ name: 'sayori' }] }
    const readonlyObj = readonly(original)
    expect(isReadonly(readonlyObj)).toBe(true)
    expect(isReadonly(original)).toBe(false)

    expect(isReadonly(readonlyObj.foo)).toBe(true)

    expect(isReadonly(readonlyObj.foo[0])).toBe(true)

    const shallowReadonlyObj = shallowReadonly(original)
    expect(isReadonly(shallowReadonlyObj)).toBe(true)
    expect(isReadonly(shallowReadonlyObj.foo)).toBe(false)

    expect(isProxy(readonlyObj)).toBe(true)
  })

  it('warn', () => {
    console.warn = jest.fn()
    const user = readonly({
      age: 10,
    })
    user.age++
    expect(console.warn).toBeCalled()
  })
})

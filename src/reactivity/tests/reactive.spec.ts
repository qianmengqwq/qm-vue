import { reactive } from "../index"
import { isProxy, isReactive } from "../reactive"
describe('reactive', () => {
  it('happy path', () => {
    const original = { foo: 1 }
    const observed = reactive(original)
    expect(observed).not.toBe(original)
    // expect(observed.foo).toBe(1)
  })

  it('isReactive', () => {
    const original = { foo: 1 }
    const observed = reactive(original)
    expect(isReactive(observed)).toBe(true)
    expect(isReactive(original)).toBe(false)
    expect(isProxy(observed)).toBe(true)
  })

  it('nested',()=>{
    const original = {
      nested: { foo: 1 },
      array: [{ bar: 2 }]
    }
    const observed = reactive(original)
    expect(isReactive(observed)).toBe(true)
    expect(isReactive(observed.nested)).toBe(true)
    expect(isReactive(observed.array[0])).toBe(true)
  })
})

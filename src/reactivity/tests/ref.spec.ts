import { effect } from '../effect'
import { ref, isRef, unRef, proxyRefs } from '../ref'
describe('ref', () => {
  it('happy path', () => {
    let obj = ref(1)
    expect(obj.value).toBe(1)
  })

  it('ref is reactive', () => {
    const a = ref(1)
    let dummy,
      calls = 0
    effect(() => {
      calls++
      dummy = a.value
    })
    expect(calls).toBe(1)
    expect(dummy).toBe(1)
    a.value = 2
    expect(calls).toBe(2)
    expect(dummy).toBe(2)
    a.value = 2
    expect(calls).toBe(2)
    expect(dummy).toBe(2)
  })

  it('ref to reactive', () => {
    const obj = ref({ count: 1 })
    let dummy
    effect(() => {
      dummy = obj.value.count
    })

    expect(dummy).toBe(1)

    obj.value.count = 2
    expect(dummy).toBe(2)
  })

  it('isRef', () => {
    const obj = ref({ count: 1 })
    expect(isRef(obj)).toBe(true)
    expect(isRef(1)).toBe(false)
  })

  it('unref', () => {
    expect(unRef(1)).toBe(1)
    expect(unRef(ref(1))).toBe(1)
  })

  it('proxy ref', () => {
    const user = {
      age: ref(10),
      name: 'sayori',
    }

    const proxyUser = proxyRefs(user)
    expect(user.age.value).toBe(10)
    expect(proxyUser.age).toBe(10)
    expect(proxyUser.name).toBe('sayori')
    user.age.value = 20
    expect(proxyUser.age).toBe(20)
  })
})

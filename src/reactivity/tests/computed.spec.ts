import { computed } from '../computed'
import { reactive } from '../reactive'
describe('computed', () => {
  it('happy path', () => {
    const user = reactive({
      age: 10,
    })
    const age = computed(() => {
      return user.age
    })
    expect(age.value).toBe(10)
  })

  it('lazy', () => {
    const obj = reactive({ foo: 1 })

    const getter = jest.fn(() => {
      return obj.foo
    })

    const computedObj = computed(getter)

    // lazy
    expect(getter).not.toHaveBeenCalled()
    expect(computedObj.value).toBe(1)
    expect(getter).toHaveBeenCalledTimes(1)

    // should not compute again
    computedObj.value
    expect(getter).toHaveBeenCalledTimes(1)

    // should not compute until needed
    obj.foo = 2
    expect(getter).toHaveBeenCalledTimes(1)

    // now it should compute
    expect(computedObj.value).toBe(2)
    expect(getter).toHaveBeenCalledTimes(2)

    // should not compute again
    computedObj.value
    expect(getter).toHaveBeenCalledTimes(2)
    
  })
})

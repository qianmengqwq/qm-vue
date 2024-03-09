import { reactive, effect, stop } from '../index'
describe('effect', () => {
  it('happy path', () => {
    const user: any = reactive({
      age: 10,
    })
    let nextAge
    effect(() => {
      nextAge = user.age + 1
    })

    expect(nextAge).toBe(11)
    // update
    user.age++
    expect(nextAge).toBe(12)
  })

  it('return runner', () => {
    let foo = 10
    const runnerObj = effect(() => {
      foo++
      return 'foo'
    })

    expect(foo).toBe(11)
    const r = runnerObj.runner()
    expect(foo).toBe(12)
    expect(r).toBe('foo')
  })

  it('scheduler', () => {
    let dummy: any
    let run: any
    const scheduler = jest.fn(() => {
      run = runnerObj.runner
    })
    const obj = reactive({
      foo: 1,
    })
    const runnerObj = effect(
      () => {
        dummy = obj.foo
      },
      { scheduler }
    )

    expect(scheduler).not.toHaveBeenCalled()
    expect(dummy).toBe(1)
    obj.foo++
    expect(scheduler).toHaveBeenCalledTimes(1)
    expect(dummy).toBe(1)
    run()
    expect(dummy).toBe(2)
  })

  it('stop', () => {
    let dummy
    const obj = reactive({ foo: 1 })
    const runnerObj = effect(() => {
      dummy = obj.foo
    })
    expect(dummy).toBe(1)
    obj.foo = 2
    expect(dummy).toBe(2)
    stop(runnerObj)
    // obj.foo = 3
    // get + set，重新收集依赖
    obj.foo++
    expect(dummy).toBe(2)

    runnerObj.runner()
    expect(dummy).toBe(3)
  })

  it('onStop', () => {
    let dummy
    const obj = reactive({
      foo: 1,
    })
    const onStop = jest.fn()
    const runner = effect(
      () => {
        dummy = obj.foo
      },
      { onStop }
    )

    stop(runner)

    expect(onStop).toBeCalledTimes(1)
  })

  it('understand effect fn',()=>{
    const fn = ()=>{
      return 'fn-result'
    }
    const res = effect(fn)
    console.log('res',res)
    console.log('res.runner',res.runner)
    console.log('res.runner()',res.runner())
    const res2 = res.runner()
    expect(res2).toBe('fn-result')
  })
})

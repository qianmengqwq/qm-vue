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
    const runner = effect(() => {
      foo++
      return 'foo'
    })

    expect(foo).toBe(11)
    const r = runner.run()
    expect(foo).toBe(12)
    expect(r).toBe('foo')
  })

  it('scheduler', () => {
    let dummy: any
    let run: any
    const scheduler = jest.fn(() => {
      run = runner.run
    })
    const obj = reactive({
      foo: 1,
    })
    const runner = effect(
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
    const runner = effect(() => {
      dummy = obj.foo
    })
    expect(dummy).toBe(1)
    obj.foo = 2
    expect(dummy).toBe(2)
    stop(runner)
    // obj.foo = 3
    // get + set，重新收集依赖
    obj.foo++
    expect(dummy).toBe(2)

    runner.run()
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

  it('understand effect fn', () => {
    const fn = () => {
      return 'fn-result'
    }
    const res = effect(fn)
    effect(()=>{
      const res2 = 1
      console.log('res2',res2)
    })
    console.log('res', res)
    console.log('res.runner', res.run)
    console.log('res.runner()', res.run())
    const res2 = res.run()
    expect(res2).toBe('fn-result')
  })
})

import { extend } from '../shard'
interface Runner {
  effect: ReactiveEffect
  run: Function
}

interface EffectOptions {
  scheduler?: Function
  onStop?: Function
}
class ReactiveEffect {
  private _fn: Function
  // effect对应的dep，反向收集
  public deps: Set<ReactiveEffect>[] = []
  // 当前的effect是否会执行（stop会把他变成false）
  public active = true

  // options相关
  public scheduler: Function | undefined
  public onStop: Function | undefined

  constructor(fn: Function, scheduler?: Function) {
    this._fn = fn
    this.scheduler = scheduler
  }
  run():Runner {
    // 如果stop状态
    if (!this.active) {
      const res = this._fn()
      return res
    }
    shouldTrack = true
    activeEffect = this
    // 调用fn并返回fn返回值
    const res = this._fn()
    // reset
    shouldTrack = false
    return res
  }
  stop() {
    if (this.active) {
      cleanupEffect(this)
      if (this.onStop) {
        this.onStop()
      }
      this.active = false
    }
  }
}

const cleanupEffect = (effect: ReactiveEffect) => {
  effect.deps.forEach((dep: Set<any>) => {
    dep.delete(effect)
  })
  effect.deps.length = 0
}

// 全局变量，用来存储当前的effect
let activeEffect: ReactiveEffect | undefined
let shouldTrack: boolean = false
// targetMap:raw -> depsMap
const targetMap = new WeakMap()

function isTracking() {
  // 如果不应该收集，也就是被stop的情况中的++/--
  // 如果当前effect有值
  return shouldTrack && !!activeEffect
}

// 依赖收集
export function track(target: object, key: string | symbol) {
  if (!isTracking()) return
  // depsMap: all deps -> dep(set)
  let depsMap = targetMap.get(target)
  // 第一次，需要先创建映射关系
  if (!depsMap) {
    depsMap = new Map()
    targetMap.set(target, depsMap)
  }

  // 找到dep
  let dep: Set<ReactiveEffect> = depsMap.get(key)

  if (!dep) {
    dep = new Set()
    depsMap.set(key, dep)
  }

  if (!activeEffect) return
  if (dep.has(activeEffect)) return
  dep.add(activeEffect)
  // 反向存一下dep，否则拿不到
  activeEffect.deps.push(dep)
}

// 触发依赖
export function trigger(target: object, key: string | symbol) {
  const depsMap = targetMap.get(target)

  const dep = depsMap.get(key)

  dep.forEach((effect: ReactiveEffect) => {
    if (effect.scheduler) {
      effect.scheduler()
    } else {
      effect.run()
    }
  })
}

// 停止触发 方式是删除effect的依赖
// runner是接收到的effect.run
// runnerObj是包了一层的对象
export function stop(runner: Runner) {
  runner.effect.stop()
}

export function effect(fn: Function, options: EffectOptions = {}) {
  const _effect = new ReactiveEffect(fn)
  extend(_effect, options)

  _effect.run()
  // 把原函数返回出去，注意this需要重绑定，否则会拿不到_fn
  const run = _effect.run.bind(_effect)
  // 在runner上挂该effect
  const runner: Runner = {
    effect: _effect,
    run,
  }

  return runner
}

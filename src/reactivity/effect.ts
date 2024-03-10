import { extend } from '../shard'

class ReactiveEffect {
  private _fn: Function
  // effect对应的dep，反向收集
  public deps = []
  // 当前的effect是否会执行（stop会把他变成false）
  public active = true
  public scheduler: Function | undefined
  public onStop: Function | undefined
  constructor(fn: Function, scheduler?: Function) {
    this._fn = fn
    this.scheduler = scheduler
  }
  run() {
    // 如果stop状态
    if (!this.active) {
      return this._fn()
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
let activeEffect: any
let shouldTrack: boolean = false
// targetMap:raw -> depsMap
const targetMap = new WeakMap()

export function isTracking() {
  // 如果不应该收集，也就是被stop的情况中的++/--
  // 如果当前effect有值
  return shouldTrack && activeEffect
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
  let dep: Set<object> = depsMap.get(key)
  if (!dep) {
    dep = new Set()
    depsMap.set(key, dep)
  }

  trackEffects(dep)
}

export function trackEffects(dep) {
  if (dep.has(activeEffect)) return
  dep.add(activeEffect)
  // 反向存一下dep，否则拿不到
  activeEffect.deps.push(dep)
}

export function triggerEffects(dep) {
  for (let effect of dep) {
    if (effect.scheduler) {
      effect.scheduler()
    } else {
      effect.run()
    }
  }
}

// 触发依赖
export function trigger(target: object, key: string | symbol) {
  const depsMap = targetMap.get(target)

  const dep = depsMap.get(key)

  triggerEffects(dep)
}

// 停止触发 方式是删除effect的依赖
// runner是接收到的effect.run
export function stop(runner: any) {
  runner.effect.stop()
}

export function effect(fn: Function, options: any = {}) {
  const _effect = new ReactiveEffect(fn, options.scheduler)
  extend(_effect, options)

  _effect.run()
  // 把原函数返回出去，注意this需要重绑定，否则会拿不到_fn
  const runner = _effect.run.bind(_effect)
  // 在runner上挂该effect
  // TODO 修一下runner的类型问题
  runner.effect = _effect

  return runner
}

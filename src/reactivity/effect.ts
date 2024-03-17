import { extend } from '../shard/index'

interface EffectOptions {
  scheduler?: Function
  onStop?: Function
}

interface Runner {
  (): any
  effect: ReactiveEffect
}
export class ReactiveEffect {
  private _fn: Function
  // effect对应的dep，反向收集
  public deps: Set<ReactiveEffect>[] = []
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
  effect.deps.forEach((dep: Set<ReactiveEffect>) => {
    dep.delete(effect)
  })
  effect.deps.length = 0
}

// 全局变量，用来存储当前的effect
let activeEffect: ReactiveEffect | undefined
let shouldTrack: boolean = false
// targetMap:raw -> depsMap
const targetMap = new WeakMap()

export function isTracking() {
  // 如果不应该收集，也就是被stop的情况中的++/--
  // 如果当前effect有值
  return shouldTrack && activeEffect
}

// 收集activeEffect，并存到dep里
// 值得一提的是这里是双向的对应关系，Effect同样也存了一份deps
export function trackEffects(dep: Set<ReactiveEffect>) {
  if (!activeEffect) return
  if (dep.has(activeEffect)) return

  dep.add(activeEffect)
  // 反向存一下dep，否则拿不到
  activeEffect.deps.push(dep)
}

// 触发dep里的所有effect
export function triggerEffects(dep: Set<ReactiveEffect>) {
  dep.forEach((effect) => {
    // 如果effect有第二个参数（即scheduler，就调用他）
    if (effect.scheduler) {
      effect.scheduler()
    } else {
      effect.run()
    }
  })
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
  trackEffects(dep)
}

// 触发依赖
export function trigger(target: object, key: string | symbol) {
  const depsMap = targetMap.get(target)
  const dep = depsMap.get(key)
  triggerEffects(dep)
}

// 停止触发 方式是删除effect的依赖
// runner是接收到的effect.run
export function stop(runner: Runner) {
  runner.effect.stop()
}

export function effect(fn: Function, options: EffectOptions = {}) {
  const _effect = new ReactiveEffect(fn)
  extend(_effect, options)

  _effect.run()
  // 把原函数返回出去，注意this需要重绑定，否则会拿不到_fn
  const runner: Runner = _effect.run.bind(_effect) as Runner
  runner.effect = _effect

  return runner
}

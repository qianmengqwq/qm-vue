import { extend } from './shard'

class ReactiveEffect {
  private _fn
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
    activeEffect = this
    // 调用fn并返回fn返回值
    const res = this._fn()
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

const cleanupEffect = (effect) => {
  effect.deps.forEach((dep: Set<any>) => {
    dep.delete(effect)
  })
}

// 全局变量，用来存储当前的effect
let activeEffect: any
// targetMap:raw -> depsMap
const targetMap = new WeakMap()

// 依赖收集
export function track(target: any, key: any) {
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

  // if (!activeEffect) return
  dep.add(activeEffect)
  // 反向存一下dep，否则拿不到
  activeEffect.deps.push(dep)
}

// 触发依赖
export function trigger(target, key) {
  const depsMap = targetMap.get(target)

  const dep = depsMap.get(key)

  for (let effect of dep) {
    if (effect.scheduler) {
      effect.scheduler()
    } else {
      effect.run()
    }
  }
}

// 停止触发 方式是删除effect的依赖
// runner是接收到的effect.run
export function stop(runner) {
  runner.effect.stop()
}

export function effect(fn: Function, options: any = {}) {
  const _effect = new ReactiveEffect(fn, options.scheduler)
  extend(_effect, options)

  _effect.run()
  // 把原函数返回出去，注意this需要重绑定，否则会拿不到_fn
  const runner = _effect.run.bind(_effect)
  // 在runner上挂该effect
  runner.effect = _effect

  return runner
}
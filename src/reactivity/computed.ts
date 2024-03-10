import { ReactiveEffect } from './effect'
class ComputedRefImpl {
  private _getter
  // 缓存能力的来源
  private _dirty: boolean = true
  private _value: any
  private _effect: ReactiveEffect
  constructor(getter: Function) {
    this._getter = getter
    // 内部依赖发生改变的时候，执行scheduler,把dirty打开
    this._effect = new ReactiveEffect(getter, () => {
      if (!this._dirty) {
        this._dirty = true
      }
    })
  }

  get value() {
    if (this._dirty) {
      this._dirty = false
      this._value = this._effect.run()
    }
    return this._value
  }
}

export function computed(getter: Function) {
  return new ComputedRefImpl(getter)
}

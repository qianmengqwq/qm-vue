import { hasChanged, isObject } from '../shard'
import {
  ReactiveEffect,
  isTracking,
  trackEffects,
  triggerEffects,
} from './effect'
import { reactive } from './reactive'

class RefImpl {
  public _value: any
  public dep: Set<ReactiveEffect>
  private _raw: any
  public __v_isRef = true
  constructor(raw: any) {
    this._raw = raw
    this._value = refToReactive(raw)
    this.dep = new Set()
  }
  get value() {
    return trackRefValue(this)
  }

  set value(newValue: any) {
    if (hasChanged(newValue, this._value)) {
      this._value = refToReactive(newValue)
      triggerEffects(this.dep)
    }
  }
}

function refToReactive(value: any) {
  return isObject(value) ? reactive(value) : value
}

function trackRefValue(ref: RefImpl) {
  if (isTracking()) {
    trackEffects(ref.dep)
  }
  return ref._value
}

export function ref<T>(value: T) {
  return new RefImpl(value)
}

export function isRef(ref: any) {
  return !!ref.__v_isRef
}

export function unRef(ref: any) {
  return isRef(ref) ? ref.value : ref
}

interface Ref<T> {
  value: T
}
// 用于模版中可以直接拿到ref值
export function proxyRefs<T extends object>(objectWithRefs: T) {
  return new Proxy<T>(objectWithRefs, {
    get(target, key, receiver) {
      return unRef(Reflect.get(target, key, receiver))
    },
    set(target, key, value, receiver) {
      if (isRef(Reflect.get(target, key, receiver)) && !isRef(value)) {
        return ((target[key as keyof T] as Ref<any>).value = value)
      } else {
        return Reflect.set(target, key, value, receiver)
      }
    },
  })
}

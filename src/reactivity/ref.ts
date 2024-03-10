import { hasChanged, isObject } from '../shard'
import { isTracking, trackEffects, triggerEffects } from './effect'
import { reactive } from './reactive'

class RefImpl {
  private _value: any
  public dep
  private _raw
  public __v_isRef = true
  constructor(value: any) {
    this._raw = value
    this._value = refToReactive(value)

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

function refToReactive(value) {
  return isObject(value) ? reactive(value) : value
}

function trackRefValue(ref) {
  if (isTracking()) {
    trackEffects(ref.dep)
  }
  return ref._value
}

export function ref(value: any) {
  return new RefImpl(value)
}

export function isRef(ref) {
  return !!ref.__v_isRef
}

export function unRef(ref) {
  return isRef(ref) ? ref.value : ref
}

// 用于模版中可以直接拿到ref值
export function proxyRefs(objectWithRefs) {
  return new Proxy(objectWithRefs, {
    get(target, key, receiver) {
      return unRef(Reflect.get(target, key, receiver))
    },
    set(target, key, value, receiver) {
      if (isRef(Reflect.get(target, key, receiver)) && !isRef(value)) {
        return target[key].value = value
      } else{
        return Reflect.set(target, key, value, receiver)
      }
    },
  })
}

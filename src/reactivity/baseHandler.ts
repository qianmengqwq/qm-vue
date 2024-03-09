import { isObject, extend } from '../shard'
import { reactive, readonly, track, trigger } from './index'

enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive',
  IS_READONLY = '__v_isReadonly',
}

const createGetter = (
  isReadonly: boolean = false,
  isShallow: boolean = false
) => {
  return (target: object, key: string | symbol, receiver: any) => {
    const res = Reflect.get(target, key, receiver)
    // isReactive和isReadonly，通过触发getter以及指定key的方式来实现
    if (key === ReactiveFlags.IS_REACTIVE) {
      return !isReadonly
    } else if (key === ReactiveFlags.IS_READONLY) {
      return !!isReadonly
    }

    if (isShallow) {
      return res
    }

    if (isObject(res)) {
      return isReadonly ? readonly(res) : reactive(res)
    }

    if (!isReadonly) {
      track(target, key)
    }
    return res
  }
}

const createSetter = () => {
  return (target: object, key: string | symbol, value: any, receiver: any) => {
    const res = Reflect.set(target, key, value, receiver)
    trigger(target, key)
    return res
  }
}
// 缓存，让createGetter只执行一次
const get = createGetter(false)
const set = createSetter()
export const mutableHandlers = {
  get,
  set,
}

const readonlyGet = createGetter(true)

export const readonlyHandlers = {
  get: readonlyGet,
  set: () => {
    console.warn('set is readonly')
    return true
  },
}

const shallowReadonlyGet = createGetter(true, true)
export const shallowReadonlyHandlers = extend({}, readonlyHandlers, {
  get: shallowReadonlyGet,
})

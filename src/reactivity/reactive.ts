import {
  mutableHandlers,
  readonlyHandlers,
  shallowReadonlyHandlers,
} from './baseHandler'

type BaseHandler =
  | typeof mutableHandlers
  | typeof readonlyHandlers
  | typeof shallowReadonlyHandlers
const createReactiveObject = <T extends object>(
  raw: T,
  baseHandlers: BaseHandler
) => {
  return new Proxy<T>(raw, baseHandlers)
}

export function reactive<T extends object>(raw: T) {
  return createReactiveObject(raw, mutableHandlers)
}

export function readonly<T extends object>(raw: T) {
  return createReactiveObject(raw, readonlyHandlers)
}

export function shallowReadonly<T extends object>(raw: T) {
  return createReactiveObject(raw, shallowReadonlyHandlers)
}

enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive',
  IS_READONLY = '__v_isReadonly',
}

// 传原始对象会访问不到指定属性，把undefined变成true
export function isReactive(value: any) {
  return !!value[ReactiveFlags.IS_REACTIVE]
}

export function isReadonly(value: any) {
  return !!value[ReactiveFlags.IS_READONLY]
}

export function isProxy(value: any) {
  return isReactive(value) || isReadonly(value)
}

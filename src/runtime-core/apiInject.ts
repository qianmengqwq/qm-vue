import { getCurrentInstance } from './index'

export function provide(key: string, value: any) {
  const currentInstance = getCurrentInstance()
  if (currentInstance) {
    let { provides } = currentInstance
    const parentProvides = currentInstance.parent?.provides

    // 利用原型链实现provides
    // init只执行一次
    if (provides === parentProvides) {
      provides = Object.create(parentProvides)
    }

    provides[key] = value
  }
}

export function inject(key: string, defaultVal: any) {
  const currentInstance = getCurrentInstance()
  if (currentInstance) {
    const parentProvides = currentInstance.parent.provides
    if (key in parentProvides) {
      return parentProvides[key]
    } else if (defaultVal) {
      if (typeof defaultVal === 'function') {
        return defaultVal()
      }
      return defaultVal
    }
  }
}

interface ProxyHandler {
  get(
    target: { _: ComponentInstance },
    property: PropertyKey,
    receiver: any
  ): any
}

const propertiesMap = new Map<PropertyKey, Function>()

propertiesMap.set('$el', (instance: ComponentInstance) => instance.vnode.el)

export const instanceProxyHandler: ProxyHandler = {
  get({ _: instance }, key, receiver) {
    const { setupState } = instance
    if (key in setupState) {
      return setupState[key as keyof typeof setupState]
    }

    //访问$el的时候触发getter，返回el
    // 只在这里写没用，会拿到挂app组件时候的el，是一个空架子
    // 需要等到至少root挂载了才能找到根节点
    if (propertiesMap.has(key)) {
      return propertiesMap.get(key)!(instance)
    }
  },
}

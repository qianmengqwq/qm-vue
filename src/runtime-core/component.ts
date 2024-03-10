export function createComponentInstance(vnode: any) {
  const component = {
    vnode,
    type: vnode.type,
  }
  return component
}

export function setupComponent(instance: any) {
  // initProps()
  // initSlots()

  setupStatefulComponent(instance)
}

function setupStatefulComponent(instance: any) {
  const Component = instance.vnode.type
  const { setup } = Component
  if (setup) {
    //function -> render Object -> 注入到上下文中
    const setupResult = setup()

    handleSetupResult(instance, setupResult)
  }
}

function handleSetupResult(instance: any, setupResult: any) {
  if (typeof setupResult === 'object') {
    instance.setupState = setupResult
  }

  finishComponentSetup(instance)
}

function finishComponentSetup(instance: any) {
  const Component = instance.type
  instance.render = Component.render
}

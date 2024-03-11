import { shallowReadonly } from '../reactivity/reactive'
import { emit } from './componentEmit'
import { initProps } from './componentProps'
import { instanceProxyHandler } from './instanceProxyHandler'

export function createComponentInstance(vnode: Vnode) {
  const component: ComponentInstance = {
    vnode,
    type: vnode.type,
    setupState: {},
    proxy: {},
    render: () => {},
    props: {},
    emit: () => {},
  }

  component.emit = emit.bind(null, component)
  return component
}

export function setupComponent(instance: ComponentInstance) {
  console.log('instance', instance)
  initProps(instance)
  // initSlots()

  setupStatefulComponent(instance)
}

function setupStatefulComponent(instance: ComponentInstance) {
  const Component = instance.type
  instance.proxy = new Proxy({ _: instance }, instanceProxyHandler)
  const { setup } = Component
  if (setup) {
    //function -> render
    // Object -> 注入到上下文中
    const setupResult = setup(shallowReadonly(instance.props), {
      emit: instance.emit,
    })

    handleSetupResult(instance, setupResult)
  }
}

function handleSetupResult(instance: ComponentInstance, setupResult: any) {
  if (typeof setupResult === 'object') {
    instance.setupState = setupResult
  }

  finishComponentSetup(instance)
}

function finishComponentSetup(instance: ComponentInstance) {
  const Component = instance.type

  instance.render = Component.render
}

import { shallowReadonly } from '../reactivity/reactive'
import { emit } from './componentEmit'
import { initProps } from './componentProps'
import { initSlots } from './componentSlots'
import { instanceProxyHandler } from './componentPublicInstance'

let currentInstance: ComponentInstance | null = null
export function createComponentInstance(vnode: Vnode, parent: any) {
  const component: ComponentInstance = {
    vnode,
    type: vnode.type,
    setupState: {},
    proxy: {},
    render: () => {},
    props: {},
    emit: () => {},
    slots: {},
    parent,
    provides: parent ? parent.provides : {},
  }

  component.emit = emit.bind(null, component)
  return component
}

export function setupComponent(instance: ComponentInstance) {
  console.log('instance', instance)
  initProps(instance)
  initSlots(instance, instance.vnode.children)

  setupStatefulComponent(instance)
}

function setupStatefulComponent(instance: ComponentInstance) {
  const Component = instance.type
  instance.proxy = new Proxy({ _: instance }, instanceProxyHandler)
  const { setup } = Component
  if (setup) {
    //function -> render
    // Object -> 注入到上下文中
    setCurrentInstance(instance)
    const setupResult = setup(shallowReadonly(instance.props), {
      emit: instance.emit,
    })
    setCurrentInstance(null)
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

export function getCurrentInstance() {
  if (!currentInstance) {
    throw new Error('请在setup中调用getCurrentInstance')
  }
  return currentInstance
}

export function setCurrentInstance(instance: ComponentInstance | null) {
  currentInstance = instance
}

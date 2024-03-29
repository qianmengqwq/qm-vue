import { ShapeFlags } from './ShapeFlags'

export const Fragment = Symbol('Fragment')
export const __Text = Symbol('__Text')
export function createVnode(
  type: ComponentInstance | string | symbol,
  props?: object,
  children?: Array<any> | string
) {
  const vnode: Vnode = {
    type,
    props,
    children,
    shapeFlag: getShapeFlag(type),
    el: null,
  }

  if (typeof children === 'string') {
    vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN
  } else if (Array.isArray(children)) {
    vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN
  }

  // 判断slot的children：组件+children为object
  if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
    if (typeof children === 'object') {
      vnode.shapeFlag |= ShapeFlags.SLOT_CHILDREN
    }
  }
  return vnode
}

function getShapeFlag(type: unknown) {
  return typeof type === 'string'
    ? ShapeFlags.ELEMENT
    : ShapeFlags.STATEFUL_COMPONENT
}

export function createTextVNode(text: string) {
  return createVnode(__Text, {}, text)
}

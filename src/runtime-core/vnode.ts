import { ShapeFlags } from './ShapeFlags'
export function createVnode(
  type: ComponentInstance | string,
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
  return vnode
}

function getShapeFlag(type: unknown) {
  return typeof type === 'string'
    ? ShapeFlags.ELEMENT
    : ShapeFlags.STATEFUL_COMPONENT
}

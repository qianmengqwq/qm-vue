export function createVnode(type: any, props?: any, children?: any) {
  const vnode: Vnode = {
    type,
    props,
    children,
    el: null,
  }
  return vnode
}

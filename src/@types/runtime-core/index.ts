interface Vnode {
  type: any
  props: any
  children: any
  el: HTMLElement | null
  shapeFlag: number
}

interface ComponentInstance {
  vnode: Vnode
  type: any
  proxy: object
  setupState: object
  render: Function
}

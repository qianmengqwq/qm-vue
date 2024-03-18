interface Vnode {
  type: any
  props: any
  children: any
  el: HTMLElement | null | Text
  shapeFlag: number
}

interface ComponentInstance {
  vnode: Vnode
  type: any
  proxy: object
  setupState: object
  render: Function
  props: any
  emit: Function
  slots: any
  parent: any
  provides:any
}

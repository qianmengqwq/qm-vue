export function initSlots(instance: ComponentInstance) {
  instance.slots = Array.isArray(instance.vnode.children)
    ? instance.vnode.children
    : [instance.vnode.children]
}

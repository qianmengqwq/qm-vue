import { ShapeFlags } from './ShapeFlags'
export function initSlots(instance: ComponentInstance, children: any[]) {
  const { vnode } = instance
  if (vnode.shapeFlag & ShapeFlags.SLOT_CHILDREN) {
    normalizeObjectSlots(children, instance.slots)
  }
}

function normalizeObjectSlots(children: any, slots: any) {
  for (const key in children) {
    const val = children[key]
    slots[key] = (props: any) => normalizeSlotValue(val(props))
  }
}
function normalizeSlotValue(value: any) {
  return Array.isArray(value) ? value : [value]
}

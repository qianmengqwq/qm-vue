import { createVnode } from '../vnode'

// slots是一个数组，需要用h调用返回虚拟节点
// 增强：可以是一个对象
export function renderSlots(slots: any, name: string, props: any) {
  const slot = slots[name]
  if (typeof slot === 'function') {
    return createVnode('div', {}, slot(props))
  }
}

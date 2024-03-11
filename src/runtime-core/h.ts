import { createVnode } from './vnode'
export function h(
  type: ComponentInstance | string,
  props?: object,
  children?: string | Array<any>
) {
  return createVnode(type, props, children)
}

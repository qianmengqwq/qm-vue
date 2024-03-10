import { isObject } from '../shard/index'
import { createComponentInstance, setupComponent } from './component'

export function render(vnode: Vnode, container: any) {
  //调用patch 方便递归处理
  patch(vnode, container)
}

function patch(vnode: Vnode, container: any) {
  console.log('vnode.type', vnode.type)
  if (typeof vnode.type === 'string') {
    processElement(vnode, container)
  } else if (isObject(vnode.type)) {
    processComponent(vnode, container)
  }
}

function processComponent(vnode: Vnode, container: any) {
  mountComponent(vnode, container)
}

function processElement(vnode: Vnode, container: any) {
  mountElement(vnode, container)
}

function mountElement(vnode: Vnode, container: any) {
  const el: HTMLElement = document.createElement(vnode.type)

  // 存储el
  vnode.el = el

  const { props, children } = vnode
  if (typeof children === 'string') {
    el.textContent = children
  } else if (Array.isArray(children)) {
    children.forEach((vnode) => {
      patch(vnode, el)
    })
  }

  for (const key in props) {
    const val = props[key]
    el.setAttribute(key, val)
  }

  container.appendChild(el)
}

function mountComponent(initialVNode: Vnode, container: any) {
  const instance = createComponentInstance(initialVNode)
  setupComponent(instance)

  setupRenderEffect(instance, initialVNode, container)
}

function setupRenderEffect(
  instance: ComponentInstance,
  initialVNode: Vnode,
  container: any
) {
  const { proxy } = instance
  const subTree = instance.render.call(proxy)

  // vnode -> patch
  // vnode -> element -> mountElement
  patch(subTree, container)

  //得等到至少app挂载了才能找到根节点

  //   instance.vnode.el = subTree.el
  initialVNode.el = subTree.el
  //   console.log(
  //     'instance.vnode.el === subTree.el',
  //     instance.vnode.el === subTree.el
  //   )
}

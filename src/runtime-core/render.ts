import { ShapeFlags } from './ShapeFlags'
import { createComponentInstance, setupComponent } from './component'
import { Fragment,__Text} from './vnode'

export function render(vnode: Vnode, container: any) {
  //调用patch 方便递归处理
  patch(vnode, container)
}

function patch(vnode: Vnode, container: any) {
  const { type, shapeFlag } = vnode

  switch (type) {
    case Fragment:
      processFragment(vnode, container)
      break
    case __Text:
      processText(vnode, container)
      break
    default:
      if (shapeFlag & ShapeFlags.ELEMENT) {
        processElement(vnode, container)
      } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        processComponent(vnode, container)
      }
  }
}

function processFragment(vnode: Vnode, container: any) {
  mountChildren(vnode, container)
}

function mountChildren(vnode: Vnode, container: any) {
  vnode.children.forEach((vnode: Vnode) => {
    patch(vnode, container)
  })
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

  const { props, children, shapeFlag } = vnode

  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    el.textContent = children
  } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    children.forEach((vnode: Vnode) => {
      patch(vnode, el)
    })
  }

  for (const key in props) {
    const val = props[key]
    // console.log('key',key)
    const isOn = (key: string) => /^on[A-Z]/.test(key)
    if (isOn(key)) {
      const event = key.slice(2).toLowerCase()
      el.addEventListener(event, val)
    }
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

function processText(vnode: Vnode, container: any) {
  const { children } = vnode
  const textNode = document.createTextNode(children)
  console.log('textNode', textNode)
  vnode.el = textNode
  container.append(textNode)
}

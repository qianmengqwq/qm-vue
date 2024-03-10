import { createComponentInstance, setupComponent } from "./component"

export function render(vnode:any, container:any) {
  //调用patch 方便递归处理
  patch(vnode, container)
}

function patch(vnode:any, container:any) {
    processComponent(vnode, container)
}

function  processComponent(vnode:any, container:any){

mountComponent(vnode,container)
}

function mountComponent(vnode:any, container:any) {
    const instance = createComponentInstance(vnode)
    setupComponent(instance)

    
    setupRenderEffect(instance, vnode)
    
}

function setupRenderEffect(instance:any,container:any){
    const subTree = instance.render()

    // vnode -> patch
    // vnode -> element -> mountElement
    patch(subTree, container)
}
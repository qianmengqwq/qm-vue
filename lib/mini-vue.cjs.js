'use strict';

const isObject = (val) => val !== null && typeof val === 'object';

const propertiesMap = new Map();
propertiesMap.set('$el', (instance) => instance.vnode.el);
const instanceProxyHandler = {
    get({ _: instance }, key, receiver) {
        const { setupState } = instance;
        if (key in setupState) {
            return setupState[key];
        }
        //访问$el的时候触发getter，返回el
        // 只在这里写没用，会拿到挂app组件时候的el，是一个空架子
        // 需要等到至少root挂载了才能找到根节点
        if (propertiesMap.has(key)) {
            return propertiesMap.get(key)(instance);
        }
    },
};

function createComponentInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
        proxy: {},
        render: () => { },
    };
    return component;
}
function setupComponent(instance) {
    // initProps()
    // initSlots()
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    const Component = instance.type;
    instance.proxy = new Proxy({ _: instance }, instanceProxyHandler);
    const { setup } = Component;
    if (setup) {
        //function -> render
        // Object -> 注入到上下文中
        const setupResult = setup();
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    if (typeof setupResult === 'object') {
        instance.setupState = setupResult;
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    const Component = instance.type;
    instance.render = Component.render;
}

function render(vnode, container) {
    //调用patch 方便递归处理
    patch(vnode, container);
}
function patch(vnode, container) {
    console.log('vnode.type', vnode.type);
    if (typeof vnode.type === 'string') {
        processElement(vnode, container);
    }
    else if (isObject(vnode.type)) {
        processComponent(vnode, container);
    }
}
function processComponent(vnode, container) {
    mountComponent(vnode, container);
}
function processElement(vnode, container) {
    mountElement(vnode, container);
}
function mountElement(vnode, container) {
    const el = document.createElement(vnode.type);
    // 存储el
    vnode.el = el;
    const { props, children } = vnode;
    if (typeof children === 'string') {
        el.textContent = children;
    }
    else if (Array.isArray(children)) {
        children.forEach((vnode) => {
            patch(vnode, el);
        });
    }
    for (const key in props) {
        const val = props[key];
        el.setAttribute(key, val);
    }
    container.appendChild(el);
}
function mountComponent(initialVNode, container) {
    const instance = createComponentInstance(initialVNode);
    setupComponent(instance);
    setupRenderEffect(instance, initialVNode, container);
}
function setupRenderEffect(instance, initialVNode, container) {
    const { proxy } = instance;
    const subTree = instance.render.call(proxy);
    // vnode -> patch
    // vnode -> element -> mountElement
    patch(subTree, container);
    //得等到至少app挂载了才能找到根节点
    //   instance.vnode.el = subTree.el
    initialVNode.el = subTree.el;
    //   console.log(
    //     'instance.vnode.el === subTree.el',
    //     instance.vnode.el === subTree.el
    //   )
}

function createVnode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
        el: null,
    };
    return vnode;
}

function createApp(rootComponent) {
    return {
        mount(rootContainer) {
            // 1. component -> vnode
            const vnode = createVnode(rootComponent);
            render(vnode, rootContainer);
        },
    };
}

function h(type, props, children) {
    return createVnode(type, props, children);
}

exports.createApp = createApp;
exports.h = h;

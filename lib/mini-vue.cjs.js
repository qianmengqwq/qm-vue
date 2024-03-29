'use strict';

var ShapeFlags;
(function (ShapeFlags) {
    ShapeFlags[ShapeFlags["ELEMENT"] = 1] = "ELEMENT";
    ShapeFlags[ShapeFlags["STATEFUL_COMPONENT"] = 2] = "STATEFUL_COMPONENT";
    ShapeFlags[ShapeFlags["TEXT_CHILDREN"] = 4] = "TEXT_CHILDREN";
    ShapeFlags[ShapeFlags["ARRAY_CHILDREN"] = 8] = "ARRAY_CHILDREN";
    ShapeFlags[ShapeFlags["SLOT_CHILDREN"] = 16] = "SLOT_CHILDREN";
})(ShapeFlags || (ShapeFlags = {}));

const extend = Object.assign;
const isObject = (val) => val !== null && typeof val === 'object';
const hasOwn = (val, key) => Object.prototype.hasOwnProperty.call(val, key);
const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const camelCase = (s) => s.replace(/-(\w)/g, (_, c) => (c ? c.toUpperCase() : ''));

// targetMap:raw -> depsMap
const targetMap = new WeakMap();
// 触发dep里的所有effect
function triggerEffects(dep) {
    dep.forEach((effect) => {
        // 如果effect有第二个参数（即scheduler，就调用他）
        if (effect.scheduler) {
            effect.scheduler();
        }
        else {
            effect.run();
        }
    });
}
// 触发依赖
function trigger(target, key) {
    const depsMap = targetMap.get(target);
    const dep = depsMap.get(key);
    triggerEffects(dep);
}

var ReactiveFlags$1;
(function (ReactiveFlags) {
    ReactiveFlags["IS_REACTIVE"] = "__v_isReactive";
    ReactiveFlags["IS_READONLY"] = "__v_isReadonly";
})(ReactiveFlags$1 || (ReactiveFlags$1 = {}));
const createGetter = (isReadonly = false, isShallow = false) => {
    return (target, key, receiver) => {
        const res = Reflect.get(target, key, receiver);
        // isReactive和isReadonly，通过触发getter以及指定key的方式来实现
        if (key === ReactiveFlags$1.IS_REACTIVE) {
            return !isReadonly;
        }
        else if (key === ReactiveFlags$1.IS_READONLY) {
            return !!isReadonly;
        }
        if (isShallow) {
            return res;
        }
        if (isObject(res)) {
            return isReadonly ? readonly(res) : reactive(res);
        }
        return res;
    };
};
const createSetter = () => {
    return (target, key, value, receiver) => {
        const res = Reflect.set(target, key, value, receiver);
        trigger(target, key);
        return res;
    };
};
// 缓存，让createGetter只执行一次
const get = createGetter(false);
const set = createSetter();
const mutableHandlers = {
    get,
    set,
};
const readonlyGet = createGetter(true);
const readonlyHandlers = {
    get: readonlyGet,
    set: () => {
        console.warn('set is readonly');
        return true;
    },
};
const shallowReadonlyGet = createGetter(true, true);
const shallowReadonlyHandlers = extend({}, readonlyHandlers, {
    get: shallowReadonlyGet,
});

const createReactiveObject = (raw, baseHandlers) => {
    return new Proxy(raw, baseHandlers);
};
function reactive(raw) {
    return createReactiveObject(raw, mutableHandlers);
}
function readonly(raw) {
    return createReactiveObject(raw, readonlyHandlers);
}
function shallowReadonly(raw) {
    if (!isObject(raw)) {
        console.warn(`target ${raw} must be an object`);
        return;
    }
    return createReactiveObject(raw, shallowReadonlyHandlers);
}
var ReactiveFlags;
(function (ReactiveFlags) {
    ReactiveFlags["IS_REACTIVE"] = "__v_isReactive";
    ReactiveFlags["IS_READONLY"] = "__v_isReadonly";
})(ReactiveFlags || (ReactiveFlags = {}));

function emit(instance, event, ...args) {
    const { props } = instance;
    const handler = props['on' + capitalize(camelCase(event))];
    handler && handler(...args);
}

function initProps(instance) {
    instance.props = instance.vnode.props || {};
}

function initSlots(instance, children) {
    const { vnode } = instance;
    if (vnode.shapeFlag & ShapeFlags.SLOT_CHILDREN) {
        normalizeObjectSlots(children, instance.slots);
    }
}
function normalizeObjectSlots(children, slots) {
    for (const key in children) {
        const val = children[key];
        slots[key] = (props) => normalizeSlotValue(val(props));
    }
}
function normalizeSlotValue(value) {
    return Array.isArray(value) ? value : [value];
}

const propertiesMap = new Map();
propertiesMap.set('$el', (instance) => instance.vnode.el);
propertiesMap.set('$slots', (instance) => instance.slots);
const instanceProxyHandler = {
    get({ _: instance }, key, receiver) {
        const { setupState, props } = instance;
        if (key in setupState) {
            return setupState[key];
        }
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        else if (hasOwn(props, key)) {
            return props[key];
        }
        //访问$el的时候触发getter，返回el
        // 只在这里写没用，会拿到挂app组件时候的el，是一个空架子
        // 需要等到至少root挂载了才能找到根节点
        if (propertiesMap.has(key)) {
            return propertiesMap.get(key)(instance);
        }
    },
};

let currentInstance = null;
function createComponentInstance(vnode, parent) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
        proxy: {},
        render: () => { },
        props: {},
        emit: () => { },
        slots: {},
        parent,
        provides: parent ? parent.provides : {},
    };
    component.emit = emit.bind(null, component);
    return component;
}
function setupComponent(instance) {
    console.log('instance', instance);
    initProps(instance);
    initSlots(instance, instance.vnode.children);
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    const Component = instance.type;
    instance.proxy = new Proxy({ _: instance }, instanceProxyHandler);
    const { setup } = Component;
    if (setup) {
        //function -> render
        // Object -> 注入到上下文中
        setCurrentInstance(instance);
        const setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit,
        });
        setCurrentInstance(null);
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
function getCurrentInstance() {
    if (!currentInstance) {
        throw new Error('请在setup中调用getCurrentInstance');
    }
    return currentInstance;
}
function setCurrentInstance(instance) {
    currentInstance = instance;
}

const Fragment = Symbol('Fragment');
const __Text = Symbol('__Text');
function createVnode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
        shapeFlag: getShapeFlag(type),
        el: null,
    };
    if (typeof children === 'string') {
        vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN;
    }
    else if (Array.isArray(children)) {
        vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN;
    }
    // 判断slot的children：组件+children为object
    if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        if (typeof children === 'object') {
            vnode.shapeFlag |= ShapeFlags.SLOT_CHILDREN;
        }
    }
    return vnode;
}
function getShapeFlag(type) {
    return typeof type === 'string'
        ? ShapeFlags.ELEMENT
        : ShapeFlags.STATEFUL_COMPONENT;
}
function createTextVNode(text) {
    return createVnode(__Text, {}, text);
}

function render(vnode, container) {
    //调用patch 方便递归处理
    patch(vnode, container, null);
}
function patch(vnode, container, parentComponent) {
    const { type, shapeFlag } = vnode;
    switch (type) {
        case Fragment:
            processFragment(vnode, container, parentComponent);
            break;
        case __Text:
            processText(vnode, container);
            break;
        default:
            if (shapeFlag & ShapeFlags.ELEMENT) {
                processElement(vnode, container, parentComponent);
            }
            else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
                processComponent(vnode, container, parentComponent);
            }
    }
}
function processFragment(vnode, container, parentComponent) {
    mountChildren(vnode, container, parentComponent);
}
function mountChildren(vnode, container, parentComponent) {
    vnode.children.forEach((vnode) => {
        patch(vnode, container, parentComponent);
    });
}
function processComponent(vnode, container, parentComponent) {
    mountComponent(vnode, container, parentComponent);
}
function processElement(vnode, container, parentComponent) {
    mountElement(vnode, container, parentComponent);
}
function mountElement(vnode, container, parentComponent) {
    const el = document.createElement(vnode.type);
    // 存储el
    vnode.el = el;
    const { props, children, shapeFlag } = vnode;
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
        el.textContent = children;
    }
    else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        mountChildren(vnode, el, parentComponent);
    }
    for (const key in props) {
        const val = props[key];
        // console.log('key',key)
        const isOn = (key) => /^on[A-Z]/.test(key);
        if (isOn(key)) {
            const event = key.slice(2).toLowerCase();
            el.addEventListener(event, val);
        }
        el.setAttribute(key, val);
    }
    container.appendChild(el);
}
function mountComponent(initialVNode, container, parentComponent) {
    const instance = createComponentInstance(initialVNode, parentComponent);
    setupComponent(instance);
    setupRenderEffect(instance, initialVNode, container);
}
function setupRenderEffect(instance, initialVNode, container) {
    const { proxy } = instance;
    const subTree = instance.render.call(proxy);
    // vnode -> patch
    // vnode -> element -> mountElement
    patch(subTree, container, instance);
    //得等到至少app挂载了才能找到根节点
    //   instance.vnode.el = subTree.el
    initialVNode.el = subTree.el;
    //   console.log(
    //     'instance.vnode.el === subTree.el',
    //     instance.vnode.el === subTree.el
    //   )
}
function processText(vnode, container) {
    const { children } = vnode;
    const textNode = document.createTextNode(children);
    console.log('textNode', textNode);
    vnode.el = textNode;
    container.append(textNode);
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

// slots是一个数组，需要用h调用返回虚拟节点
// 增强：可以是一个对象
function renderSlots(slots, name, props) {
    const slot = slots[name];
    if (typeof slot === 'function') {
        // 只需要渲染children节点
        return createVnode(Fragment, {}, slot(props));
    }
}

function provide(key, value) {
    var _a;
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        let { provides } = currentInstance;
        const parentProvides = (_a = currentInstance.parent) === null || _a === void 0 ? void 0 : _a.provides;
        // 利用原型链实现provides
        // init只执行一次
        if (provides === parentProvides) {
            provides = Object.create(parentProvides);
        }
        provides[key] = value;
    }
}
function inject(key, defaultVal) {
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        const parentProvides = currentInstance.parent.provides;
        if (key in parentProvides) {
            return parentProvides[key];
        }
        else if (defaultVal) {
            if (typeof defaultVal === 'function') {
                return defaultVal();
            }
            return defaultVal;
        }
    }
}

exports.createApp = createApp;
exports.createTextVNode = createTextVNode;
exports.getCurrentInstance = getCurrentInstance;
exports.h = h;
exports.inject = inject;
exports.provide = provide;
exports.renderSlots = renderSlots;

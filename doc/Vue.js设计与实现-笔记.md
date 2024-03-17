## 序

Vue.js 设计与实现真的是一本非常不错的书，通读一遍后受益匪浅。

因此想记录一些书里的概览，以方便自己 review 对源码的理解，在面试时可以有更多东西扯。

## 一 框架设计概览

### 范式

命令式关注过程

自然语言描述能够与代码产生一一对应的关系

声明式关注结果

框架帮忙封装了过程

声明式代码的性能 < 命令式

至少也要多出 diff 的消耗

声明式代码的可维护性 > 命令式

### 虚拟 dom

虚拟 dom 解决的问题：声明式代码+性能不至于太差

涉及 dom 的计算远比 js 层面的差

创建的时候都差不多。该做的事情都得做

更新的时候，虚拟 dom 仅多了 diff 的消耗，在渲染 dom 时可以节省对重复的渲染，从而提高效率

纯运行时：render 函数（提供树形结构数据）

加入编译：HTML->树形结构数据 Vue 好处：可以分析用户提供的内容，分析不变与变以提高性能

纯编译时：HTML->render 函数相关实现代码 Svelte

（另外，vue 已经开始对无虚拟 dom 的探索了。参见 Vue Vapor）

https://juejin.cn/post/7327881655405789236?searchId=20240317010533806E2A467B4B38CFD2E0

## 二 框架设计核心要素

友好的警告信息代替 js 原生报错

体积优化：打包生成生产环境版本与开发环境版本 通过**DEV**标识

Tree-Shaking：排除 dead code

条件：ESM，pure

当一个函数产生了副作用，就不能被移除。有的代码含有潜在副作用（读取对象值，如果其为 proxy 会触发 get，get 里有可能有副作用），需要运行时判断的则不会被筛除掉

rollup 的解决方案：给一个注释代码 `/*#__PURE__#*/` （webpack 和压缩工具（terser）也会识别）

引用方式输出不同产物：

script 直接引入：LIFE

ESM with -bunder/-browser 分别给打包工具/浏览器使用，差别之一是筛去了**DEV**

CJS

特性开关：比如关闭 vue2 选项式 api

Tree-Shaking、灵活性（新/废弃）。基于 rollup 的预定义常量插件

为用户提供统一的错误处理接口，把错误传给用户（callWithErrorHandling）

良好的 Ts 支持 框架对 ts 支持，才能在使用的时候得到好的提示等，也就是写很多亏贼的类型推导（源码里的类型体操简直看不懂，比如 watch）

对 Tsx 支持

## 三 Vue3 设计思路

声明式描述 UI：尤其是隐藏了对 dom 的操作，而是把这些交给 vue 来完成

编写前端页面都涉及哪些内容？DOM（元素的层级结构）、属性、事件。对应的 Vue 解决方案：Template、v-bind、v-on

使用 js 对象描述 DOM：也就是 render，vue 有提供 h 函数用于实现这种更具有动态性的方式。例如加入模板字符串引入变量

渲染器 render：创建元素、添加属性和事件、处理 children。**对更新做 diff**

组件化：组件就是一组 DOM 元素的封装。函数 or 对象都可以的。对象要提供 render 函数

## 四 响应系统的作用和实现

这是 vue 里面第一个接触到的重点。这里将只记录概述，详情会另写文档。

### 响应式数据与副作用函数

副作用：该函数的执行会直接或间接影响到其他函数的执行

响应式的体现：在副作用函数中读取了某个对象的属性，我们期望副作用函数重新执行

设计一个简易的响应式系统 ，以及各种各样的补丁

// todo

## 五 非原始值的响应式方案

### Proxy 与 Reflect

recevier 的作用：代表谁在读取属性。

情景：在副作用函数内通过原始对象访问他的某个属性不会建立响应联系

例子：

```js
const obj = {
  foo: 1,
  get bar() {
    console.log('this === proxy', this === proxy)
    return this.foo
  },
}

const proxy = new Proxy(obj, {
  get(target, key, receiver) {
    console.log('receiver === proxy', receiver === proxy)
    return Reflect.get(target, key, receiver)
  },
})

console.log(proxy.bar)
```

输出：

```js
receiver === proxy true
this === proxy true
receiver === proxy true
1
```

不带 receiver：

```js
const obj = {
  foo: 1,
  get bar() {
    console.log('this === proxy', this === proxy)
    return this.foo
  },
}

const proxy = new Proxy(obj, {
  get(target, key) {
    return Reflect.get(target, key)
  },
})

console.log(proxy.bar)

// 输出：
// this === proxy false => 说明访问的是原始对象而非proxy，不会触发响应式！
// 1
```

对 js 对象的分析：为什么“js 中一切皆对象"

常规对象与异质对象

内部方法由某一规范实现的都是常规对象，Proxy 由于[[Get]] 规范不同因此是异质对象

Proxy 不止代理 get 和 set。还有很多都可以被代理

https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy

// todo

## 六 原始值的响应式方案

ref 登场：帮助用户提供包裹对象和统一的.value 命名规范

isRef：给一个标识\_\_v_isRef

toRef: 解决解构响应式丢失问题

proxyRef：模板中帮用户脱 ref，通过其 set 间接为 ref.value 进行操作

## 七 渲染器的设计

将 renderer 与 effect 结合，就可以实现数据改变自动渲染啦

createRenderer：

1. 跨平台：应用情景不止是浏览器的 DOM，也可以是 canvas 或者其他
2. 不止有 render 一个方法，还有用于 ssr 的 hydrate（水合）方法

实现方式：抽离 render 的创建、设置、插入操作，暴露接口给用户来自己设计 render

核心：patch。在更新时，不会简单的全量挂载，而是进行 patch，试图找到并更新变更点，尽可能少的 render。

## 八 挂载与更新

### mount

对于 mount，有一个补充的知识点：HTML Attributes 与 DOM Properties

HTML Attributes 是定义在 HTML 标签上的属性。浏览器解析后会创建一个与之相符的 DOM 对象

而这个 DOM 对象会带有很多的属性，即 DOM Properties。

HTML Attributes 与 DOM Properties 的值之间是有关联的。

⚠️HTML Attributes 与 DOM Properties 名字不总是一模一样。也并不是所有值之间都有关联

因此针对不对应的关系，vue 在 mount 的时候也打了很多补丁。

为了跨平台，还需要把属性设置相关操作封装到 patchProps 中，作为一个选项传入

对 class 的增强（:class）: normailizeClass 方法。考虑性能：el.className 最优。style 自然也有增强

对文本节点和注释节点的兼容：type 字段

### unmount

调用 removeChild，封装操作为 unmount

不能简单的将 innerHTML 置为空的原因：需要调组件钩子、自定义指令。同时只清除 HTML 的话并没有移除绑定在 DOM 上的事件处理函数

区分 vnode 类型：type 字段

处理事件：on+Xxx。e.g. onClick

性能优化：始终绑定伪造的事件处理函数 invoker，其.value 为真实事件。这样可以避免调用 removeEventListener。

同时检查.value 是否为数组以兼容多个事件的情景

针对事件冒泡的补丁：屏蔽所有绑定时间晚于事件触发时间的事件处理函数的执行 e.timeStamp，并给 invoker.attached 属性存储事件处理函数被绑定的时间

### 更新子节点

针对新旧节点的没有、文本、数组的三种类型，一共有 9 种可能

不用覆盖完全，而核心就在新旧节点都为数组的时候，会涉及到 diff 算法

### 优化

针对 Vue2 必须要一个根节点的限制，使用 Fragment 支持多根节点模板（type 字段）

浏览器渲染 Fragment 的时候只会渲染其子节点

## 九-简单 diff 算法

1. 遍历新旧数组中长度较短的一组，对其 patch
2. 引入 key，标识 vnode 的身份证，发现可以交换位置的，复用

⚠️ 复用并不意味着不更新。有变化依然会更新才对

3. 找到需要移动的元素。利用索引值和 key

记 lastIndex 为在旧 children 中寻找具有相同 key 值节点的过程中，遇到的最大索引值。如果再往后找，还存在索引值比 lastIndex 小的节点，则意味着该节点（oldnode 对应的真实节点）需要移动

4. 如何移动元素？利用vnode.el，patchElement。（n2.el=n1.el）**patchChildren**（P231）比较复杂，不在这里记录

添加新元素：位置？记录newVnode前一个虚拟节点，如果存在则使用它对应的真实DOM的下一个兄弟节点作为锚点元素。不存在则说明它为第一个子节点，使用容器元素的container.firstChild

方式？为patch加上第四个参数anchor

移除不存在的元素：更新完后遍历旧的子节点数组，去找新的一组子节点中找相同key的节点。找不到就说明应该删除，调unmount将其删除

## 十-双端Diff算法（Vue2）

问题：对DOM的移动不是最优的（旧：123，新：312，简单diff会移动两次，但很明显只用移动一次就够了）

实现：核心：双端。

维护四个索引值：newStartIdx newEndInd oldStartIdx oldEndIdx

比较过程：（P245）

非理想状况：拿新的子节点数组中的头部节点，去旧的一组子节点中遍历寻找。找到了则说明该节点在这次迭代中应当为头部节点

同时会出现undefined（说明已经处理过了），需要特别处理（跳过）

添加新元素：结合非理想状况中，去旧的一组子节点中遍历寻找，根本没找到->是新节点。挂载位置？当前头部节点之前

同样还有缺陷。需要扫尾：oldEndIdx < oldStartIdx && newStartIdx <= newEndIdx时，将索引值位于newStartIdx 与 newEndIdx 区间内的节点加到头部节点（oldStartVnode.el）

移除不存在元素：扫尾x2：newEndIdx < newStartIdx && oldStartIdx <= oldEndIdx时，将索引值位于oldStartIdx 与 oldEndIdx 区间内的节点移除

## 十一-快速Diff算法

### 预处理

借鉴了纯文本diff的预处理步骤（先进行一波「头尾」比较）

最长递增子数列

## 十二-组件的实现原理

标识组件：type字段

真正完成渲染的是mountComponent函数

状态：data函数

自更新：把渲染任务包在effect中

避免频繁自更新：实现一个调度器，不立即执行副作用，而是缓冲在微任务队列中，待到执行栈清空再统一执行。这样就可以对任务去重从而提升性能

经典的queuejob函数和isFlushing标志再现。

需要实现组件实例。state：状态数据。isMounted：是否被挂载。subTree：组件的子树

isMounted用来区分组件的挂载和更新，在这里就可以设计一系列钩子函数啦

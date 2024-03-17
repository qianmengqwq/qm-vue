const obj = {
  foo: 1,
  get bar() {
    console.log('this === proxy', this === proxy)
    return this.foo
  },
}

const proxy = new Proxy(obj, {
  get(target, key, receiver) {
    console.log(target === receiver)
    return Reflect.get(target, key, receiver)
  },
})

console.log(proxy.bar)

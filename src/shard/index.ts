const extend = Object.assign

const isObject = (val: any) => val !== null && typeof val === 'object'

const hasChanged = (val: any, newVal: any) => {
  return !Object.is(val, newVal)
}

const hasOwn = (val: any, key: any) =>
  Object.prototype.hasOwnProperty.call(val, key)

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
const camelCase = (s: string) =>
  s.replace(/-(\w)/g, (_, c: string) => (c ? c.toUpperCase() : ''))

export { extend, isObject, hasChanged, hasOwn, capitalize, camelCase }

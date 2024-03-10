const extend = Object.assign

const isObject = (val: any) => val !== null && typeof val === 'object'

const hasChanged = (val: any, newVal: any) => {
  return !Object.is(val, newVal)
}
export { extend, isObject, hasChanged }

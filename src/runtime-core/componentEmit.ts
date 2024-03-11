import { capitalize, camelCase } from '../shard/index'

export function emit(
  instance: ComponentInstance,
  event: string,
  ...args: any[]
) {
  const { props } = instance

  const handler = props['on' + capitalize(camelCase(event))]
  handler && handler(...args)
}

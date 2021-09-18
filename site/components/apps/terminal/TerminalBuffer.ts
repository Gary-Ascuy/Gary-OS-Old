import { EventEmitter } from 'events'

export class TerminalBuffer extends TransformStream {
  constructor() {
    super()
  }

  get readable() {
    return new ReadableStream({})
  }

  get writable() {
    return new WritableStream({})
  }
}

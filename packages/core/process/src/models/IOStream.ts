import { ReadableStream, WritableStream } from 'web-streams-polyfill'

export interface IOStream {
  stdin: ReadableStream
  stdout: WritableStream
  stderr: WritableStream
}

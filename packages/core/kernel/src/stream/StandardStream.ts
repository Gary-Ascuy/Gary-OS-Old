import { ReadableStream, WritableStream } from 'web-streams-polyfill'

export type StringReadableStream = ReadableStream<string>
export type StringWritableStream = WritableStream<string>

export type StreamFactory<T> = () => T
export type ReadableStreamFactory = StreamFactory<ReadableStream>
export type WritableStreamFactory = StreamFactory<WritableStream>

export interface StandardStream {
  stdin: StringReadableStream
  stdout: StringWritableStream
  stderr: StringWritableStream
}

export interface StandardStreamFactory extends StandardStream {
  new_stdin: ReadableStreamFactory
  new_stdout: WritableStreamFactory
  new_stderr: WritableStreamFactory
}

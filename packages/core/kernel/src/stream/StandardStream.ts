import { ReadableStream, WritableStream, TransformStream } from 'web-streams-polyfill'

export type StringReadableStream = ReadableStream<string>
export type StringWritableStream = WritableStream<string>
export type StringTransformStream = TransformStream<string>

export type StreamCreator<T> = () => T
export type ReadableStreamCreator = StreamCreator<ReadableStream>
export type WritableStreamCreator = StreamCreator<WritableStream>

export interface StandardStream {
  stdin: StringReadableStream
  stdout: StringWritableStream
  stderr: StringWritableStream
}

export interface StandardStreamCreator extends StandardStream {
  new_stdin: ReadableStreamCreator
  new_stdout: WritableStreamCreator
  new_stderr: WritableStreamCreator
}

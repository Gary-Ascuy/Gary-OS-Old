import { ReadableStream, WritableStream, TransformStream } from 'web-streams-polyfill'

export type StringReadableStream = ReadableStream<string>
export type StringWritableStream = WritableStream<string>
export type StringTransformStream = TransformStream<string, string>

export interface StandardStream {
  stdin: StringReadableStream
  stdout: StringWritableStream
  stderr: StringWritableStream
}

export interface StandardStreamCreator extends StandardStream {
  new_stdin(): Promise<StringReadableStream>
  new_stdout(): Promise<StringWritableStream>
  new_stderr(): Promise<StringWritableStream>
}

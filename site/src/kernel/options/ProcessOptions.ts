import { EnvironmentVariables } from '../models/EnvironmentVariables'

export interface ProcessOptions {
  command: string
  arguments: string[]

  env: EnvironmentVariables

  stdin: ReadableStream
  stdout: WritableStream
  stderr: WritableStream
}

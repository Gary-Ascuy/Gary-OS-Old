import { ReadableStream, WritableStream } from 'web-streams-polyfill'

import { Application } from './Application'
import { EnvironmentVariables } from './EnvironmentVariables'

export interface ProcessOptions {
  /**
   * Environment Variables
   *
   * @example { HOME: '/root/gary', PWD: '/root/gary/test', USER: 'gary' }
   */
  env: EnvironmentVariables

  /**
   * Execution Path
   *
   * @example '/root/gary/test'
   */
  execPath: string

  /**
   * Argument Values
   *
   * @example ['/usr/local/bin/node', '--version']
   * @example ['ls', '--version']
   * @example ['echo', 'Gary', 'Ascuy', 'Anturiano']
   */
  argv: string[]
}

export enum Operator { OR = '||', AND = '&&', NOT = '!' }

export type Task = ProcessOptions
export type Pipeline = Array<Task>
export type LogicalPipeline = Array<Pipeline | Operator>
export type ParallelPipeline = Array<LogicalPipeline>

export interface Process extends ProcessOptions {
  /**
   * Process Identifier (UUID v4)
   *
   * @example 'd501d580-87f4-4e26-a99b-ad0d1d24c999'
   */
  pid: string

  /**
   * Streams stdin | stdout | stderr
   */
  stdin: ReadableStream
  stdout: WritableStream
  stderr: WritableStream

  /**
   * Base Application for process
   */
  application: Application
}

import { Application } from '../application/Application'
import { Task } from './Task'

export interface Process extends Task {
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

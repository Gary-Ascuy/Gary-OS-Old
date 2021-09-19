import { Application } from './Application'
import { EnvironmentVariables } from './EnvironmentVariables'

export interface Process {
  /**
   * Process Identifier (UUID v4)
   *
   * @example 'd501d580-87f4-4e26-a99b-ad0d1d24c999'
   */
  pid: string

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

  /**
   * Event Emitter
   */
  on(name: string, callback: Function): Promise<void>
  emit(name: string, ...args: string[]): void

  /**
   * Process Events
   */
  kill(pid: string, signal: string): Promise<void>
  exit(code: number): Promise<void>

  /**
   * Base Application for process
   */
  application: Application
}

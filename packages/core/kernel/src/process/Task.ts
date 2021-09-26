import { EnvironmentVariables } from './EnvironmentVariables'

export enum LogicalOperator { OR = '||', AND = '&&', NOT = '!' }

export type Pipeline = Array<Task>
export type LogicalPipeline = Array<Pipeline | LogicalOperator>
export type ParallelPipeline = Array<LogicalPipeline>

export interface Task {
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

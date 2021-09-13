import { ProcessOptions } from '../options/ProcessOptions'
import { Application } from './Application'
import { EnvironmentVariables } from './EnvironmentVariables'

export enum ProcessResponse {
  SUCCESS = 0,
  ERROR = 1,
}

export interface Process {
  pid: string
  env: EnvironmentVariables

  application: Application

  options: ProcessOptions
}

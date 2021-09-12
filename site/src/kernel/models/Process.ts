import { ProcessOptions } from '../options/ProcessOptions'
import { EnvironmentVariables } from './EnvironmentVariables'

export interface Process {
  pid: string
  env: EnvironmentVariables

  options: ProcessOptions
}

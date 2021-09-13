import { Alias } from '../models/Alias'
import { EnvironmentVariables } from '../models/EnvironmentVariables'

export interface KernelOptions {
  env: EnvironmentVariables
  alias: Alias
}

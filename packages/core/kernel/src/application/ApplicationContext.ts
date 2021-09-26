import { Process } from '../process/Process'

export interface ApplicationContext {
  pid: string
  process: Process
}

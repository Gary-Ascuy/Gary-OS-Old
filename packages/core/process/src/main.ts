import { Application } from './models/Application'
import { Process } from './models/ApplicationExecution'

export interface ProcessManager {
  open(command: string): Promise<Process>
  open(argv: string[], application?: Application): Promise<Process>
}

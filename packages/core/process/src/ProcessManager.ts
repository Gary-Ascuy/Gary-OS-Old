import { Application, Process } from './models'

export interface ProcessManager {
  open(command: string): Promise<Process>
  open(argv: string[], application?: Application): Promise<Process>
}

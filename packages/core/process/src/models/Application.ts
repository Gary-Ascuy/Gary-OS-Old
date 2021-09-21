import { ApplicationExecution } from './ApplicationExecution'
import { ApplicationMetadata } from './ApplicationMetadata'

export interface Application extends ApplicationMetadata, ApplicationExecution {
  // set(options: Partial<ApplicationMetadata>): Promise<void>
}

import { Application } from '@garyos/kernel'

export interface ApplicationLoader {
  get(identifier: string): Promise<Application>
}

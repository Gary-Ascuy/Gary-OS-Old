import { Application } from '@garyos/kernel'

import { ApplicationLoader } from './ApplicationLoader'

export class RemoteApplicationLoader implements ApplicationLoader {
  constructor(
  ) { }

  async get(identifier: string): Promise<Application> {
    throw new Error('Not Implemented Yet')
  }
}

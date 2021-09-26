import { Application } from '@garyos/kernel'

import { ApplicationLoader } from './ApplicationLoader'
import { FileApplicationLoader } from './FileApplicationLoader'
import { RemoteApplicationLoader } from './RemoteApplicationLoader'

export class ApplicationLoaderManager implements ApplicationLoader {
  constructor(
    private map: { [key: string]: ApplicationLoader } = {},
  ) {
    this.map['apptype.garyos.bin'] = new FileApplicationLoader()
    this.map['apptype.garyos.remote'] = new RemoteApplicationLoader()
    this.map['apptype.garyos.local'] = new FileApplicationLoader()
  }

  async get(identifier: string): Promise<Application> {
    const type = this.getType(identifier)

    const loader = this.map[type]
    if (!loader) throw new Error('Error: Unable to find a loader for this type of application')
    return loader.get(identifier)
  }

  getType(identifier: string) {
    const pathPattern = /^(\.)+\/|^\//g
    const urlPattern = /^(http|https):\/\//g

    if (pathPattern.test(identifier)) return 'apptype.garyos.local'
    if (urlPattern.test(identifier)) return 'apptype.garyos.remote'

    return 'apptype.garyos.bin'
  }
}

import { Application } from '@garyos/kernel'

export class ApplicationLoader {
  constructor(
    public apps: { [key: string]: Application } = {}
  ) { }

  get(identifier: string): Application {
    if (!this.apps[identifier]) throw new Error('Error: Unable to load Application')

    return this.apps[identifier]
  }
}

import { Application, AppicationMainResponse, ApplicationContext, ApplicationType, ApplicationAuthor } from '@garyos/kernel'

import { ApplicationLoader } from './ApplicationLoader'

export class MockApplicationLoader implements ApplicationLoader {
  constructor(
    public apps: { [key: string]: Application } = {}
  ) {
    this.init()
  }

  init() {
    this.install(this.success())
    this.install(this.failure())
    this.install(this.error())

    this.install(this.echo())
    this.install(this.env())

    this.install(this.uppercase())
    this.install(this.lowercase())
    this.install(this.removeLast())

    this.install(this.grep())
    this.install(this.sleep())
  }

  async get(identifier: string): Promise<Application> {
    if (!this.apps[identifier]) throw new Error('Error: Unable to load Application')

    return this.apps[identifier]
  }

  install(application: Application) {
    this.apps[application.identifier] = application

    // alias
    const alias = application.name.toLowerCase()
    this.apps[alias] = application
  }

  success(): Application {
    const main = async () => AppicationMainResponse.SUCCESS
    return { ...this.metadata('com.garyos.success'), main }
  }

  failure(): Application {
    const main = async () => AppicationMainResponse.FAILURE
    return { ...this.metadata('com.garyos.failure'), main }
  }

  error(): Application {
    const main = async () => AppicationMainResponse.ERROR
    return { ...this.metadata('com.garyos.error'), main }
  }

  echo(): Application {
    const main = async ({ process: { argv, stdout } }: ApplicationContext) => {
      const [, ...args] = argv

      const writer = stdout.getWriter()
      await writer.write(args.join(' '))
      await writer.close()

      return AppicationMainResponse.SUCCESS
    }
    return { ...this.metadata('com.garyos.echo'), main }
  }

  env(): Application {
    const main = async ({ process: { env, stdout } }: ApplicationContext) => {
      const writer = stdout.getWriter()
      for (const key of Object.keys(env)) {
        await writer.write(`${key}=${env[key]}\n`)
      }
      await writer.close()

      return AppicationMainResponse.SUCCESS
    }
    return { ...this.metadata('com.garyos.env'), main }
  }

  uppercase(): Application {
    const main = async ({ process: { env, stdin, stdout } }: ApplicationContext) => {
      const writer = stdout.getWriter()
      const reader = stdin.getReader()

      let done
      do {
        const chunk = await reader.read()
        if (chunk.value) await writer.write(`${chunk.value ?? ''}`.toUpperCase())
        done = chunk.done
      } while (!done)
      await writer.close()

      return AppicationMainResponse.SUCCESS
    }
    return { ...this.metadata('com.garyos.uppercase'), main }
  }

  lowercase(): Application {
    const main = async ({ process: { env, stdin, stdout } }: ApplicationContext) => {
      const writer = stdout.getWriter()
      const reader = stdin.getReader()

      let done
      do {
        const chunk = await reader.read()
        if (chunk.value) await writer.write(`${chunk.value ?? ''}`.toLowerCase())
        done = chunk.done
      } while (!done)
      await writer.close()

      return AppicationMainResponse.SUCCESS
    }
    return { ...this.metadata('com.garyos.lowercase'), main }
  }

  removeLast(): Application {
    const main = async ({ process: { env, stdin, stdout } }: ApplicationContext) => {
      const writer = stdout.getWriter()
      const reader = stdin.getReader()

      let done
      do {
        const chunk = await reader.read()
        if (chunk.value) {
          const value = `${chunk.value ?? ''}`
          const words = value.split(/\W/)
          if (words.length > 0) words.pop()
          await writer.write(words.join(' '))
        }

        done = chunk.done
      } while (!done)
      await writer.close()

      return AppicationMainResponse.SUCCESS
    }
    return { ...this.metadata('com.garyos.removelast'), main }
  }

  /**
   * @example cat something.txt | grep gary
   * @example cat something.txt | grep --pattern gary
   * @example cat something.txt | grep --pattern "[a-zA-Z]+" --flags ig
   */
  grep(): Application {
    const main = async ({ process: { argv, stdin, stdout } }: ApplicationContext) => {
      const [_, criteria] = argv
      const args = this.parse(argv, { '-p': '--pattern', '-f': '--flags' })
      const pattern = args['--pattern'] ?? criteria
      const flags = args['--flags'] ?? ''
      if (!pattern) return AppicationMainResponse.FAILURE

      // --file gary.txt if (!file) use stdin
      const regexp = new RegExp(pattern, flags)
      const writer = stdout.getWriter()
      const reader = stdin.getReader()

      let done
      do {
        const chunk = await reader.read()
        if (chunk.value) {
          const value = `${chunk.value ?? ''}`
          if (regexp.test(value)) await writer.write(value)
        }
        done = chunk.done
      } while (!done)
      await writer.close()

      return AppicationMainResponse.SUCCESS
    }
    return { ...this.metadata('com.garyos.grep'), main }
  }

  sleep(): Application {
    const main = async ({ process: { argv } }: ApplicationContext) => {
      const [_, time] = argv
      await new Promise((resolve) => setTimeout(resolve, +time))
      return AppicationMainResponse.SUCCESS
    }
    return { ...this.metadata('com.garyos.sleep'), main }
  }

  parse(args: string[], alias: { [key: string]: string }): { [key: string]: string } {
    const result: { [key: string]: string } = {}
    let index = 0

    for (const arg of args) {
      if (/^-?-\w+$/.test(arg)) {
        result[alias[arg] ?? arg] = args[index + 1] ?? true
      }
      ++index
    }

    return result
  }

  metadata(identifier: string): Application {
    const [, , base] = identifier.split('.')
    const name = `${base[0].toUpperCase()}${base.slice(1)}`
    const type = ApplicationType.Terminal
    const version = '1.0.0'
    const authors = this.authors()
    const main = async () => 0

    return { identifier, name, description: name, version, authors, type, main }
  }

  authors(): ApplicationAuthor[] {
    return [{ name: 'gary Ascuy', email: 'gary.ascuy@gmail.com' }]
  }
}

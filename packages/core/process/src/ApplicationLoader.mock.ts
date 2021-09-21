import { TransformStream, ReadableStream, WritableStream, ReadableStreamDefaultReadResult } from 'web-streams-polyfill'

import { ApplicationLoader } from './ApplicationLoader'
import { AppicationMainResponse, Application, ApplicationAuthor, ApplicationContext, ApplicationType } from './models'
import { IOStream } from './models/IOStream'

export class MockApplicationLoader extends ApplicationLoader {
  constructor() {
    super()

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

export class MockStream implements IOStream {
  public _stdin: TransformStream = new TransformStream()
  public _stdout: TransformStream = new TransformStream()
  public _stderr: TransformStream = new TransformStream()

  public stdin: ReadableStream
  public stdout: WritableStream
  public stderr: WritableStream

  constructor(
    private inputChunks: string[],
  ) {
    this.stdin = this._stdin.readable
    this.stdout = this._stdout.writable
    this.stderr = this._stderr.writable
  }

  async init() {
    await this.writeInput(this.inputChunks)
  }

  async writeInput(chunks: string[]) {
    const writer = this._stdin.writable.getWriter()
    for (const chunk of chunks) {
      await writer.write(chunk)
    }
    await writer.close()
  }

  async getStdOut() {
    const chunks = await this.getReadableChunks(this._stdout.readable)
    return chunks.join('')
  }

  async getStdErr() {
    const chunks = await this.getReadableChunks(this._stderr.readable)
    return chunks.join('')
  }

  async getReadableChunks(readable: ReadableStream): Promise<string[]> {
    const reader = readable.getReader()

    let chunks: string[] = []
    let done
    do {
      const chunk = await reader.read()
      chunks.push(chunk.value)
      done = chunk.done
    } while (!done)

    return chunks
  }
}

import { v4 as uuid } from 'uuid'
import { TransformStream, ReadableStream, WritableStream } from 'web-streams-polyfill'

import { ApplicationLoader } from './ApplicationLoader'
import { buildSequence, parse, replaceEnvVariables, SequenceElement } from './CommandParser'
import { AppicationMainResponse, EnvironmentVariables, LogicalPipeline, Operator, Pipeline, Process, ProcessOptions, Task } from './models'
import { IOStream } from './models/IOStream'

export class ProcessManager {
  constructor(
    public loader: ApplicationLoader,
    public map: { [key: string]: Process } = {},
  ) { }

  async execute(task: Task, streams: IOStream, system: EnvironmentVariables): Promise<number> {
    try {
      const [identifier, ...args] = task.argv
      const application = this.loader.get(identifier)

      // env variables
      const env = { ...system, ...task.env }
      for (const key of Object.keys(task.env)) {
        env[key] = replaceEnvVariables(env[key], env)
      }

      // arguments
      const params = args.map((value) => replaceEnvVariables(value, env))
      const argv = [identifier, ...params]

      // process
      const pid = uuid()
      const process: Process = { ...task, ...streams, pid, application, env, argv }
      system.DEBUG && console.log(process)

      return application.main({ pid, process })
    } catch (error) {
      system.DEBUG && console.error(error)
      return AppicationMainResponse.ERROR
    }
  }

  buildPipelineStreams(pipeline: Pipeline, io: IOStream) {
    let pipe: TransformStream = new TransformStream()
    let stdin: ReadableStream = io.stdin
    const stderr: WritableStream = io.stderr

    const length = pipeline.length
    const streams = pipeline.map((_, index: number) => {
      const stdout = index === (length - 1) ? io.stdout : pipe.writable
      const stream: IOStream = { stderr, stdin, stdout }

      stdin = pipe.readable
      pipe = new TransformStream()
      return stream
    })

    return streams
  }

  async pipeline(pipeline: Pipeline, io: IOStream, system: EnvironmentVariables): Promise<number> {
    if (pipeline && pipeline.length === 0) throw new Error('Invalid Pipeline')

    const streams = this.buildPipelineStreams(pipeline, io)
    const processes = pipeline
      .map((task, index: number) => ({ task, io: streams[index] }))
      .map(({ task, io }) => this.execute(task, io, system))

    const codes = await Promise.all(processes)
    return codes.pop() ?? AppicationMainResponse.ERROR
  }

  /**
   * Lazy Expression Evaluation
   *
   * @example Operator.AND
   *  - false && X = false => Stop execution
   *  - true  && X = X
   *
   * @example Operator.OR
   *  - false || X = X
   *  - true  || X = true => Stop execution
   */
  async logical(pipelines: LogicalPipeline, io: IOStream, system: EnvironmentVariables) {
    if (pipelines && pipelines.length === 0) throw new Error('Invalid LogicalPipeline')

    let code = 0
    for (const pipeline of pipelines) {
      if (Array.isArray(pipeline)) {
        code = await this.pipeline(pipeline, io, system)
        continue
      }

      const success = code === AppicationMainResponse.SUCCESS
      if (!success && pipeline === Operator.AND) return code
      if (success && pipeline === Operator.OR) return code
    }

    return code
  }

  // MISING IMPLE
  get(pid: string): Process {
    if (this.map[pid]) throw new Error('Process Does Not Exist')
    return this.map[pid]
  }

  async emit(pid: string, event: string,) {
    const process: Process = this.get(pid)
    throw new Error('Not Implement Yet')
  }

  async on(pid: string, event: string, callback: Function) {
    const process: Process = this.get(pid)
    throw new Error('Not Implement Yet')
  }

  async kill(pid: string) {
    const process: Process = this.get(pid)
    this.emit(pid, 'KILLSIGNAL')
    // wait(TIMEOUT)
    delete this.map[process.pid]
    throw new Error('Not Implement Yet')
  }

  // TODO: update SequenceElement class
  async run(sequence: SequenceElement[]): Promise<number> {
    if (sequence && sequence.length === 0) throw new Error('Invalid Sequence')

    let code = 0
    for (const element of sequence) {
      if (Array.isArray(element)) {
        // code = await this.pipeline(element as ProcessOptions[])
        continue
      }

      const operator = element as ProcessOptions
      const [cmd] = operator.argv

      const success = code === 0
      if (!success && cmd === '&&') return code // false && <EXPRESSION> => false (stop evaluation)
      if (success && cmd === '||') return code  //  true || <EXPRESSION> => true  (stop evaluation)
    }

    return code
  }

  async open(command: string, env: EnvironmentVariables): Promise<number> {
    const options: ProcessOptions[] = parse(command, env.PWD)
    const sequence = buildSequence(options)
    return this.run(sequence)
  }
}


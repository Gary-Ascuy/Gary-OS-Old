import { v4 as uuid } from 'uuid'
import { TransformStream, ReadableStream, WritableStream } from 'web-streams-polyfill'

import { ApplicationLoader } from './ApplicationLoader'
import { parse, replaceEnvVariables } from './CommandParser'
import { AppicationMainResponse, EnvironmentVariables, LogicalPipeline, Operator, ParallelPipeline, Pipeline, Process, Task } from './models'
import { IOStream } from './models/IOStream'
// import { ParallelWritableStream } from './ParallelWritableStream'

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

  async flushWritable(writable: WritableStream): Promise<void> {
    try {
      const writer = writable.getWriter()
      await writer.close()
    } catch (error) { }
  }

  async flushReadable(readable: ReadableStream): Promise<void> {
    try {
      const reader = readable.getReader()
      let done
      do {
        const chunk = await reader.read()
        done = chunk.done
      } while (!done)
    } catch (error) { }
  }

  async executeAndFlush(task: Task, streams: IOStream, system: EnvironmentVariables): Promise<number> {
    const code = await this.execute(task, streams, system)

    await this.flushReadable(streams.stdin)
    await this.flushWritable(streams.stdout)
    await this.flushWritable(streams.stderr)
    return code
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
      .map(({ task, io }) => this.executeAndFlush(task, io, system))

    const codes = await Promise.all(processes)
    return codes.pop() ?? AppicationMainResponse.ERROR
  }


  // async run(command: string, io: IOStream, env: EnvironmentVariables): Promise<number> {
  //   const options: ProcessOptions[] = parse(command, env.PWD)
  //   const sequence = buildSequence(options)
  //   // return this.run(sequence)
  // }

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
    if (pipelines && pipelines.length === 0) throw new Error('Invalid Logical Pipeline')

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

  async parallel(pipeline: ParallelPipeline, io: IOStream, system: EnvironmentVariables): Promise<number> {
    if (pipeline && pipeline.length === 0) throw new Error('Invalid Parallel Pipeline')
    const background = [...pipeline]
    const main = background.pop()

    // const parallel = new ParallelWritableStream(io.stdout)
    // if (background.length > 0) {
    //   const buildLogicalBackground = (logical: LogicalPipeline) => {
    //     const stdout = parallel.getInstance()
    //     return this.logical(logical, { ...io, stdout }, system)
    //   }

    //   Promise.all(background.map(buildLogicalBackground))
    // }

    // const stdout = parallel.getInstance()
    return main ? this.logical(main, { ...io }, system) : AppicationMainResponse.ERROR
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

  // buildExecutionPlan(): BackgroundTask {
  //   BackgroundTask
  //   return []
  // }
}


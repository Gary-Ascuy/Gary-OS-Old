import { v4 as uuid } from 'uuid'
import { TransformStream } from 'web-streams-polyfill'
import {
  StringWritableStream, StringReadableStream, StringTransformStream, StandardStreamFactory,
  EnvironmentVariables, StandardStream, AppicationMainResponse,
  LogicalPipeline, LogicalOperator, ParallelPipeline, Pipeline, Process, Task,
} from '@garyos/kernel'

import { ApplicationLoader } from '../loader/ApplicationLoader'
import { parse, replaceEnvVariables } from '../parser/CommandParser'

export class ProcessManager {
  constructor(
    public loader: ApplicationLoader,
    public map: { [key: string]: Process } = {},
  ) { }

  async execute(task: Task, io: StandardStream, system: EnvironmentVariables): Promise<number> {
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
      const process: Process = { ...task, ...io, pid, application, env, argv }
      system.DEBUG && console.log(process)

      return application.main({ pid, process })
    } catch (error) {
      system.DEBUG && console.error(error)
      return AppicationMainResponse.ERROR
    }
  }

  async flushWritable(writable: StringWritableStream): Promise<void> {
    try {
      const writer = writable.getWriter()
      await writer.close()
    } catch (error) { }
  }

  async flushReadable(readable: StringReadableStream): Promise<void> {
    try {
      const reader = readable.getReader()
      let done
      do {
        const chunk = await reader.read()
        done = chunk.done
      } while (!done)
    } catch (error) { }
  }

  async executeAndFlush(task: Task, io: StandardStream, system: EnvironmentVariables): Promise<number> {
    const code = await this.execute(task, io, system)

    await this.flushReadable(io.stdin)
    await this.flushWritable(io.stdout)
    await this.flushWritable(io.stderr)
    return code
  }

  buildPipelineStreams(pipeline: Pipeline, io: StandardStream): StandardStream[] {
    let pipe: StringTransformStream = new TransformStream<string>()
    let stdin: StringReadableStream = io.stdin
    const stderr: StringWritableStream = io.stderr

    const length = pipeline.length
    const streams = pipeline.map((_, index: number) => {
      const stdout = index === (length - 1) ? io.stdout : pipe.writable
      const stream: StandardStream = { stderr, stdin, stdout }

      stdin = pipe.readable
      pipe = new TransformStream<string>()
      return stream
    })

    return streams
  }

  async pipeline(pipeline: Pipeline, io: StandardStream, system: EnvironmentVariables): Promise<number> {
    if (pipeline && pipeline.length === 0) throw new Error('Invalid Pipeline')

    const streams = this.buildPipelineStreams(pipeline, io)
    const processes = pipeline
      .map((task, index: number) => ({ task, io: streams[index] }))
      .map(({ task, io }) => this.executeAndFlush(task, io, system))

    const codes = await Promise.all(processes)
    return codes.pop() ?? AppicationMainResponse.ERROR
  }


  // async run(command: string, io: StandardStream, env: EnvironmentVariables): Promise<number> {
  //   const options: ProcessOptions[] = parse(command, env.PWD)
  //   const sequence = buildSequence(options)
  //   // return this.run(sequence)
  // }

  /**
   * Lazy Expression Evaluation
   *
   * @example LogicalOperator.AND
   *  - false && X = false => Stop execution
   *  - true  && X = X
   *
   * @example LogicalOperator.OR
   *  - false || X = X
   *  - true  || X = true => Stop execution
   */
  async logical(pipelines: LogicalPipeline, io: StandardStream, system: EnvironmentVariables) {
    if (pipelines && pipelines.length === 0) throw new Error('Invalid Logical Pipeline')

    let code = 0
    for (const pipeline of pipelines) {
      if (Array.isArray(pipeline)) {
        code = await this.pipeline(pipeline, io, system)
        continue
      }

      const success = code === AppicationMainResponse.SUCCESS
      if (!success && pipeline === LogicalOperator.AND) return code
      if (success && pipeline === LogicalOperator.OR) return code
    }

    return code
  }

  async parallel(pipeline: ParallelPipeline, io: StandardStreamFactory, system: EnvironmentVariables): Promise<number> {
    if (pipeline && pipeline.length === 0) throw new Error('Invalid Parallel Pipeline')
    const background = [...pipeline]
    const main = background.pop()
    io.new_stdout()

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


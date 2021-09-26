// Backup
export const a = 1

  // buildPipelineStreams(pipeline: Pipeline, io: StandardStream): StandardStream[] {
  //   let pipe: StringTransformStream = new TransformStream<string>()
  //   let stdin: StringReadableStream = io.stdin
  //   const stderr: StringWritableStream = io.stderr

  //   const length = pipeline.length
  //   const streams = pipeline.map((_, index: number) => {
  //     const stdout = index === (length - 1) ? io.stdout : pipe.writable
  //     const stream: StandardStream = { stderr, stdin, stdout }

  //     stdin = pipe.readable
  //     pipe = new TransformStream<string>()
  //     return stream
  //   })

  //   return streams
  // }

  // async pipeline(pipeline: Pipeline, io: StandardStream, system: EnvironmentVariables): Promise<number> {
  //   if (pipeline && pipeline.length === 0) throw new Error('Invalid Pipeline')

  //   const streams = this.buildPipelineStreams(pipeline, io)
  //   const processes = pipeline
  //     .map((task, index: number) => ({ task, io: streams[index] }))
  //     .map(({ task, io }) => this.executeAndFlush(task, io, system))

  //   const codes = await Promise.all(processes)
  //   return codes.pop() ?? AppicationMainResponse.ERROR
  // }


  // // async run(command: string, io: StandardStream, env: EnvironmentVariables): Promise<number> {
  // //   const options: ProcessOptions[] = parse(command, env.PWD)
  // //   const sequence = buildSequence(options)
  // //   // return this.run(sequence)
  // // }

  // /**
  //  * Lazy Expression Evaluation
  //  *
  //  * @example LogicalOperator.AND
  //  *  - false && X = false => Stop execution
  //  *  - true  && X = X
  //  *
  //  * @example LogicalOperator.OR
  //  *  - false || X = X
  //  *  - true  || X = true => Stop execution
  //  */
  // async logical(pipelines: LogicalPipeline, io: StandardStream, system: EnvironmentVariables) {
  //   if (pipelines && pipelines.length === 0) throw new Error('Invalid Logical Pipeline')

  //   let code = 0
  //   for (const pipeline of pipelines) {
  //     if (Array.isArray(pipeline)) {
  //       code = await this.pipeline(pipeline, io, system)
  //       continue
  //     }

  //     const success = code === AppicationMainResponse.SUCCESS
  //     if (!success && pipeline === LogicalOperator.AND) return code
  //     if (success && pipeline === LogicalOperator.OR) return code
  //   }

  //   return code
  // }

  // async parallel(pipeline: ParallelPipeline, io: StandardStreamCreator, system: EnvironmentVariables): Promise<number> {
  //   if (pipeline && pipeline.length === 0) throw new Error('Invalid Parallel Pipeline')
  //   const background = [...pipeline]
  //   const main = background.pop()
  //   io.new_stdout()

  //   // const parallel = new ParallelWritableStream(io.stdout)
  //   // if (background.length > 0) {
  //   //   const buildLogicalBackground = (logical: LogicalPipeline) => {
  //   //     const stdout = parallel.getInstance()
  //   //     return this.logical(logical, { ...io, stdout }, system)
  //   //   }

  //   //   Promise.all(background.map(buildLogicalBackground))
  //   // }

  //   // const stdout = parallel.getInstance()
  //   return main ? this.logical(main, { ...io }, system) : AppicationMainResponse.ERROR
  // }


  // // MISING IMPLE
  // get(pid: string): Process {
  //   if (this.map[pid]) throw new Error('Process Does Not Exist')
  //   return this.map[pid]
  // }

  // async emit(pid: string, event: string,) {
  //   const process: Process = this.get(pid)
  //   throw new Error('Not Implement Yet')
  // }

  // async on(pid: string, event: string, callback: Function) {
  //   const process: Process = this.get(pid)
  //   throw new Error('Not Implement Yet')
  // }

  // async kill(pid: string) {
  //   const process: Process = this.get(pid)
  //   this.emit(pid, 'KILLSIGNAL')
  //   // wait(TIMEOUT)
  //   delete this.map[process.pid]
  //   throw new Error('Not Implement Yet')
  // }

  // // buildExecutionPlan(): BackgroundTask {
  // //   BackgroundTask
  // //   return []
  // // }


/*

describe('.logical()', () => {
  let io: MockStream
  let TRUE: Pipeline = [{ argv: ['success'], env: {}, execPath: '' }]
  let FALSE: Pipeline = [{ argv: ['failure'], env: {}, execPath: '' }]

  beforeEach(() => {
    pm = new ProcessManager(new MockApplicationLoader(), {})
    env = { USER: 'gary', HOME: '/root/gary/' }
    io = new MockStream([''])
    io.init()
  })

  test.each([
    ['TRUE  AND TRUE  = TRUE', TRUE, TRUE, AppicationMainResponse.SUCCESS],
    ['TRUE  AND FALSE = FALSE', TRUE, FALSE, AppicationMainResponse.FAILURE],
    ['FALSE AND TRUE  = FALSE', FALSE, TRUE, AppicationMainResponse.FAILURE],
    ['FALSE AND FALSE = FALSE', FALSE, FALSE, AppicationMainResponse.FAILURE],
  ])('should evaluate "%s" expression', (name: string, a: Pipeline, b: Pipeline, result: AppicationMainResponse) => {
    const logical: LogicalPipeline = [a, LogicalOperator.AND, b]

    const execution = pm.logical(logical, io, env)
    return expect(execution).resolves.toBe(result)
  })

  // TRUE OR OR OR TRUE, HOW TEST LAZY EVALUATION
  test.each([
    ['TRUE  OR TRUE  = TRUE', TRUE, TRUE, AppicationMainResponse.SUCCESS],
    ['TRUE  OR FALSE = TRUE', TRUE, FALSE, AppicationMainResponse.SUCCESS],
    ['FALSE OR TRUE  = TRUE', FALSE, TRUE, AppicationMainResponse.SUCCESS],
    ['FALSE OR FALSE = FALSE', FALSE, FALSE, AppicationMainResponse.FAILURE],
  ])('should evaluate "%s" expression', (name: string, a: Pipeline, b: Pipeline, result: AppicationMainResponse) => {
    const logical: LogicalPipeline = [a, LogicalOperator.OR, b]

    const execution = pm.logical(logical, io, env)
    return expect(execution).resolves.toBe(result)
  })

  test('should evaluate OR in lazy mode "TRUE || CRASH = TRUE"', () => {
    const crash = [{ argv: ['nonExistentApplication'], env: {}, execPath: '' }]

    const logical: LogicalPipeline = [TRUE, LogicalOperator.OR, crash]
    const execution = pm.logical(logical, io, env)
    return expect(execution).resolves.toBe(AppicationMainResponse.SUCCESS)
  })

  test('should evaluate AND in lazy mode "FALSE && CRASH = FALSE"', () => {
    const crash = [{ argv: ['nonExistentApplication'], env: {}, execPath: '' }]

    const logical: LogicalPipeline = [FALSE, LogicalOperator.AND, crash]
    const execution = pm.logical(logical, io, env)
    return expect(execution).resolves.toBe(AppicationMainResponse.FAILURE)
  })
})

describe.skip('.parallel()', () => {
  // let io: MockStream

  // const WAIT: Pipeline = [{ argv: ['sleep', '100'], env: {}, execPath: '' }]
  // const P1: Pipeline = [{ argv: ['echo', 'P1'], env: {}, execPath: '' }]
  // const P2: Pipeline = [{ argv: ['echo', 'P2'], env: {}, execPath: '' }]

  // beforeEach(() => {
  //   pm = new ProcessManager(new MockApplicationLoader(), {})
  //   env = { USER: 'gary', HOME: '/root/gary/' }
  //   io = new MockStream([''])
  //   io.init()
  // })

  // test('should run in parallel 2 pipelines', () => {
  //   const parallel: ParallelPipeline = [
  //     [WAIT, WAIT, P1],
  //     [P2, WAIT, WAIT],
  //   ]

  //   const execution = pm.parallel(parallel, io, env)

  //   expect(io.getStdOut()).resolves.toBe('P2')
  //   return expect(execution).resolves.toBe(AppicationMainResponse.SUCCESS)

  // })

})
*/

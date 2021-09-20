import { buildSequence, parse, SequenceElement } from './CommandParser'
import { Application, EnvironmentVariables, Process, ProcessOptions } from './models'

export class ProcessManager {

  constructor(
    public map: { [key: string]: Process } = {}
  ) {
  }

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

  async execute(option: ProcessOptions): Promise<number> {
    throw new Error('Not Implement Yet')
  }

  // TODO Tests
  async runPipeline(options: ProcessOptions[]/*, term_stdin, term_stdout, term_stderr */): Promise<number> {
    // let { stdin, stdout, stderr } = std
    const processes = options.map(option => {
      const process = this.execute(option/*, stdin=stdout*/)
      // stdin = stdout
      // stdout = new TrasformStream()
      // stderr = term_stderr
      // TODO fix asignations
      return process
    })

    const codes = await Promise.all(processes)
    return 0
  }

  // TODO: update SequenceElement class
  async run(sequence: SequenceElement[]): Promise<number> {
    if (sequence && sequence.length === 0) throw new Error('Invalid Sequence')

    let code = 0
    for (const element of sequence) {
      if (Array.isArray(element)) {
        code = await this.runPipeline(element as ProcessOptions[])
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

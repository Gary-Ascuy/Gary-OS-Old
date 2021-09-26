import bashParse, { AstScript, BashParserOptions } from 'bash-parser'

import { StandardStreamCreator } from '../stream/StandardStream'
import { EnvironmentVariables } from './EnvironmentVariables'
import { Process } from './Process'

export interface VirtualProcessManager {
  exec(script: string, io: StandardStreamCreator, system: EnvironmentVariables): Promise<number>

  execScript(script: string, io: StandardStreamCreator, system: EnvironmentVariables, options: BashParserOptions): Promise<number>
  parse(script: string, options: BashParserOptions): AstScript

  // kill(pid: string): Promise<void>
  // get(pid: string): Promise<Process>
  // getAll(): Promise<Process[]>
}

export function parseScript(script: string, options: BashParserOptions): AstScript {
  return bashParse(script, options)
}

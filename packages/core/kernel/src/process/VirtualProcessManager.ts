import bashParse, { AstScript, BashParserOptions } from 'bash-parser'

import { StandardStreamCreator } from '../stream/StandardStream'
import { EnvironmentVariables } from './EnvironmentVariables'

export interface VirtualProcessManager {
  exec(script: string, io: StandardStreamCreator, system: EnvironmentVariables): Promise<number>

  execScript(script: string, io: StandardStreamCreator, system: EnvironmentVariables, options: BashParserOptions): Promise<number>
  parse(script: string, options: BashParserOptions): AstScript
}

export function parseScript(script: string, options: BashParserOptions): AstScript {
  return bashParse(script, options)
}

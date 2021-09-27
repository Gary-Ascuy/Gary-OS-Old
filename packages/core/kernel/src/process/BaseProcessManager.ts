import { AstScript, BashParserOptions } from '@garyos/bash-parser'
import { StandardStreamCreator } from '../stream/StandardStream'
import { EnvironmentVariables } from './EnvironmentVariables'
import { VirtualProcessManager, parseScript } from './VirtualProcessManager'

export abstract class BaseProcessManager implements VirtualProcessManager {
  abstract exec(ast: AstScript, io: StandardStreamCreator, system: EnvironmentVariables): Promise<number>

  execScript(script: string, io: StandardStreamCreator, system: EnvironmentVariables, options: BashParserOptions): Promise<number> {
    const ast = this.parse(script, options)
    return this.exec(ast, io, system)
  }

  parse(script: string, options: BashParserOptions): AstScript {
    return parseScript(script, options)
  }
}

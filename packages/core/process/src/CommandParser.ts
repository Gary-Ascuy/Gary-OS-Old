import stringArgv from 'string-argv'

import { EnvironmentVariables } from './models/EnvironmentVariables'
import { ProcessOptions } from './models/Process'

export const PIPE_OPERATORS = ['|', '||', '&', '&&']
export const OPERATORS = [...PIPE_OPERATORS, '>', '>>', '<', '<<']

export function replaceEnvVariables(input: string, env: EnvironmentVariables) {
  const varNames = '[a-zA-Z_]+[a-zA-Z0-9_]*'
  const placeholders = ['\\$_', '\\${_}', '{{_}}']
  const envVars = placeholders.map((placeholder) => placeholder.replace('_', `(${varNames})`)).join('|')
  const rgEnvVars = new RegExp(envVars, 'gm')

  const match = input.matchAll(rgEnvVars)
  if (!match) return input

  const buildExpression = (match: RegExpMatchArray) => {
    const [name, key] = match.slice(0, placeholders.length + 1).filter(Boolean)
    const value = typeof env[key] === 'undefined' ? name : env[key]
    return [name, value]
  }

  const reducer = (acc: string, [name = '', value = '']: string[]) => acc.replace(name, value)
  const matches = Array.from(match).map(buildExpression).reduce(reducer, input)
  return matches
}

export function buildProcessOptions(argvs: string[], pwd: string = ''): ProcessOptions {
  const env: EnvironmentVariables = {}

  let [command, ...rest] = argvs
  while (/\w=.*/.test(command)) {
    const [key, value] = command.split(/=/)
    env[key] = value

    let [next, ...others] = rest
    command = next
    rest = others
  }

  return { argv: [command, ...rest], env, execPath: pwd }
}

/**
 * Parse command into ProcessOptions instance
 * @example
 * Basic
 * - docker run --name gary -p 80:80 -d nginx
 * - docker       run       --name     gary     -p     80:80    -d   nginx
 * - docker\trun\t--name\tgary\t-p\t80:80\t-d\tnginx
 * - docker run --name "gary" -p "80:80" -d "nginx"
 *
 * Env Variables
 * - TEST_CI=1 env --file --name
 * - TEST_CI=1 TEST_OS=2 env --file --name
 *
 * From Different Sources
 * - docker stats
 * - ./docker.gos stats
 * - https://www.online.com/artifatcs/docker/v1/application.gos stats
 *
 * Pipes
 * - cat /etc/passwd || grep -i "boo"
 * - cat /etc/passwd & grep -i "boo"
 * - CAT=off cat /etc/passwd | GREP=on grep -i "boo"
 *
 * MultiLine
 * - docker run -d -p 80:80 \
 *      --name proxy \
 *      nginx:alpine-latest
 *
 * @param lines lines from terminal.
 * @returns a list of ProcessOptions.
 */
export function parse(lines: string, pwd: string = ''): ProcessOptions[] {
  if (!lines || !lines.trim()) throw new Error('Invalid Command Line')

  const argvs = stringArgv(lines.replace(/\\\r?\n/g, ' ').replace(/\r?\n/g, ''))
  const commands: Array<string[]> = []

  let cache = []
  for (const argv of argvs) {
    if (OPERATORS.includes(argv)) {
      if (cache.length > 0) commands.push(cache)
      cache = []

      if (PIPE_OPERATORS.includes(argv)) {
        commands.push([argv])
        continue
      }
    }

    cache.push(argv)
  }

  if (cache.length > 0) commands.push(cache)
  return commands.map(command => buildProcessOptions(command, pwd))
}

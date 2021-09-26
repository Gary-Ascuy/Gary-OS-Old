import stringArgv from 'string-argv'

import { Task, Pipeline, EnvironmentVariables } from '@garyos/kernel'

export const PIPE_OPERATORS = ['|', '||', '&', '&&']

export const INPUT_REDIRECTION = ['<', '<<']
export const OUTPUT_REDIRECTION = ['>', '>>']
export const INPUT_OUTPUT_REDIRECTION = [...INPUT_REDIRECTION, ...OUTPUT_REDIRECTION]

export const OPERATORS = [...PIPE_OPERATORS, ...INPUT_OUTPUT_REDIRECTION]

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

export function buildProcessOptions(argvs: string[], pwd: string = ''): Task {
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
export function parse(lines: string, pwd: string = ''): Pipeline {
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
  const options = commands.map(command => buildProcessOptions(command, pwd))
  const resolvedOptions = replaceInputOutputRedirection(options)

  return checkSequence(resolvedOptions)
}

export function checkSequence(options: Pipeline): Pipeline {
  if (!options || options.length === 0) throw new Error('Invalid Pipeline Sequence')

  let index = 0
  for (const option of options) {
    const [cmd] = option.argv
    const isPipeOperator = PIPE_OPERATORS.includes(cmd)
    const shouldBeCmd = index % 2 === 0
    if (shouldBeCmd && isPipeOperator) throw new Error('Invalid Pipeline Sequence')
    if (!cmd) throw new Error('Command should be defined')

    ++index
  }

  // does not end with pipe operator
  const [cmd] = options[options.length - 1].argv
  if (PIPE_OPERATORS.includes(cmd)) throw new Error('Invalid Pipeline Sequence')

  return options
}

/**
 * Resolves Input and Output Redirections
 *
 * @example echo gary > gary.txt ==> echo gary | write --file gary.txt
 * @example echo gary >> gary.txt ==> echo gary | write --append --file gary.txt
 *
 * @example echo gary < gary.txt ==> echo gary | read --file gary.txt
 * @example echo gary << gary.txt ==> echo gary | read --file gary.txt
 *
 * @param options list of commands
 * @returns list of commands
 */
export function replaceInputOutputRedirection(options: Pipeline) {
  const results: Pipeline = []
  let prev: Task | undefined = undefined

  for (const option of options) {
    const [cmd, file] = option.argv

    if (OUTPUT_REDIRECTION.includes(cmd)) {
      if (!file) continue
      if (!prev) throw new Error('Invalid Pipeline Output Redirection')

      results.push({ argv: ['|'], env: { ...prev.env }, execPath: prev.execPath })
      const argv = cmd === '>>' ? ['write', '--append', '--file', file] : ['write', '--file', file]
      results.push({ argv: argv, env: { ...prev.env }, execPath: prev.execPath })
      continue
    }

    if (INPUT_REDIRECTION.includes(cmd)) {
      if (!file) continue
      if (!prev) throw new Error('Invalid Pipeline Input Redirection')
      results.pop()

      results.push({ argv: ['read', '--file', file], env: { ...prev.env }, execPath: prev.execPath })
      results.push({ argv: ['|'], env: { ...prev.env }, execPath: prev.execPath })
      results.push(prev)

      continue
    }

    prev = option
    results.push(option)
  }

  return results
}

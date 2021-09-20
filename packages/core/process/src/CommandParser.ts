import { EnvironmentVariables } from './models/EnvironmentVariables'

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

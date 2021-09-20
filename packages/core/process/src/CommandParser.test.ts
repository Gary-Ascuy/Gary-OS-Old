import { replaceEnvVariables } from './CommandParser'

describe('CommandParser.ts', () => {
  describe('.replaceEnvVariables()', () => {
    test('should replace simple varibale', () => {
      const value = replaceEnvVariables('$UNAME', { UNAME: 'gary' })
      expect(value).toBe('gary')
    })

    test('should replace same varibale many times', () => {
      const value = replaceEnvVariables('$UNAME$UNAME$UNAME', { UNAME: 'gary' })
      expect(value).toBe('garygarygary')
    })

    test('should replace more than one varibale', () => {
      const value = replaceEnvVariables('$HOME:$PATH', { HOME: '/roor/home', PATH: '/root/bin;' })
      expect(value).toBe('/roor/home:/root/bin;')
    })

    test('should replace one varibale with curly brakets', () => {
      const value = replaceEnvVariables('${HOME}:${PATH}', { HOME: '/roor/home', PATH: '/root/bin;' })
      expect(value).toBe('/roor/home:/root/bin;')
    })

    test('should replace one varibale with curly brakets', () => {
      const value = replaceEnvVariables('{{HOME}}:{{PATH}}', { HOME: '/roor/home', PATH: '/root/bin;' })
      expect(value).toBe('/roor/home:/root/bin;')
    })

    test('should keep variables without values', () => {
      const value = replaceEnvVariables('{{HOME}}:{{PATH}}', { HOME: '/roor/home' })
      expect(value).toBe('/roor/home:{{PATH}}')
    })
  })
})

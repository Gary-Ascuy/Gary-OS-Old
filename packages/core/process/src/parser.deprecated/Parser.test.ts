import { parse } from './Parser'

describe('Parser.ts', () => {
  describe('.parse()', () => {
    test('should parse a command', () => {
      const a = parse('echo test')
      console.log(JSON.stringify(a, null, 2))
    })
  })
})

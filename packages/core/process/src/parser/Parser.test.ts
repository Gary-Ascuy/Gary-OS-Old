import { parse } from './Parser'

describe('Parser.ts', () => {
  describe('.parse()', () => {
    test('should parse a command', () => {
      const a = parse('kill $(echo test)')
      console.log(JSON.stringify(a, null, 2))
    })
  })
})

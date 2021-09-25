import { buildProcessOptions, checkSequence, parse, replaceEnvVariables, replaceInputOutputRedirection } from './CommandParser'
// import { ProcessOptions } from './models'

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

  describe('.buildProcessOptions()', () => {
    test('should parse basic command', () => {
      const options = buildProcessOptions(['echo'])

      expect(options.argv).toEqual(['echo'])
      expect(options.env).toEqual({})
      expect(options.execPath).toEqual('')
    })

    test('should parse a command with env variables', () => {
      const options = buildProcessOptions(['HOME=/root/gary/', 'PATH=/root/bin/', 'echo'])

      expect(options.argv).toEqual(['echo'])
      expect(options.env).toEqual({
        HOME: '/root/gary/',
        PATH: '/root/bin/',
      })
      expect(options.execPath).toEqual('')
    })

    test('should parse a command with parameters', () => {
      const options = buildProcessOptions(['echo', 'parameter1', 'parameter2', 'parameter3'])

      expect(options.argv).toEqual(['echo', 'parameter1', 'parameter2', 'parameter3'])
      expect(options.env).toEqual({})
      expect(options.execPath).toEqual('')
    })

    test('should parse a command with parameters and env variables', () => {
      const argvs = ['USER=gary', 'PATH=/root/gary.txt', 'CUSTOM=true', 'echo', 'parameter1', 'parameter2', 'parameter3']
      const options = buildProcessOptions(argvs, '/root/gary/')

      expect(options.argv).toEqual(['echo', 'parameter1', 'parameter2', 'parameter3'])
      expect(options.env).toEqual({
        USER: 'gary',
        PATH: '/root/gary.txt',
        CUSTOM: 'true',
      })
      expect(options.execPath).toBe('/root/gary/')
    })
  })

  describe('.parse()', () => {
    test('should parse basic command', () => {
      const [options] = parse('docker run -it --rm -p 80:80 nginx')

      expect(options.argv).toEqual(['docker', 'run', '-it', '--rm', '-p', '80:80', 'nginx'])
      expect(options.env).toEqual({})
      expect(options.execPath).toBe('')
    })

    test('should parse basic command with extra spaces', () => {
      const [options] = parse('docker    run    -it   --rm    -p    80:80    nginx')

      expect(options.argv).toEqual(['docker', 'run', '-it', '--rm', '-p', '80:80', 'nginx'])
      expect(options.env).toEqual({})
      expect(options.execPath).toBe('')
    })

    test('should parse basic command with tabs', () => {
      const [options] = parse('docker\trun\t-it\t--rm\t-p\t80:80\tnginx')

      expect(options.argv).toEqual(['docker', 'run', '-it', '--rm', '-p', '80:80', 'nginx'])
      expect(options.env).toEqual({})
      expect(options.execPath).toBe('')
    })

    test('should parse basic command with escape new line', () => {
      // docker run \
      //    -it --rm \
      //    -p 80:80 nginx
      const [options] = parse('docker run \\\n-it --rm \\\r\n-p 80:80 nginx')

      expect(options.argv).toEqual(['docker', 'run', '-it', '--rm', '-p', '80:80', 'nginx'])
      expect(options.env).toEqual({})
      expect(options.execPath).toBe('')
    })

    test('should parse a command with env variables', () => {
      const [options] = parse('TEST=1 DATA=2 docker run -it --rm -p 80:80 nginx')

      expect(options.argv).toEqual(['docker', 'run', '-it', '--rm', '-p', '80:80', 'nginx'])
      expect(options.env).toEqual({ TEST: '1', DATA: '2' })
      expect(options.execPath).toBe('')
    })

    test('should parse a local command', () => {
      const [options] = parse('./docker.gos ps', '/root/gary/')

      expect(options.argv).toEqual(['./docker.gos', 'ps'])
      expect(options.env).toEqual({})
      expect(options.execPath).toBe('/root/gary/')
    })

    test('should parse a fullname command', () => {
      const [options] = parse('com.docker.cli ps')

      expect(options.argv).toEqual(['com.docker.cli', 'ps'])
      expect(options.env).toEqual({})
      expect(options.execPath).toBe('')
    })

    test('should parse a alias command', () => {
      const [options] = parse('docker ps')

      expect(options.argv).toEqual(['docker', 'ps'])
      expect(options.env).toEqual({})
      expect(options.execPath).toBe('')
    })

    test('should parse a url command', () => {
      const [options] = parse('https://docker.com/artifacts/v1/docker.gos ps')

      expect(options.argv).toEqual(['https://docker.com/artifacts/v1/docker.gos', 'ps'])
      expect(options.env).toEqual({})
      expect(options.execPath).toBe('')
    })
  })

  describe('.pipeline.parse()', () => {
    test('should parse basic piped command using single OR', () => {
      const [options, _, pipe] = parse('cat /etc/passwd | grep -i "boo"')

      expect(options.argv).toEqual(['cat', '/etc/passwd'])
      expect(options.env).toEqual({})
      expect(options.execPath).toBe('')

      expect(_.argv).toEqual(['|'])
      expect(_.env).toEqual({})
      expect(_.execPath).toBe('')

      expect(pipe.argv).toEqual(['grep', '-i', 'boo'])
      expect(pipe.env).toEqual({})
      expect(pipe.execPath).toBe('')
    })

    test('should parse basic piped command using double OR', () => {
      const [options, _, pipe] = parse('cat /etc/passwd || grep -i "boo"')

      expect(options.argv).toEqual(['cat', '/etc/passwd'])
      expect(options.env).toEqual({})
      expect(options.execPath).toBe('')

      expect(_.argv).toEqual(['||'])
      expect(_.env).toEqual({})
      expect(_.execPath).toBe('')

      expect(pipe.argv).toEqual(['grep', '-i', 'boo'])
      expect(pipe.env).toEqual({})
      expect(pipe.execPath).toBe('')
    })

    test('should parse basic piped command using single OR with env variables', () => {
      const [options, _, pipe] = parse('CAT=off cat /etc/passwd | GREP=on grep -i "boo"')

      expect(options.argv).toEqual(['cat', '/etc/passwd'])
      expect(options.env).toEqual({ CAT: 'off' })
      expect(options.execPath).toBe('')

      expect(_.argv).toEqual(['|'])
      expect(_.env).toEqual({})
      expect(_.execPath).toBe('')

      expect(pipe.argv).toEqual(['grep', '-i', 'boo'])
      expect(pipe.env).toEqual({ GREP: 'on' })
      expect(pipe.execPath).toBe('')
    })

    test('should parse basic piped command using single AND', () => {
      const [options, _, pipe] = parse('cat /etc/passwd & grep -i "boo"')

      expect(options.argv).toEqual(['cat', '/etc/passwd'])
      expect(options.env).toEqual({})
      expect(options.execPath).toBe('')

      expect(_.argv).toEqual(['&'])
      expect(_.env).toEqual({})
      expect(_.execPath).toBe('')

      expect(pipe.argv).toEqual(['grep', '-i', 'boo'])
      expect(pipe.env).toEqual({})
      expect(pipe.execPath).toBe('')
    })

    test('should parse basic piped command using double AND', () => {
      const [options, _, pipe] = parse('cat /etc/passwd && grep -i "boo"')

      expect(options.argv).toEqual(['cat', '/etc/passwd'])
      expect(options.env).toEqual({})
      expect(options.execPath).toBe('')

      expect(_.argv).toEqual(['&&'])
      expect(_.env).toEqual({})
      expect(_.execPath).toBe('')

      expect(pipe.argv).toEqual(['grep', '-i', 'boo'])
      expect(pipe.env).toEqual({})
      expect(pipe.execPath).toBe('')
    })

    test('should parse basic piped command using single AND with env variables', () => {
      const [options, _, pipe] = parse('CAT=off cat /etc/passwd & GREP=on grep -i "boo"')

      expect(options.argv).toEqual(['cat', '/etc/passwd'])
      expect(options.env).toEqual({ CAT: 'off' })
      expect(options.execPath).toBe('')

      expect(_.argv).toEqual(['&'])
      expect(_.env).toEqual({})
      expect(_.execPath).toBe('')

      expect(pipe.argv).toEqual(['grep', '-i', 'boo'])
      expect(pipe.env).toEqual({ GREP: 'on' })
      expect(pipe.execPath).toBe('')
    })

    test('should parse write command', () => {
      const [options, _, pipe] = parse('echo "Test Data" > logs.txt')

      expect(options.argv).toEqual(['echo', 'Test Data'])
      expect(options.env).toEqual({})
      expect(options.execPath).toBe('')

      expect(_.argv).toEqual(['|'])
      expect(_.env).toEqual({})
      expect(_.execPath).toBe('')

      expect(pipe.argv).toEqual(['write', '--file', 'logs.txt'])
      expect(pipe.env).toEqual({})
      expect(pipe.execPath).toBe('')
    })

    test('should parse append command', () => {
      const [options, _, pipe] = parse('echo "Test Data" >> logs.txt')

      expect(options.argv).toEqual(['echo', 'Test Data'])
      expect(options.env).toEqual({})
      expect(options.execPath).toBe('')

      expect(_.argv).toEqual(['|'])
      expect(_.env).toEqual({})
      expect(_.execPath).toBe('')

      expect(pipe.argv).toEqual(['write', '--append', '--file', 'logs.txt'])
      expect(pipe.env).toEqual({})
      expect(pipe.execPath).toBe('')
    })

    test('should parse read command', () => {
      const [pipe, _, options] = parse('source -t << logs.txt')

      expect(pipe.argv).toEqual(['read', '--file', 'logs.txt'])
      expect(pipe.env).toEqual({})
      expect(pipe.execPath).toBe('')

      expect(_.argv).toEqual(['|'])
      expect(_.env).toEqual({})
      expect(_.execPath).toBe('')

      expect(options.argv).toEqual(['source', '-t'])
      expect(options.env).toEqual({})
      expect(options.execPath).toBe('')
    })

    test('should parse read command', () => {
      const [pipe, _, options] = parse('env --export << production.env')

      expect(pipe.argv).toEqual(['read', '--file', 'production.env'])
      expect(pipe.env).toEqual({})
      expect(pipe.execPath).toBe('')

      expect(_.argv).toEqual(['|'])
      expect(_.env).toEqual({})
      expect(_.execPath).toBe('')

      expect(options.argv).toEqual(['env', '--export'])
      expect(options.env).toEqual({})
      expect(options.execPath).toBe('')
    })

    test('should parse a command with many options', () => {
      const [p1, _1, p2, _2, p3, _3, p4] = parse('env | uppercase | substring --length 2 | test --verbose')

      expect([p1, _1, p2, _2, p3, _3, p4].filter(Boolean).length).toBe(7)

      expect(_1.argv).toEqual(['|'])
      expect(_2.argv).toEqual(['|'])
      expect(_3.argv).toEqual(['|'])

      expect(p1.argv).toEqual(['env'])
      expect(p1.env).toEqual({})
      expect(p1.execPath).toBe('')

      expect(p2.argv).toEqual(['uppercase'])
      expect(p2.env).toEqual({})
      expect(p2.execPath).toBe('')

      expect(p3.argv).toEqual(['substring', '--length', '2'])
      expect(p3.env).toEqual({})
      expect(p3.execPath).toBe('')

      expect(p4.argv).toEqual(['test', '--verbose'])
      expect(p4.env).toEqual({})
      expect(p4.execPath).toBe('')
    })
  })

  describe('.replaceInputOutputRedirection()', () => {
    test('should replace ">" by pipe with write command', () => {
      const commands = replaceInputOutputRedirection([
        { argv: ['echo', 'Gary'], env: { a: 'test' }, execPath: '/b' },
        { argv: ['>', 'gary.txt'], env: {}, execPath: '' },
      ])

      expect(commands.length).toBe(3)

      const [p1, p2, p3] = commands
      expect(p1).toEqual({ argv: ['echo', 'Gary'], env: { a: 'test' }, execPath: '/b' })
      expect(p2).toEqual({ argv: ['|'], env: { a: 'test' }, execPath: '/b' })
      expect(p3).toEqual({ argv: ['write', '--file', 'gary.txt'], env: { a: 'test' }, execPath: '/b' })
    })

    test('should replace ">>" by pipe with write command with append flag', () => {
      const commands = replaceInputOutputRedirection([
        { argv: ['echo', 'Gary'], env: { a: 'test' }, execPath: '/b' },
        { argv: ['>>', 'gary.txt'], env: {}, execPath: '' },
      ])

      expect(commands.length).toBe(3)

      const [p1, p2, p3] = commands
      expect(p1).toEqual({ argv: ['echo', 'Gary'], env: { a: 'test' }, execPath: '/b' })
      expect(p2).toEqual({ argv: ['|'], env: { a: 'test' }, execPath: '/b' })
      expect(p3).toEqual({ argv: ['write', '--append', '--file', 'gary.txt'], env: { a: 'test' }, execPath: '/b' })
    })

    test('should throw an error with ">"', () => {
      expect(() => {
        const commands = replaceInputOutputRedirection([
          { argv: ['>', 'gary.txt'], env: {}, execPath: '' },
        ])
        expect(commands).toBeUndefined()
      }).toThrowError()
    })

    test('should throw an error with ">>"', () => {
      expect(() => {
        const commands = replaceInputOutputRedirection([
          { argv: ['>>', 'gary.txt'], env: {}, execPath: '' },
        ])
        expect(commands).toBeUndefined()
      }).toThrowError()
    })

    test('should omit ">" when file parameter is not defined', () => {
      const commands = replaceInputOutputRedirection([
        { argv: ['echo', 'Gary'], env: { a: 'test' }, execPath: '/b' },
        { argv: ['>'], env: {}, execPath: '' },
      ])

      expect(commands.length).toBe(1)

      const [p1] = commands
      expect(p1).toEqual({ argv: ['echo', 'Gary'], env: { a: 'test' }, execPath: '/b' })
    })

    test('should omit ">>" when file parameter is not defined', () => {
      const commands = replaceInputOutputRedirection([
        { argv: ['echo', 'Gary'], env: { a: 'test' }, execPath: '/b' },
        { argv: ['>>'], env: {}, execPath: '' },
      ])

      expect(commands.length).toBe(1)

      const [p1] = commands
      expect(p1).toEqual({ argv: ['echo', 'Gary'], env: { a: 'test' }, execPath: '/b' })
    })

    // READ
    test('should replace "<" or "<<" by pipe with read command', () => {
      const commands = replaceInputOutputRedirection([
        { argv: ['echo', 'Gary'], env: { a: 'test' }, execPath: '/b' },
        { argv: ['<', 'gary.txt'], env: {}, execPath: '' },
      ])

      expect(commands.length).toBe(3)

      const [p1, p2, p3] = commands
      expect(p1).toEqual({ argv: ['read', '--file', 'gary.txt'], env: { a: 'test' }, execPath: '/b' })
      expect(p2).toEqual({ argv: ['|'], env: { a: 'test' }, execPath: '/b' })
      expect(p3).toEqual({ argv: ['echo', 'Gary'], env: { a: 'test' }, execPath: '/b' })
    })

    test('should throw an error with "<<" or "<"', () => {
      expect(() => {
        const commands = replaceInputOutputRedirection([
          { argv: ['<<', 'gary.txt'], env: {}, execPath: '' },
        ])
        expect(commands).toBeUndefined()
      }).toThrowError()
    })

    test('should omit "<" or "<<" when file parameter is not defined', () => {
      const commands = replaceInputOutputRedirection([
        { argv: ['echo', 'Gary'], env: { a: 'test' }, execPath: '/b' },
        { argv: ['<<'], env: {}, execPath: '' },
      ])

      expect(commands.length).toBe(1)

      const [p1] = commands
      expect(p1).toEqual({ argv: ['echo', 'Gary'], env: { a: 'test' }, execPath: '/b' })
    })
  })

  describe('.checkSequence()', () => {
    test('should check a valid sequence', () => {
      const sequence = checkSequence([
        { argv: ['echo', 'test'], env: {}, execPath: '' },
      ])

      expect(sequence).toBeDefined()
      expect(sequence[0]).toEqual({ argv: ['echo', 'test'], env: {}, execPath: '' })
    })

    test('should check a valid long sequence', () => {
      const sequence = checkSequence([
        { argv: ['echo', 'test'], env: {}, execPath: '' },
        { argv: ['|'], env: {}, execPath: '' },
        { argv: ['echo', 'test'], env: {}, execPath: '' },
        { argv: ['|'], env: {}, execPath: '' },
        { argv: ['echo', 'test'], env: {}, execPath: '' },
        { argv: ['|'], env: {}, execPath: '' },
        { argv: ['echo', 'test gary'], env: {}, execPath: '' },
      ])

      expect(sequence).toBeDefined()
      expect(sequence[0]).toEqual({ argv: ['echo', 'test'], env: {}, execPath: '' })
      expect(sequence[1]).toEqual({ argv: ['|'], env: {}, execPath: '' })
      expect(sequence[6]).toEqual({ argv: ['echo', 'test gary'], env: {}, execPath: '' })
    })

    test('should throw an error with an invalid long sequence - two consecutive pipe operators', () => {
      expect(() => {
        const sequence = checkSequence([
          { argv: ['echo', 'test'], env: {}, execPath: '' },
          { argv: ['|'], env: {}, execPath: '' },
          { argv: ['|'], env: {}, execPath: '' },
          { argv: ['echo', 'test'], env: {}, execPath: '' },
          { argv: ['|'], env: {}, execPath: '' },
          { argv: ['echo', 'test gary'], env: {}, execPath: '' },
        ])

        expect(sequence).toBeDefined()
      }).toThrowError()
    })

    test('should throw an error with an invalid long sequence - two consecutive commands', () => {
      expect(() => {
        const sequence = checkSequence([
          { argv: ['echo', 'test'], env: {}, execPath: '' },
          { argv: ['|'], env: {}, execPath: '' },
          { argv: ['echo', 'test'], env: {}, execPath: '' },
          { argv: ['echo', 'test'], env: {}, execPath: '' },
          { argv: ['|'], env: {}, execPath: '' },
          { argv: ['echo', 'test gary'], env: {}, execPath: '' },
        ])

        expect(sequence).toBeDefined()
      }).toThrowError()
    })

    test('should throw an error with an invalid long sequence - start with pipe', () => {
      expect(() => {
        const sequence = checkSequence([
          { argv: ['|'], env: {}, execPath: '' },
          { argv: ['echo', 'test'], env: {}, execPath: '' },
          { argv: ['|'], env: {}, execPath: '' },
          { argv: ['echo', 'test gary'], env: {}, execPath: '' },
        ])

        expect(sequence).toBeDefined()
      }).toThrowError()
    })

    test('should throw an error with an invalid long sequence - end with pipe', () => {
      expect(() => {
        const sequence = checkSequence([
          { argv: ['echo', 'test'], env: {}, execPath: '' },
          { argv: ['|'], env: {}, execPath: '' },
          { argv: ['echo', 'test gary'], env: {}, execPath: '' },
          { argv: ['|'], env: {}, execPath: '' },
        ])

        expect(sequence).toBeDefined()
      }).toThrowError()
    })
  })

  /**describe('.buildSequence()', () => {
    test('should build a basic sequence', () => {
      const sequence = buildSequence([
        { argv: ['echo', 'test'], env: {}, execPath: '' },
      ])

      expect(sequence.length).toBe(1)
      expect((sequence[0] as Array<ProcessOptions>).length).toBe(1)
    })

    test('should build a sequence with one pipe', () => {
      const sequence = buildSequence([
        { argv: ['echo', 'test'], env: {}, execPath: '' },
        { argv: ['|'], env: {}, execPath: '' },
        { argv: ['echo', 'test gary'], env: {}, execPath: '' },
      ])

      expect(sequence.length).toBe(1)
      expect((sequence[0] as Array<ProcessOptions>).length).toBe(3)
    })

    test('should build a sequence with long pipe', () => {
      const sequence = buildSequence([
        { argv: ['echo', 'test'], env: {}, execPath: '' },
        { argv: ['|'], env: {}, execPath: '' },
        { argv: ['echo', 'test gary'], env: {}, execPath: '' },
        { argv: ['|'], env: {}, execPath: '' },
        { argv: ['echo', 'test gary'], env: {}, execPath: '' },
        { argv: ['|'], env: {}, execPath: '' },
        { argv: ['echo', 'test gary'], env: {}, execPath: '' },
        { argv: ['|'], env: {}, execPath: '' },
        { argv: ['echo', 'test gary'], env: {}, execPath: '' },
      ])

      expect(sequence.length).toBe(1)
      expect((sequence[0] as Array<ProcessOptions>).length).toBe(9)
    })


    test('should build a sequence with long pipe and one logical operator', () => {
      const sequence = buildSequence([
        { argv: ['echo', 'test'], env: {}, execPath: '' },
        { argv: ['|'], env: {}, execPath: '' },
        { argv: ['echo', 'test gary'], env: {}, execPath: '' },
        { argv: ['&&'], env: {}, execPath: '' },
        { argv: ['echo', 'test gary'], env: {}, execPath: '' },
        { argv: ['|'], env: {}, execPath: '' },
        { argv: ['echo', 'test gary'], env: {}, execPath: '' },
        { argv: ['|'], env: {}, execPath: '' },
        { argv: ['echo', 'test gary'], env: {}, execPath: '' },
      ])

      expect(sequence.length).toBe(3)

      const [p1, _, p2] = sequence
      expect((p1 as Array<ProcessOptions>).length).toBe(3)
      expect(_).toEqual({ argv: ['&&'], env: {}, execPath: '' })
      expect((p2 as Array<ProcessOptions>).length).toBe(5)
    })

    test('should build a sequence with long pipe and two logical operator', () => {
      const sequence = buildSequence([
        { argv: ['echo', 'test'], env: {}, execPath: '' },
        { argv: ['|'], env: {}, execPath: '' },
        { argv: ['echo', 'test gary'], env: {}, execPath: '' },
        { argv: ['&&'], env: {}, execPath: '' },
        { argv: ['echo', 'test gary'], env: {}, execPath: '' },
        { argv: ['|'], env: {}, execPath: '' },
        { argv: ['echo', 'test gary'], env: {}, execPath: '' },
        { argv: ['||'], env: {}, execPath: '' },
        { argv: ['echo', 'test gary'], env: {}, execPath: '' },
      ])

      expect(sequence.length).toBe(5)

      const [p1, _1, p2, _2, p3] = sequence

      expect((p1 as Array<ProcessOptions>).length).toBe(3)
      expect(_1).toEqual({ argv: ['&&'], env: {}, execPath: '' })
      expect((p2 as Array<ProcessOptions>).length).toBe(3)
      expect(_2).toEqual({ argv: ['||'], env: {}, execPath: '' })
      expect((p3 as Array<ProcessOptions>).length).toBe(1)
    })
  }) */
})

import { buildProcessOptions, parse, replaceEnvVariables } from './CommandParser'

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
      const [options, pipe] = parse('echo "Test Data" > logs.txt')

      expect(options.argv).toEqual(['echo', 'Test Data'])
      expect(options.env).toEqual({})
      expect(options.execPath).toBe('')

      expect(pipe.argv).toEqual(['>', 'logs.txt'])
      expect(pipe.env).toEqual({})
      expect(pipe.execPath).toBe('')
    })

    test('should parse append command', () => {
      const [options, pipe] = parse('echo "Test Data" >> logs.txt')

      expect(options.argv).toEqual(['echo', 'Test Data'])
      expect(options.env).toEqual({})
      expect(options.execPath).toBe('')

      expect(pipe.argv).toEqual(['>>', 'logs.txt'])
      expect(pipe.env).toEqual({})
      expect(pipe.execPath).toBe('')
    })

    test('should parse read command', () => {
      const [options, pipe] = parse('source -t << logs.txt')

      expect(options.argv).toEqual(['source', '-t'])
      expect(options.env).toEqual({})
      expect(options.execPath).toBe('')

      expect(pipe.argv).toEqual(['<<', 'logs.txt'])
      expect(pipe.env).toEqual({})
      expect(pipe.execPath).toBe('')
    })

    test('should parse read command', () => {
      const [options, pipe] = parse('env --export << production.env')

      expect(options.argv).toEqual(['env', '--export'])
      expect(options.env).toEqual({})
      expect(options.execPath).toBe('')

      expect(pipe.argv).toEqual(['<<', 'production.env'])
      expect(pipe.env).toEqual({})
      expect(pipe.execPath).toBe('')
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
})

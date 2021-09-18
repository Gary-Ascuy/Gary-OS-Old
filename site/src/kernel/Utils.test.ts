import { parseProcessOptions, replaceEnvVariables } from './Utils'

export default describe('Utils.ts', () => {
  describe('.build()', () => {
    test('should parse basic command', () => {
      const [options] = parseProcessOptions('docker run -it --rm -p 80:80 nginx')

      expect(options.command).toBe('docker')
      expect(options.arguments).toEqual(['run', '-it', '--rm', '-p', '80:80', 'nginx'])
      expect(options.env).toEqual({})
    })

    test('should parse basic command with extra spaces', () => {
      const [options] = parseProcessOptions('docker    run    -it   --rm    -p    80:80    nginx')

      expect(options.command).toBe('docker')
      expect(options.arguments).toEqual(['run', '-it', '--rm', '-p', '80:80', 'nginx'])
      expect(options.env).toEqual({})
    })

    test('should parse basic command with tabs', () => {
      const [options] = parseProcessOptions('docker\trun\t-it\t--rm\t-p\t80:80\tnginx')

      expect(options.command).toBe('docker')
      expect(options.arguments).toEqual(['run', '-it', '--rm', '-p', '80:80', 'nginx'])
      expect(options.env).toEqual({})
    })

    test('should parse basic command with escape new line', () => {
      // docker run \
      //    -it --rm \
      //    -p 80:80 nginx
      const [options] = parseProcessOptions('docker run \\\n-it --rm \\\r\n-p 80:80 nginx')

      expect(options.command).toBe('docker')
      expect(options.arguments).toEqual(['run', '-it', '--rm', '-p', '80:80', 'nginx'])
      expect(options.env).toEqual({})
    })

    test('should parse a command with env variables', () => {
      const [options] = parseProcessOptions('TEST=1 DATA=2 docker run -it --rm -p 80:80 nginx')

      expect(options.command).toBe('docker')
      expect(options.arguments).toEqual(['run', '-it', '--rm', '-p', '80:80', 'nginx'])
      expect(options.env).toEqual({ TEST: '1', DATA: '2' })
    })

    test('should parse a local command', () => {
      const [options] = parseProcessOptions('./docker.gos ps')

      expect(options.command).toBe('./docker.gos')
      expect(options.arguments).toEqual(['ps'])
      expect(options.env).toEqual({})
    })

    test('should parse a fullname command', () => {
      const [options] = parseProcessOptions('com.docker.cli ps')

      expect(options.command).toBe('com.docker.cli')
      expect(options.arguments).toEqual(['ps'])
      expect(options.env).toEqual({})
    })

    test('should parse a alias command', () => {
      const [options] = parseProcessOptions('docker ps')

      expect(options.command).toBe('docker')
      expect(options.arguments).toEqual(['ps'])
      expect(options.env).toEqual({})
    })

    test('should parse a url command', () => {
      const [options] = parseProcessOptions('https://myserver.docker.com/artifacts/v1/docker.gos ps')

      expect(options.command).toBe('https://myserver.docker.com/artifacts/v1/docker.gos')
      expect(options.arguments).toEqual(['ps'])
      expect(options.env).toEqual({})
    })
  })

  describe('.parseProcessOptions()', () => {
    test('should parse basic piped command using single OR', () => {
      const [options, _, pipe] = parseProcessOptions('cat /etc/passwd | grep -i "boo"')

      expect(options.command).toBe('cat')
      expect(options.arguments).toEqual(['/etc/passwd'])
      expect(options.env).toEqual({})

      expect(pipe.command).toBe('grep')
      expect(pipe.arguments).toEqual(['-i', 'boo'])
      expect(pipe.env).toEqual({})
    })

    test('should parse basic piped command using double OR', () => {
      const [options, _, pipe] = parseProcessOptions('cat /etc/passwd || grep -i "boo"')

      expect(options.command).toBe('cat')
      expect(options.arguments).toEqual(['/etc/passwd'])
      expect(options.env).toEqual({})

      expect(pipe.command).toBe('grep')
      expect(pipe.arguments).toEqual(['-i', 'boo'])
      expect(pipe.env).toEqual({})
    })

    test('should parse basic piped command using single OR with env variables', () => {
      const [options, _, pipe] = parseProcessOptions('CAT=off cat /etc/passwd | GREP=on grep -i "boo"')

      expect(options.command).toBe('cat')
      expect(options.arguments).toEqual(['/etc/passwd'])
      expect(options.env).toEqual({ CAT: 'off' })

      expect(pipe.command).toBe('grep')
      expect(pipe.arguments).toEqual(['-i', 'boo'])
      expect(pipe.env).toEqual({ GREP: 'on' })
    })

    test('should parse basic piped command using single AND', () => {
      const [options, _, pipe] = parseProcessOptions('cat /etc/passwd & grep -i "boo"')

      expect(options.command).toBe('cat')
      expect(options.arguments).toEqual(['/etc/passwd'])
      expect(options.env).toEqual({})

      expect(pipe.command).toBe('grep')
      expect(pipe.arguments).toEqual(['-i', 'boo'])
      expect(pipe.env).toEqual({})
    })

    test('should parse basic piped command using double AND', () => {
      const [options, _, pipe] = parseProcessOptions('cat /etc/passwd && grep -i "boo"')

      expect(options.command).toBe('cat')
      expect(options.arguments).toEqual(['/etc/passwd'])
      expect(options.env).toEqual({})
      expect(pipe.command).toBe('grep')
      expect(pipe.arguments).toEqual(['-i', 'boo'])
      expect(pipe.env).toEqual({})
    })

    test('should parse basic piped command using single AND with env variables', () => {
      const [options, _, pipe] = parseProcessOptions('CAT=off cat /etc/passwd & GREP=on grep -i "boo"')

      expect(options.command).toBe('cat')
      expect(options.arguments).toEqual(['/etc/passwd'])
      expect(options.env).toEqual({ CAT: 'off' })

      expect(pipe.command).toBe('grep')
      expect(pipe.arguments).toEqual(['-i', 'boo'])
      expect(pipe.env).toEqual({ GREP: 'on' })
    })

    test('should parse write command', () => {
      const [options, pipe] = parseProcessOptions('echo "Test Data" > logs.txt')

      expect(options.command).toBe('echo')
      expect(options.arguments).toEqual(['Test Data'])
      expect(options.env).toEqual({})

      expect(pipe.command).toBe('>')
      expect(pipe.arguments).toEqual(['logs.txt'])
      expect(pipe.env).toEqual({})
    })

    test('should parse append command', () => {
      const [options, pipe] = parseProcessOptions('echo "Test Data" >> logs.txt')

      expect(options.command).toBe('echo')
      expect(options.arguments).toEqual(['Test Data'])
      expect(options.env).toEqual({})

      expect(pipe.command).toBe('>>')
      expect(pipe.arguments).toEqual(['logs.txt'])
      expect(pipe.env).toEqual({})
    })

    test('should parse read command', () => {
      const [options, pipe] = parseProcessOptions('source -t << logs.txt')

      expect(options.command).toBe('source')
      expect(options.arguments).toEqual(['-t'])
      expect(options.env).toEqual({})

      expect(pipe.command).toBe('<<')
      expect(pipe.arguments).toEqual(['logs.txt'])
      expect(pipe.env).toEqual({})
    })

    test('should parse read command', () => {
      const [options, pipe] = parseProcessOptions('env --export << production.env')

      expect(options.command).toBe('env')
      expect(options.arguments).toEqual(['--export'])
      expect(options.env).toEqual({})

      expect(pipe.command).toBe('<<')
      expect(pipe.arguments).toEqual(['production.env'])
      expect(pipe.env).toEqual({})
    })
  })

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

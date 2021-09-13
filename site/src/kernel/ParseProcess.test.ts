import { parse } from './Process'

export default describe('ParseProcess.ts', () => {
  describe('.build()', () => {
    test('should parse basic command', () => {
      const [options] = parse('docker run -it --rm -p 80:80 nginx')

      expect(options.command).toBe('docker')
      expect(options.arguments).toEqual(['run', '-it', '--rm', '-p', '80:80', 'nginx'])
      expect(options.env).toEqual({})
    })

    test('should parse basic command with extra spaces', () => {
      const [options] = parse('docker    run    -it   --rm    -p    80:80    nginx')

      expect(options.command).toBe('docker')
      expect(options.arguments).toEqual(['run', '-it', '--rm', '-p', '80:80', 'nginx'])
      expect(options.env).toEqual({})
    })

    test('should parse basic command with tabs', () => {
      const [options] = parse('docker\trun\t-it\t--rm\t-p\t80:80\tnginx')

      expect(options.command).toBe('docker')
      expect(options.arguments).toEqual(['run', '-it', '--rm', '-p', '80:80', 'nginx'])
      expect(options.env).toEqual({})
    })

    test('should parse basic command with escape new line', () => {
      // docker run \
      //    -it --rm \
      //    -p 80:80 nginx
      const [options] = parse('docker run \\\n-it --rm \\\r\n-p 80:80 nginx')

      expect(options.command).toBe('docker')
      expect(options.arguments).toEqual(['run', '-it', '--rm', '-p', '80:80', 'nginx'])
      expect(options.env).toEqual({})
    })

    test('should parse a command with env variables', () => {
      const [options] = parse('TEST=1 DATA=2 docker run -it --rm -p 80:80 nginx')

      expect(options.command).toBe('docker')
      expect(options.arguments).toEqual(['run', '-it', '--rm', '-p', '80:80', 'nginx'])
      expect(options.env).toEqual({ TEST: '1', DATA: '2' })
    })

    test('should parse a local command', () => {
      const [options] = parse('./docker.gos ps')

      expect(options.command).toBe('./docker.gos')
      expect(options.arguments).toEqual(['ps'])
      expect(options.env).toEqual({})
    })

    test('should parse a fullname command', () => {
      const [options] = parse('com.docker.cli ps')

      expect(options.command).toBe('com.docker.cli')
      expect(options.arguments).toEqual(['ps'])
      expect(options.env).toEqual({})
    })

    test('should parse a alias command', () => {
      const [options] = parse('docker ps')

      expect(options.command).toBe('docker')
      expect(options.arguments).toEqual(['ps'])
      expect(options.env).toEqual({})
    })

    test('should parse a url command', () => {
      const [options] = parse('https://myserver.docker.com/artifacts/v1/docker.gos ps')

      expect(options.command).toBe('https://myserver.docker.com/artifacts/v1/docker.gos')
      expect(options.arguments).toEqual(['ps'])
      expect(options.env).toEqual({})
    })
  })

  describe('.parse()', () => {
    test('should parse basic piped command using single OR', () => {
      const [options, _, pipe] = parse('cat /etc/passwd | grep -i "boo"')

      expect(options.command).toBe('cat')
      expect(options.arguments).toEqual(['/etc/passwd'])
      expect(options.env).toEqual({})

      expect(pipe.command).toBe('grep')
      expect(pipe.arguments).toEqual(['-i', 'boo'])
      expect(pipe.env).toEqual({})
    })

    test('should parse basic piped command using double OR', () => {
      const [options, _, pipe] = parse('cat /etc/passwd || grep -i "boo"')

      expect(options.command).toBe('cat')
      expect(options.arguments).toEqual(['/etc/passwd'])
      expect(options.env).toEqual({})

      expect(pipe.command).toBe('grep')
      expect(pipe.arguments).toEqual(['-i', 'boo'])
      expect(pipe.env).toEqual({})
    })

    test('should parse basic piped command using single OR with env variables', () => {
      const [options, _, pipe] = parse('CAT=off cat /etc/passwd | GREP=on grep -i "boo"')

      expect(options.command).toBe('cat')
      expect(options.arguments).toEqual(['/etc/passwd'])
      expect(options.env).toEqual({ CAT: 'off' })

      expect(pipe.command).toBe('grep')
      expect(pipe.arguments).toEqual(['-i', 'boo'])
      expect(pipe.env).toEqual({ GREP: 'on' })
    })

    test('should parse basic piped command using single AND', () => {
      const [options, _, pipe] = parse('cat /etc/passwd & grep -i "boo"')

      expect(options.command).toBe('cat')
      expect(options.arguments).toEqual(['/etc/passwd'])
      expect(options.env).toEqual({})

      expect(pipe.command).toBe('grep')
      expect(pipe.arguments).toEqual(['-i', 'boo'])
      expect(pipe.env).toEqual({})
    })

    test('should parse basic piped command using double AND', () => {
      const [options, _, pipe] = parse('cat /etc/passwd && grep -i "boo"')

      expect(options.command).toBe('cat')
      expect(options.arguments).toEqual(['/etc/passwd'])
      expect(options.env).toEqual({})

      expect(pipe.command).toBe('grep')
      expect(pipe.arguments).toEqual(['-i', 'boo'])
      expect(pipe.env).toEqual({})
    })

    test('should parse basic piped command using single AND with env variables', () => {
      const [options, _, pipe] = parse('CAT=off cat /etc/passwd & GREP=on grep -i "boo"')

      expect(options.command).toBe('cat')
      expect(options.arguments).toEqual(['/etc/passwd'])
      expect(options.env).toEqual({ CAT: 'off' })

      expect(pipe.command).toBe('grep')
      expect(pipe.arguments).toEqual(['-i', 'boo'])
      expect(pipe.env).toEqual({ GREP: 'on' })
    })

    test('should parse write command', () => {
      const [options, pipe] = parse('echo "Test Data" > logs.txt')

      expect(options.command).toBe('echo')
      expect(options.arguments).toEqual(['Test Data'])
      expect(options.env).toEqual({})

      expect(pipe.command).toBe('>')
      expect(pipe.arguments).toEqual(['logs.txt'])
      expect(pipe.env).toEqual({})
    })

    test('should parse append command', () => {
      const [options, pipe] = parse('echo "Test Data" >> logs.txt')

      expect(options.command).toBe('echo')
      expect(options.arguments).toEqual(['Test Data'])
      expect(options.env).toEqual({})

      expect(pipe.command).toBe('>>')
      expect(pipe.arguments).toEqual(['logs.txt'])
      expect(pipe.env).toEqual({})
    })

    test('should parse read command', () => {
      const [options, pipe] = parse('source -t << logs.txt')

      expect(options.command).toBe('source')
      expect(options.arguments).toEqual(['-t'])
      expect(options.env).toEqual({})

      expect(pipe.command).toBe('<<')
      expect(pipe.arguments).toEqual(['logs.txt'])
      expect(pipe.env).toEqual({})
    })

    test('should parse read command', () => {
      const [options, pipe] = parse('env --export << production.env')

      expect(options.command).toBe('env')
      expect(options.arguments).toEqual(['--export'])
      expect(options.env).toEqual({})

      expect(pipe.command).toBe('<<')
      expect(pipe.arguments).toEqual(['production.env'])
      expect(pipe.env).toEqual({})
    })
  })
})

// import { Command } from "@garyos/commander"

export const version = 'v1.0.0'
export const versions = { gnode: version }

export const arch = 'x64'
export const platform = 'garyos'

export const release = {
  name: 'gnode',
  sourceUrl: 'https://github.com/Gary-Ascuy/Gary-OS',
  headersUrl: 'https://github.com/Gary-Ascuy/Gary-OS'
}

export function getSystemEnvs(): EnvironmentVariables {
  return {
    PATH: 'local',
    HOME: '/root/gary',
  }
}

export interface EnvironmentVariables {
  [key: string]: string
}

export function getProcess(localEnvs: EnvironmentVariables) {
  const env = { ...getSystemEnvs(), ...localEnvs }
  const argv = ['/Users/gary/.nvm/versions/node/v1.0.0/bin/gnode']

  // Process implementation
  const process = {
    version, versions, arch, platform, release,
    env, argv,

    // functions
    __starttime: new Date().getTime(),
    uptime: () => (0.0 + new Date().getTime() - process.__starttime) / 1000.0,
    exit: (code: number) => console.log(code),
  }

  // Streams Implementation
  // process.stdout
  // process.stdin
  // process.stderr
  // isRaw: true,
  // isTTY: true
  // name: gnode, argv0: gnode, execArgv: []
  // PID HOW???
  // ppid

  // stdout: [Getter],
  // stdin: [Getter],
  // stderr: [Getter],
  // abort: [Function: abort],
  // umask: [Function: wrappedUmask],
  // chdir: [Function (anonymous)],
  // cwd: [Function: wrappedCwd],

  // reallyExit: [Function: reallyExit],
  // _kill: [Function: _kill],
  // cpuUsage: [Function: cpuUsage],
  // resourceUsage: [Function: resourceUsage],
  // memoryUsage: [Function: memoryUsage] { rss: [Function: rss] },
  // kill: [Function: kill],
  // exit: [Function: exit],
  // openStdin: [Function (anonymous)],

  // domain: [Getter/Setter],

  /// ACCESO A SERVICIOS ( API, DISTRIBUTED OOS )


  return process
}

// spawn('setTimeout(() => console.log(process.uptime()), 2000)', console)
export function spawn(program = '', __console: any) {
  let process = getProcess({ DB_SYSTEM: 'test' })
  let __output = __console
  let console = {
    log: (...args: any) => __output.log('START', ...args, 'END'),
  }

  eval(program)
}

export function gnodeProgram() {
  //   const program = new Command()
  //   program.name('explore')
  //     .option('-d, --debug', 'output extra debugging')
  //     .option('-s, --small', 'small pizza size')
  //     .option('-p, --pizza-type <type>', 'flavour of pizza')

  //   program.parse(['/Users/gary/.nvm/versions/node/v15.8.0/bin/node'])

  // <pre style={{ position: 'fixed', top: '60px', left: '10px', color: 'white' }}>
  //   {program.helpInformation()}
  //   {program.help()}
  // </pre>
}

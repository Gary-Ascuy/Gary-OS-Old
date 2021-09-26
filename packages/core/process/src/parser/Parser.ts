import bashParser from 'bash-parser'

export function parse(expresion: string) {
  const gary = bashParser(expresion, {
    // execCommand(cmd: any) { // A=$(echo gary)
    //   console.log('gary')
    //   return cmd
    // },
    // resolveEnv: () => '777777777777777',
    // resolveHomeUser: () => 'asdasd',
    // resolvePath: (path) => `/ROT/GARY/${path}`,

    // resolveAlias(a: string) {
    //   return '66666666666666'
    // },
  })
  return gary
}

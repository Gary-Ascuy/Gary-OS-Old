declare module 'bash-parser' {
  export interface BashParserOptions {
    insertLOC?: boolean
    resolveAlias?: (name: string) => string
    resolveEnv?: (name: string) => string
    resolvePath?: (text: string) => string
    resolveHomeUser?: (username: string) => string
    resolveParameter?: (parameterAST: any) => string
    execCommand?: (cmdAST: any) => string
    execShellScript?: (scriptAST: any) => string
    runArithmeticExpression?: (arithmeticAST: any) => string
  }

  export type AstScript = any

  export default (text: string, options?: Options) => AstScript;
}

export interface ApplicationAuthor {
  name: string
  email: string
}

export enum ApplicationType {
  Terminal = 'terminal',
  Window = 'window',
}

export interface ApplicationMedatada {
  name: string
  version: string

  icon: string
  source: string

  authors: ApplicationAuthor[]
}

export interface BaseApplication {
  type: ApplicationType
  metadata: ApplicationMedatada
}

export interface TerminalApplication extends BaseApplication {
  main: (context: any) => Promise<number>
}

export interface WindowApplication extends BaseApplication {
  view: JSX.Element
}

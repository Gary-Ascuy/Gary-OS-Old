export interface ApplicationAuthor {
  name: string
  email: string
}

export enum ApplicationType {
  Terminal = 'terminal',
  Window = 'window',
}

export interface ApplicationMedatada {
  identifier: string
  name: string
  version: string
  description?: string

  icon?: string
  source?: string

  authors: ApplicationAuthor[]
}

export interface BaseApplication {
  type: ApplicationType
  metadata: ApplicationMedatada
}

export type AppicationMainFunction<T> = (context: any) => Promise<T>

export interface TerminalApplication extends BaseApplication {
  main: AppicationMainFunction<number>
}

export interface WindowApplication extends BaseApplication {
  view: JSX.Element
}

export type ApplicationOptions = WindowApplication | TerminalApplication

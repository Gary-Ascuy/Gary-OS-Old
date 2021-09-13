import Kernel from "../Kernel"
import { Process } from "../models/Process"

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

export interface ApplicationContext {
  pid: string
  process: Process
  kernel: Kernel
}

export type AppicationMainFunction = (context: ApplicationContext) => Promise<number>

export interface TerminalApplication extends BaseApplication {
  main: AppicationMainFunction
}

export interface WindowApplication extends BaseApplication {
  view: JSX.Element
}

export type ApplicationOptions = WindowApplication | TerminalApplication

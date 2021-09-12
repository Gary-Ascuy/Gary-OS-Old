import { WindowApplication, TerminalApplication, ApplicationType } from '../options/ApplicationOptions'

export interface Application {
  aid: string
  type: ApplicationType

  options: WindowApplication | TerminalApplication
}

import { ApplicationOptions, ApplicationType } from '../options/ApplicationOptions'

export interface Application {
  aid: string
  type: ApplicationType

  options: ApplicationOptions
}

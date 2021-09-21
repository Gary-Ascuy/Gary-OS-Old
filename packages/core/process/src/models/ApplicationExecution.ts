import { ReactElement } from 'react'
import { ApplicationContext } from './ApplicationContext'
import { ApplicationType } from './ApplicationType'

export enum AppicationMainResponse { SUCCESS = 0, ERROR = -1, FAILURE = 1 }
export type AppicationMainFunction = (context: ApplicationContext) => Promise<number>
export type AppicationMainView = ReactElement<ApplicationContext, any>

export interface ApplicationExecution {
  type: ApplicationType
  main: AppicationMainFunction
  view?: AppicationMainView
}

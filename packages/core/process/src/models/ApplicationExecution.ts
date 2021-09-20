import { ReactElement } from 'react'
import { ApplicationContext } from './ApplicationContext'
import { ApplicationType } from './ApplicationType'

export type AppicationMainFunction = (context: ApplicationContext) => Promise<number>
export type AppicationMainView = ReactElement<ApplicationContext, any>

export interface ApplicationExecution {
  type: ApplicationType
  main: AppicationMainFunction | AppicationMainView
}

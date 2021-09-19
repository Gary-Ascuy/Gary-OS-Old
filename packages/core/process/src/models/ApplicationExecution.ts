import { ApplicationType } from './ApplicationType'
import { HTMLAttributes, ReactElement } from 'react'
import React from 'react'

export interface Process {
}

export interface ApplicationContext {
  pid: string
  process: Process
}

export type AppicationMainFunction = (context: ApplicationContext) => Promise<number>
export type AppicationMainView = React.ReactElement<ApplicationContext, any>

export interface ApplicationExecution {
  type: ApplicationType
  main: AppicationMainFunction | AppicationMainView
}

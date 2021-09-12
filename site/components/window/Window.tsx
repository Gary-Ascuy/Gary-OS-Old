import WindowHeader from './WindowHeader'
import style from './Window.module.css'
import { useState } from 'react'

export interface WindowProps {
  title?: string
  children?: JSX.Element | JSX.Element[]
}

export default function WindowProps({ title, children }: WindowProps): JSX.Element {
  return (
    <section className={style.window}>
      <WindowHeader title={title}></WindowHeader>

      <section className={style.body}>
        {children}
      </section>
    </section>
  )
}

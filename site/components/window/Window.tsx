import { useMemo } from 'react'

import WindowHeader from './WindowHeader'

import { WindowOption, Box } from '../../src/view/WindowOption'
import style from './Window.module.css'

export interface WindowProps extends WindowOption {
  children?: JSX.Element | JSX.Element[]
}

export function getDefafaultBox(): Box {
  return { x: 100, y: 100, width: 750, height: 400 }
}

export default function WindowProps({ title, box, children }: WindowProps): JSX.Element {
  const { x, y, width, height } = useMemo(() => box || getDefafaultBox(), [box])

  return (
    <section style={{ left: y, top: y, width, height }} className={style.window}>
      <WindowHeader title={title}></WindowHeader>

      <section className={style.body}>
        {children}
      </section>
    </section>
  )
}

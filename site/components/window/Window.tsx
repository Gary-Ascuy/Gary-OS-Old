import WindowHeader from './WindowHeader'
import style from './Window.module.css'
import { useState } from 'react'

export default function BasicWindow(): JSX.Element {
  const [value, setValue] = useState('gary @Garys-MacBook-Pro site % ')

  return (
    <section className={style.window}>
      <WindowHeader></WindowHeader>
      <section className={style.body}>
        <textarea className={style.input} value={value} onChange={(event) => setValue(event.target.value)}>
        </textarea>
      </section>
    </section>
  )
}

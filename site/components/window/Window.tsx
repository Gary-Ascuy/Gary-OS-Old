import WindowHeader from './WindowHeader'
import style from './Window.module.css'

export default function BasicWindow(): JSX.Element {
  return (
    <section className={style.window}>
      <WindowHeader></WindowHeader>
      <section className={style.body}>
        <textarea className={style.input}>
          gary @Garys-MacBook-Pro site %&nbsp;
        </textarea>
      </section>
    </section>
  )
}

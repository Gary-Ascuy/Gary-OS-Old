import { DockOption } from "../../src/core/DockOption"
import DockItem from "./DockItem"

import style from './Dock.module.css'

export interface DockProps {
  items: DockOption[]
}

export default function Dock({ items }: DockProps): JSX.Element {
  return (
    <section className={style.dock}>
      <section className={style.container}>
        {items.map((item) => <DockItem key={item.id} {...item} />)}
      </section>
    </section>
  )
}

import { MenuOption } from "../../src/core/MenuOption"
import MenuItem from "./MenuItem"

import style from './Menu.module.css'
import Clock from "./Clock"

export interface MenuProps {
  items: MenuOption[]
}

export default function Menu({ items }: MenuProps): JSX.Element {
  return (
    <header className={style.menu}>
      <section className={style.section}>
        {items.map((item) => <MenuItem key={item.id} {...item}></MenuItem>)}
      </section>

      <section style={{ flex: 'auto' }}></section>

      <section className={style.section}>
        <Clock></Clock>
      </section>
    </header>
  )

}
